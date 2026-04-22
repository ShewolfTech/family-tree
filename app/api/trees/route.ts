import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FamilyTree } from '@/models/FamilyTree';
import { Member } from '@/models/Member';
import { getAuthUser } from '@/lib/auth';
import { sanitizeString } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const trees = await FamilyTree.find({
      $or: [{ owner: auth.userId }, { collaborators: auth.userId }],
    }).sort({ updatedAt: -1 }).lean();

    // Add member counts
    const treeIds = trees.map((t) => t._id);
    const counts = await Member.aggregate([
      { $match: { treeId: { $in: treeIds } } },
      { $group: { _id: '$treeId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

    const result = trees.map((t) => ({
      ...t,
      memberCount: countMap[t._id.toString()] || 0,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/trees error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { name, description, isPublic } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Tree name is required' }, { status: 400 });
    }

    const tree = await FamilyTree.create({
      name: sanitizeString(name),
      description: description ? sanitizeString(description) : '',
      owner: auth.userId,
      isPublic: Boolean(isPublic),
    });

    return NextResponse.json({ success: true, data: tree }, { status: 201 });
  } catch (error) {
    console.error('POST /api/trees error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
