import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import { CoverLetter } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const coverLetter = await CoverLetter.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!coverLetter) {
      return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 });
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('Get cover letter error:', error);
    return NextResponse.json({ error: 'Failed to get cover letter' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    await connectDB();

    const coverLetter = await CoverLetter.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: body },
      { new: true }
    );

    if (!coverLetter) {
      return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 });
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('Update cover letter error:', error);
    return NextResponse.json({ error: 'Failed to update cover letter' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const coverLetter = await CoverLetter.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!coverLetter) {
      return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete cover letter error:', error);
    return NextResponse.json({ error: 'Failed to delete cover letter' }, { status: 500 });
  }
}
