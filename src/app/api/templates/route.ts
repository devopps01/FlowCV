import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';

// GET /api/templates - Fetch all system templates from MongoDB
export async function GET() {
  try {
    // Connect to database
    const db = await connectToDatabase();
    
    // Fetch all system templates from MongoDB
    const templates = await db
      .collection('templates')
      .find({ 
        userId: 'system',
        isPublic: true 
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Transform MongoDB documents to template data format
    const formattedTemplates = templates.map(template => {
      // If template has templateData, use it; otherwise construct from fields
      if (template.templateData) {
        return template.templateData;
      }
      
      // Fallback: construct template data from MongoDB fields
      return {
        mainsection: {
          id: template.templateId,
          name: template.title,
          description: template.description,
          resumeinfo: {
            isPremium: template.isPremium,
            subscription: template.isPremium ? 'Premium' : 'Free'
          }
        },
        secondary: {
          style: template.templateData?.secondary?.style || {
            primaryColor: '#7c3aed',
            secondaryColor: '#f5f3ff',
            accentColor: '#5b21b6',
            fontFamily: 'Outfit',
            isSerif: false,
            // IMPORTANT: layout must be a ResumePreview layout id (e.g. 'sidebar-left')
            // Do NOT use template.category ('modern', 'simple', etc.) here.
            layout: template.layout || 'sidebar-left',
            spacing: 4,
            borderRadius: 'lg',
            fontSize: 11,
            textColor: '#1f2937',
            backgroundColor: '#ffffff'
          },
          data: template.templateData?.secondary?.data || {}
        }
      };
    });

    return NextResponse.json({ 
      success: true,
      data: { 
        templates: formattedTemplates,
        count: formattedTemplates.length
      }
    });
  } catch (error) {
    console.error('Failed to load templates from MongoDB:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to load templates from database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
