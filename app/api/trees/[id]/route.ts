import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FamilyTree } from '@/models/FamilyTree';
import { Member } from '@/models/Member';
import { Relationship } from '@/models/Relationship';
import { getAuthUser } from '@/lib/auth';
import { sanitizeString } from '@/lib/validation';

type Params = { params: Promise<{ id: string }> };

async function checkAccess(treeId: string, userId: string, requireOwner = false) {
  const tree = await FamilyTree.findById(treeId);
  if (!tree) return null;
  const isOwner = tree.owner.toString() === userId;
  const isCollaborator = tree.collaborators.map(String).includes(userId);
  if (requireOwner && !isOwner) return null;
  if (!isOwner && !isCollaborator && !tree.isPublic) return null;
  return tree;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(req);
    const { id } = await params;
    await connectDB();

    const tree = await FamilyTree.findById(id);
    if (!tree) return NextResponse.json({ error: 'Tree not found' }, { status: 404 });

    const isOwner = auth && tree.owner.toString() === auth.userId;
    const isCollaborator = auth && tree.collaborators.map(String).includes(auth.userId);
    if (!tree.isPublic && !isOwner && !isCollaborator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [members, relationships] = await Promise.all([
      Member.find({ treeId: id }).lean(),
      Relationship.find({ treeId: id }).lean(),
    ]);

    return NextResponse.json({ success: true, data: { tree, members, relationships } });
  } catch (error) {
    console.error('GET /api/trees/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const tree = await checkAccess(id, auth.userId, true);
    if (!tree) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });

    const body = await req.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = sanitizeString(body.name);
    if (body.description !== undefined) updates.description = sanitizeString(body.description);
    if (body.isPublic !== undefined) updates.isPublic = Boolean(body.isPublic);

    const updated = await FamilyTree.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/trees/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const tree = await checkAccess(id, auth.userId, true);
    if (!tree) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });

    await Promise.all([
      FamilyTree.findByIdAndDelete(id),
      Member.deleteMany({ treeId: id }),
      Relationship.deleteMany({ treeId: id }),
    ]);

    return NextResponse.json({ success: true, message: 'Tree deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/trees/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
