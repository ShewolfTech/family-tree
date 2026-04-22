import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FamilyTree } from '@/models/FamilyTree';
import { Member } from '@/models/Member';
import { Relationship } from '@/models/Relationship';
import { getAuthUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

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

    const [members, relationships] = await Promise.all([
      Member.find({ treeId: id }).lean(),
      Relationship.find({ treeId: id }).lean(),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      tree: {
        name: tree.name,
        description: tree.description,
        createdAt: tree.createdAt,
      },
      members,
      relationships,
    };

    return NextResponse.json({ success: true, data: exportData });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
