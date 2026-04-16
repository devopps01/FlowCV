import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import { Resume } from '@/models';
import { generateSlug } from '@/lib/utils';
import { processContentWithIds, getDefaultResumeContent } from '@/lib/utils/resume-ids';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const resumes = await Resume.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .select('title template updatedAt isPublic shareSlug previewImage content design activeSections');

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    return NextResponse.json({ error: 'Failed to get resumes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, template, design, content, templateSlug, activeSections } = body;

    await connectDB();

    const processedContent = content 
      ? processContentWithIds({ ...getDefaultResumeContent(), ...content })
      : getDefaultResumeContent();

    const resume = await Resume.create({
      userId: session.user.id,
      title: title || 'My Resume',
      template: template || templateSlug || 'classic',
      design: design || {},
      content: processedContent,
      shareSlug: generateSlug(),
      activeSections: Array.isArray(activeSections) ? activeSections : undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: resume._id,
        title: resume.title,
        template: resume.template,
        design: resume.design,
        activeSections: resume.activeSections,
        content: resume.content,
        createdAt: resume.createdAt,
      },
      message: 'Resume created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create resume error:', error);
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
  }
}
