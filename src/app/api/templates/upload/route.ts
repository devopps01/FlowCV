import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db/connect';
import { Resume } from '@/models/Resume';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const templateName = formData.get('templateName') as string;
    const templateDescription = formData.get('templateDescription') as string;
    const isPremium = formData.get('isPremium') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded. Please select a file.' }, { status: 400 });
    }

    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    const isJson = fileType === 'application/json' || file.name.endsWith('.json');

    if (!isImage && !isJson) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload PNG, JPG, or JSON file.' 
      }, { status: 400 });
    }

    const userId = session.user.id || session.user.email;
    const templateId = `template-${Date.now()}`;

    if (isImage) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString('base64');
      const dataUrl = `data:${fileType};base64,${base64Image}`;

      const templateRecord = new Resume({
        userId,
        title: templateName || `Image Template ${Date.now()}`,
        template: templateId,
        elements: [],
        content: {
          _templateType: 'image',
          _imageData: dataUrl,
          _imageName: file.name,
          personalInfo: {
            fullName: 'Your Name',
            email: 'your.email@example.com',
            phone: '(555) 123-4567',
            location: 'City, State',
            professionalTitle: 'Professional Title',
            summary: 'Professional summary here...'
          },
          experience: [],
          education: [],
          skills: []
        },
        canvasData: { elements: {}, order: [] },
        isTemplate: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await templateRecord.save();

      return NextResponse.json({ 
        success: true, 
        data: {
          templateId,
          templateType: 'image',
          thumbnail: dataUrl,
          title: templateRecord.title,
          message: 'Image template uploaded successfully'
        }
      });
    }

    const templatesDir = path.join(process.cwd(), 'src', 'config', 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let resumeData;
    try {
      resumeData = JSON.parse(buffer.toString('utf-8'));
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON file. Please check the file format.' }, { status: 400 });
    }

    const templateData = {
      mainsection: {
        id: templateId,
        name: templateName || `Custom Template ${Date.now()}`,
        description: templateDescription || 'Custom uploaded template',
        resumeinfo: {
          isPremium: isPremium || false,
          subscription: isPremium ? 'Premium' : 'Free'
        }
      },
      secondary: {
        style: {
          primaryColor: resumeData.design?.primaryColor || '#7c3aed',
          secondaryColor: resumeData.design?.secondaryColor || '#f5f3ff',
          accentColor: resumeData.design?.accentColor || '#5b21b6',
          fontFamily: resumeData.design?.fontFamily || 'Outfit',
          isSerif: resumeData.design?.isSerif || false,
          layout: resumeData.design?.layout || 'sidebar-left',
          spacing: resumeData.design?.spacing || 4,
          borderRadius: resumeData.design?.borderRadius || 'lg',
          fontSize: resumeData.design?.fontSize || 11,
          textColor: resumeData.design?.textColor || '#1f2937',
          backgroundColor: resumeData.design?.backgroundColor || '#ffffff'
        },
        data: resumeData.content || {
          personalInfo: {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 012-3456',
            location: 'New York, NY',
            professionalTitle: 'Professional Title',
            summary: 'Professional summary here...'
          },
          experience: [],
          education: [],
          skills: []
        }
      }
    };

    const fileName = `${templateId}.json`;
    const filePath = path.join(templatesDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(templateData, null, 2));

    const templateRecord = new Resume({
      userId,
      title: templateName || `Custom Template ${Date.now()}`,
      template: templateId,
      elements: [],
      content: resumeData.content || {},
      canvasData: { elements: {}, order: [] },
      isTemplate: true,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await templateRecord.save();

    return NextResponse.json({ 
      success: true, 
      data: {
        templateId,
        templateType: 'json',
        fileName,
        templateData,
        message: 'Template uploaded successfully'
      }
    });

  } catch (error) {
    console.error('Template upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload template. Please try again.' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    const userId = session.user.id || session.user.email;
    
    const userTemplates = await Resume.find({ 
      userId, 
      isTemplate: true,
      isPublic: true 
    }).sort({ createdAt: -1 });

    const formattedTemplates = userTemplates.map(t => ({
      _id: t._id,
      userId: t.userId,
      title: t.title,
      description: t.description || 'Custom template',
      templateId: t.template,
      fileName: `${t.template}.json`,
      isPublic: t.isPublic,
      isPremium: false,
      category: 'custom',
      tags: [],
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      thumbnail: t.content?._imageData || null,
      templateData: t.content?._templateType === 'image' ? {
        mainsection: {
          id: t.template,
          name: t.title,
          description: 'Image template',
          resumeinfo: { isPremium: false, subscription: 'Free' }
        },
        secondary: {
          style: {
            primaryColor: '#7c3aed',
            secondaryColor: '#f5f3ff',
            accentColor: '#5b21b6',
            fontFamily: 'Inter',
            layout: 'image',
          },
          data: t.content
        }
      } : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));

    return NextResponse.json({ 
      success: true, 
      data: { 
        templates: formattedTemplates 
      } 
    });

  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json({ 
      error: 'Failed to get templates' 
    }, { status: 500 });
  }
}
