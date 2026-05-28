import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import connectDB from '@/lib/db/connect';
import { Resume } from '@/models';
import { processContentWithIds } from '@/lib/utils/resume-ids';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const resume = await Resume.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        _id: resume._id,
        title: resume.title,
        template: resume.template,
        design: resume.design,
        activeSections: resume.activeSections,
        elements: resume.elements,
        content: resume.content,
        canvasData: resume.canvasData,
        styleOverrides: resume.styleOverrides,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      }
    });
  } catch (error) {
    console.error('Get resume error:', error);
    return NextResponse.json({ error: 'Failed to get resume' }, { status: 500 });
  }
}

export async function PUT(
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

    const { title, template, content, design, activeSections, elements, canvasData, previewImage, styleOverrides } = body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (title !== undefined) updateData.title = title;
    if (template !== undefined) updateData.template = template;
    if (content !== undefined) {
      updateData.content = processContentWithIds(content);
    }
    if (design !== undefined) updateData.design = design;
    if (activeSections !== undefined) updateData.activeSections = activeSections;
    if (elements !== undefined) updateData.elements = elements;
    if (canvasData !== undefined) updateData.canvasData = canvasData;
    if (previewImage !== undefined) updateData.previewImage = previewImage;
    if (styleOverrides !== undefined) updateData.styleOverrides = styleOverrides;

    const resume = await Resume.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: resume._id,
        title: resume.title,
        template: resume.template,
        design: resume.design,
        activeSections: resume.activeSections,
        elements: resume.elements,
        content: resume.content,
        canvasData: resume.canvasData,
        styleOverrides: resume.styleOverrides,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      }
    });
  } catch (error) {
    console.error('Update resume error:', error);
    return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    let updateBody = { ...body };
    if (body.content) {
      updateBody.content = processContentWithIds(body.content);
    }
    updateBody.updatedAt = new Date();

    await connectDB();

    const resume = await Resume.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: updateBody },
      { new: true }
    );

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        _id: resume._id,
        title: resume.title,
        template: resume.template,
        design: resume.design,
        activeSections: resume.activeSections,
        elements: resume.elements,
        content: resume.content,
        canvasData: resume.canvasData,
        styleOverrides: resume.styleOverrides,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt
      }
    });
  } catch (error) {
    console.error('Update resume error:', error);
    return NextResponse.json({ error: 'Failed to update resume' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const resume = await Resume.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete resume error:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
}
