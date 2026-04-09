import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { Resume } from '@/models/Resume';
import { processContentWithIds } from '@/lib/utils/resume-ids';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { content, elements, order, design, layout, template } = body;

    await connectDB();

    const resume = await Resume.findOne({
      _id: id,
      userId: (session.user as any).id,
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (content) {
      updateData.content = processContentWithIds(content);
    }

    if (elements) {
      updateData.canvasElements = Object.values(elements);
    }

    if (order) {
      updateData.canvasOrder = order;
    }

    if (design) {
      updateData.design = {
        ...resume.design,
        ...design,
      };
    }

    if (layout) {
      updateData.layout = layout;
    }

    if (template) {
      updateData.template = template;
    }

    const updated = await Resume.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({ resume: updated });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return PUT(req, { params });
}
