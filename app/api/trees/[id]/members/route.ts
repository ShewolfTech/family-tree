import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { FamilyTree } from '@/models/FamilyTree';
import { Member } from '@/models/Member';
import { getAuthUser } from '@/lib/auth';
import { validateMember, sanitizeString } from '@/lib/validation';

type Params = { params: Promise<{ id: string }> };

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

    const members = await Member.find({ treeId: id }).lean();
    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error('GET members error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const auth = await getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const tree = await FamilyTree.findById(id);
    if (!tree) return NextResponse.json({ error: 'Tree not found' }, { status: 404 });

    const isOwner = tree.owner.toString() === auth.userId;
    const isCollaborator = tree.collaborators.map(String).includes(auth.userId);
    if (!isOwner && !isCollaborator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validation = validateMember(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const member = await Member.create({
      treeId: id,
      firstName: sanitizeString(body.firstName),
      lastName: sanitizeString(body.lastName),
      gender: body.gender || 'unknown',
      dateOfBirth: body.dateOfBirth || undefined,
      dateOfDeath: body.dateOfDeath || undefined,
      isAlive: body.isAlive !== false,
      bio: body.bio ? sanitizeString(body.bio) : undefined,
      photo: body.photo || undefined,
      birthPlace: body.birthPlace ? sanitizeString(body.birthPlace) : undefined,
      occupation: body.occupation ? sanitizeString(body.occupation) : undefined,
      positionX: body.positionX ?? Math.random() * 400,
      positionY: body.positionY ?? Math.random() * 300,
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    console.error('POST member error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
