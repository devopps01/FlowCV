import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { Job } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const jobs = await Job.find({ userId: session.user.id })
      .sort({ updatedAt: -1 });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json({ error: 'Failed to get jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, company, location, status, salary, jobType, url, notes, appliedDate, followUpDate, contacts } = body;

    await connectDB();

    const job = await Job.create({
      userId: session.user.id,
      title,
      company,
      location: location || '',
      status: status || 'saved',
      salary: salary || '',
      jobType: jobType || '',
      url: url || '',
      notes: notes || '',
      appliedDate: appliedDate || '',
      followUpDate: followUpDate || '',
      contacts: contacts || [],
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
