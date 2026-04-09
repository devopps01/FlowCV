import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { Job } from '@/models/Job';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const jobs = await Job.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });
    
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Job Tracker GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const job = await Job.create({
      ...body,
      userId: (session.user as any).id,
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Job Tracker POST error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
