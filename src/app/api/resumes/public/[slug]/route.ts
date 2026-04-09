import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { Resume } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const resume = await Resume.findOne({
      shareSlug: params.slug,
      isPublic: true,
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('Get public resume error:', error);
    return NextResponse.json({ error: 'Failed to get resume' }, { status: 500 });
  }
}
