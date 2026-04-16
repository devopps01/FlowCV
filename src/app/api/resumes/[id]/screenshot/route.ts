import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import { Resume } from '@/models';
import path from 'path';
import fs from 'fs';

/**
 * POST /api/resumes/[id]/screenshot
 * Receives a base64 PNG screenshot of the resume, saves it to
 * public/uploads/screenshot-{id}.png, and updates previewImage in DB.
 * Replaces any existing screenshot for this resume.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageData } = await request.json();
    if (!imageData || typeof imageData !== 'string') {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    // Strip the data:image/png;base64, prefix
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save with resume ID as filename — replaces previous screenshot automatically
    const filename = `screenshot-${params.id}.png`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${filename}`;

    // Update previewImage in DB
    await connectDB();
    await Resume.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: { previewImage: imageUrl, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error('Screenshot save error:', error);
    return NextResponse.json({ error: 'Failed to save screenshot' }, { status: 500 });
  }
}
