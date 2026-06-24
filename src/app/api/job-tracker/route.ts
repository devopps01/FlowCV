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
    const jobs = await Job.find({ userId: (session.user as any).id }).sort({ createdAt: 1 });
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
      title: body.title || body.company,
      company: body.company,
      status: body.status || 'saved',
      userId: (session.user as any).id,
    });
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Job Tracker POST error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    await connectDB();
    const updateData: Record<string, string> = {};
    if (body.status) updateData.status = body.status;
    if (body.title) updateData.title = body.title;
    if (body.company) updateData.company = body.company;
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }
    const job = await Job.findOneAndUpdate(
      { _id: body.jobId, userId: (session.user as any).id },
      updateData,
      { new: true }
    );
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ job });
  } catch (error) {
    console.error('Job Tracker PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { jobId } = await req.json();
    await connectDB();
    await Job.deleteOne({ _id: jobId, userId: (session.user as any).id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Job Tracker DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
