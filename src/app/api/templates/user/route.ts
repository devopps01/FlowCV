import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db/connect';
import { Resume } from '@/models/Resume';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';

    const userId = session.user.id || session.user.email;
    
    // Build query
    const query: any = {
      userId,
      isTemplate: true
    };

    if (category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { template: { $regex: search, $options: 'i' } }
      ];
    }

    // Get templates with pagination
    const templates = await Resume.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email');

    // Get total count
    const total = await Resume.countDocuments(query);

    return NextResponse.json({ 
      success: true, 
      data: {
        templates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user templates error:', error);
    return NextResponse.json({ 
      error: 'Failed to get user templates' 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    const userId = session.user.id || session.user.email;
    
    // Delete template from database
    const result = await Resume.findOneAndDelete({ 
      _id: templateId, 
      userId,
      isTemplate: true 
    });

    if (!result) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Also delete template file if it exists
    const fs = require('fs');
    const path = require('path');
    const templateFilePath = path.join(process.cwd(), 'src', 'config', 'templates', `${result.template}.json`);
    
    if (fs.existsSync(templateFilePath)) {
      fs.unlinkSync(templateFilePath);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Template deleted successfully' 
    });

  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete template' 
    }, { status: 500 });
  }
}
