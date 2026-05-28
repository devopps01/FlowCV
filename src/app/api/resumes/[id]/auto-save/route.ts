import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import { Resume } from '@/models';
import { processContentWithIds } from '@/lib/utils/resume-ids';

export async function POST(
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

    const resume = await Resume.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.template !== undefined) updateData.template = body.template;
    if (body.content !== undefined) {
      updateData.content = processContentWithIds(body.content);
    }
    if (body.design !== undefined) updateData.design = body.design;
    if (body.activeSections !== undefined) updateData.activeSections = body.activeSections;
    if (body.styleOverrides !== undefined) updateData.styleOverrides = body.styleOverrides;

    const updatedResume = await Resume.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      success: true, 
      resume: updatedResume,
      message: 'Auto-saved successfully'
    });
  } catch (error) {
    console.error('Auto-save error:', error);
    return NextResponse.json(
      { error: 'Failed to auto-save resume', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
