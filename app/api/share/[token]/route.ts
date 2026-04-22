import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FamilyTree } from '@/models/FamilyTree';
import { Member } from '@/models/Member';
import { Relationship } from '@/models/Relationship';

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    await connectDB();

    const tree = await FamilyTree.findOne({ shareToken: token, isPublic: true });
    if (!tree) {
      return NextResponse.json({ error: 'Tree not found or is private' }, { status: 404 });
    }

    const [members, relationships] = await Promise.all([
      Member.find({ treeId: tree._id }).lean(),
      Relationship.find({ treeId: tree._id }).lean(),
    ]);

    return NextResponse.json({ success: true, data: { tree, members, relationships } });
  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
