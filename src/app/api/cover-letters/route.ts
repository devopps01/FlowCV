import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import { CoverLetter } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const coverLetters = await CoverLetter.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .select('title template updatedAt previewImage content design');

    return NextResponse.json({ coverLetters });
  } catch (error) {
    console.error('Get cover letters error:', error);
    return NextResponse.json({ error: 'Failed to get cover letters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, template, resumeId } = body;

    await connectDB();

    const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const coverLetter = await CoverLetter.create({
      userId: session.user.id,
      title: title || 'My Cover Letter',
      template: template || 'classic',
      resumeId,
      content: {
        personalInfo: { fullName: '', email: '', phone: '', location: '', professionalTitle: '', photo: '' },
        date: now,
        recipient: { name: '', company: '', address: '' },
        body: 'Dear ______,\n\nSincerely,',
        signature: { fullName: '', place: '', date: '', image: '' },
      },
      design: { fontFamily: 'Inter', primaryColor: '#ff4d7d' },
    });

    return NextResponse.json({ coverLetter }, { status: 201 });
  } catch (error) {
    console.error('Create cover letter error:', error);
    return NextResponse.json({ error: 'Failed to create cover letter' }, { status: 500 });
  }
}
