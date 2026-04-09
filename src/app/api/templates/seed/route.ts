import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { generateAllTemplates } from '@/scripts/generateTemplates';

// POST /api/templates/seed - Generate and save 100 templates to MongoDB
export async function POST() {
  try {
    // Connect to database
    const db = await connectToDatabase();
    
    // Generate templates
    const templates = generateAllTemplates();
    
    // Clear existing system templates
    await db.collection('templates').deleteMany({ userId: 'system' });
    
    // Prepare templates for MongoDB
    const categories = ['professional', 'creative', 'executive', 'academic', 'entry-level'];
    
    const templatesToSave = templates.map((template, index) => ({
      userId: 'system',
      title: template.mainsection.name,
      description: template.mainsection.description,
      templateId: template.mainsection.id,
      fileName: `${template.mainsection.id}.json`,
      isPublic: true,
      isPremium: template.mainsection.resumeinfo.isPremium,
      category: categories[index % categories.length],
      tags: [template.secondary.style.layout, template.secondary.style.fontFamily, categories[index % categories.length]],
      downloads: Math.floor(Math.random() * 5000),
      rating: Number((4 + Math.random()).toFixed(1)),
      ratingCount: Math.floor(Math.random() * 200),
      thumbnail: '',
      templateData: template,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Insert all templates
    const result = await db.collection('templates').insertMany(templatesToSave);
    
    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.insertedCount} templates`,
      count: result.insertedCount
    });
  } catch (error) {
    console.error('Error seeding templates:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
