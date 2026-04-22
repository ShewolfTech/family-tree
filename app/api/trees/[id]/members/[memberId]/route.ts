import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FamilyTree } from '@/models/FamilyTree';
import { Member } from '@/models/Member';
import { Relationship } from '@/models/Relationship';
import { getAuthUser } from '@/lib/auth';
import { sanitizeString } from '@/lib/validation';

type Params = { params: Promise<{ id: string; memberId: string }> };

async function checkTreeAccess(treeId: string, userId: string) {
  const tree = await FamilyTree.findById(treeId);
  if (!tree) return null;
  const isOwner = tree.owner.toString() === userId;
  const isCollaborator = tree.collaborators.map(String).includes(userId);
  if (!isOwner && !isCollaborator) return null;
  return tree;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, memberId } = await params;
    await connectDB();

    const tree = await checkTreeAccess(id, auth.userId);
    if (!tree) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.firstName !== undefined) updates.firstName = sanitizeString(body.firstName);
    if (body.lastName !== undefined) updates.lastName = sanitizeString(body.lastName);
    if (body.gender !== undefined) updates.gender = body.gender;
    if (body.dateOfBirth !== undefined) updates.dateOfBirth = body.dateOfBirth || null;
    if (body.dateOfDeath !== undefined) updates.dateOfDeath = body.dateOfDeath || null;
    if (body.isAlive !== undefined) updates.isAlive = Boolean(body.isAlive);
    if (body.bio !== undefined) updates.bio = body.bio ? sanitizeString(body.bio) : null;
    if (body.photo !== undefined) updates.photo = body.photo;
    if (body.birthPlace !== undefined) updates.birthPlace = body.birthPlace ? sanitizeString(body.birthPlace) : null;
    if (body.occupation !== undefined) updates.occupation = body.occupation ? sanitizeString(body.occupation) : null;
    if (body.positionX !== undefined) updates.positionX = body.positionX;
    if (body.positionY !== undefined) updates.positionY = body.positionY;

    const member = await Member.findOneAndUpdate(
      { _id: memberId, treeId: id },
      updates,
      { new: true }
    );

    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('PATCH member error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, memberId } = await params;
    await connectDB();

    const tree = await checkTreeAccess(id, auth.userId);
    if (!tree) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await Promise.all([
      Member.findOneAndDelete({ _id: memberId, treeId: id }),
      Relationship.deleteMany({
        treeId: id,
        $or: [{ sourceId: memberId }, { targetId: memberId }],
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Member deleted' });
  } catch (error) {
    console.error('DELETE member error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
