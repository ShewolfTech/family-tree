import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FamilyTree } from '@/models/FamilyTree';
import { Relationship } from '@/models/Relationship';
import { getAuthUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

async function checkTreeAccess(treeId: string, userId: string) {
  const tree = await FamilyTree.findById(treeId);
  if (!tree) return null;
  const isOwner = tree.owner.toString() === userId;
  const isCollaborator = tree.collaborators.map(String).includes(userId);
  if (!isOwner && !isCollaborator) return null;
  return tree;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(req);
    const { id } = await params;
    await connectDB();

    const tree = await FamilyTree.findById(id);
    if (!tree) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isOwner = auth && tree.owner.toString() === auth.userId;
    const isCollab = auth && tree.collaborators.map(String).includes(auth.userId);
    if (!tree.isPublic && !isOwner && !isCollab) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const relationships = await Relationship.find({ treeId: id }).lean();
    return NextResponse.json({ success: true, data: relationships });
  } catch (error) {
    console.error('GET relationships error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const tree = await checkTreeAccess(id, auth.userId);
    if (!tree) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { type, sourceId, targetId, startDate, endDate, notes } = body;

    if (!type || !sourceId || !targetId) {
      return NextResponse.json({ error: 'type, sourceId, targetId are required' }, { status: 400 });
    }

    const validTypes = ['parent-child', 'spouse', 'sibling'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid relationship type' }, { status: 400 });
    }

    if (sourceId === targetId) {
      return NextResponse.json({ error: 'Cannot create relationship with same member' }, { status: 400 });
    }

    // Check for duplicate
    const existing = await Relationship.findOne({ treeId: id, type, sourceId, targetId });
    if (existing) {
      return NextResponse.json({ error: 'Relationship already exists' }, { status: 409 });
    }

    const relationship = await Relationship.create({
      treeId: id,
      type,
      sourceId,
      targetId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      notes: notes || undefined,
    });

    return NextResponse.json({ success: true, data: relationship }, { status: 201 });
  } catch (error) {
    console.error('POST relationship error:', error);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'Relationship already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const tree = await checkTreeAccess(id, auth.userId);
    if (!tree) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const relationshipId = searchParams.get('relationshipId');
    if (!relationshipId) {
      return NextResponse.json({ error: 'relationshipId query param required' }, { status: 400 });
    }

    await Relationship.findOneAndDelete({ _id: relationshipId, treeId: id });
    return NextResponse.json({ success: true, message: 'Relationship deleted' });
  } catch (error) {
    console.error('DELETE relationship error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
