import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { Resume } from '@/models/Resume';

export async function POST(
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
    const { format, elements, content, design } = body;

    await connectDB();

    const resume = await Resume.findOne({
      _id: id,
      userId: (session.user as any).id,
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: {
          title: resume.title,
          template: resume.template,
          content: content || resume.content,
          design: design || resume.design,
          elements: elements,
          exportedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
