import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { processContentWithIds, getDefaultResumeContent } from '@/lib/utils/resume-ids';

export async function POST(req: Request) {
  try {
    const { prompt, currentData } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let cleanData = currentData;
    if (currentData && typeof currentData === 'object') {
      cleanData = JSON.parse(JSON.stringify(currentData));
      if (cleanData.personalInfo) {
        delete cleanData.personalInfo.photo;
        delete cleanData.personalInfo.image;
        delete cleanData.personalInfo._imageData;
      }
      const cleanString = JSON.stringify(cleanData);
      if (cleanString.length > 50000) {
        cleanData = {
          personalInfo: cleanData.personalInfo || {},
          experience: cleanData.experience || [],
          education: cleanData.education || [],
          skills: cleanData.skills || [],
          languages: cleanData.languages || [],
          summary: cleanData.personalInfo?.summary || '',
        };
      }
    }

    const instruction = `
You are an expert professional resume writer and career coach with deep knowledge of modern resume best practices, ATS optimization, and industry-specific formatting.

The user wants you to generate or edit a professional resume based on these instructions: "${prompt || 'Create a professional resume.'}"

Here is their current resume data (if any):
${JSON.stringify(cleanData)}

Based on their instructions and existing data, generate the complete structured content for their resume with the following enhancements:

1. ATS OPTIMIZATION:
   - Use industry-standard keywords and action verbs
   - Include quantifiable achievements with metrics
   - Format for ATS readability (no complex formatting)
   - Use standard section headings

2. PROFESSIONAL CONTENT:
   - Start bullet points with strong action verbs
   - Include measurable results and achievements
   - Use industry-specific terminology appropriately
   - Ensure logical career progression

3. COMPREHENSIVE STRUCTURE:
   - Personal info with professional summary/objective
   - Work experience with detailed achievements
   - Education with relevant details
   - Skills section with technical and soft skills
   - Languages with proficiency levels
   - Projects with impact descriptions
   - Optional: Certifications, Awards, Publications

4. MODERN FORMATTING:
   - Use semantic HTML tags for rich text (<b>, <i>, <ul>, <li>)
   - Ensure consistent formatting throughout
   - Include proper spacing and hierarchy
   - Use professional language and tone

Return ONLY a strictly valid JSON object that matches this exact structure:

{
  "personalInfo": {
    "fullName": "Full Name",
    "email": "professional.email@example.com",
    "phone": "+1 (555) 123-4567",
    "location": "City, State",
    "professionalTitle": "Senior Professional Title",
    "summary": "Career summary with key highlights and career objectives."
  },
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "description": "Key achievements and responsibilities."
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree Name",
      "field": "Field of Study",
      "graduationYear": "YYYY"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "languages": [
    {"language": "English", "proficiency": "Native"},
    {"language": "Spanish", "proficiency": "Fluent"}
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["Tech 1", "Tech 2"]
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "YYYY-MM"
    }
  ]
}

CRITICAL REQUIREMENTS:
- Return ONLY the raw JSON object (no markdown code blocks)
- Ensure all fields are properly filled with realistic, professional content
- Use strong action verbs and quantifiable achievements
- Include industry-specific terminology when appropriate
- Format dates consistently (YYYY-MM format)
- Ensure proper JSON syntax throughout
- Do not include any explanatory text outside the JSON structure
`;

    const result = await model.generateContent(instruction);
    let rawJson = result.response.text().trim();
    
    if (rawJson.startsWith('\`\`\`json')) {
      rawJson = rawJson.replace(/^\`\`\`json\s*/, '').replace(/\`\`\`$/, '').trim();
    } else if (rawJson.startsWith('\`\`\`')) {
      rawJson = rawJson.replace(/^\`\`\`\s*/, '').replace(/\`\`\`$/, '').trim();
    }

    const parsedContent = JSON.parse(rawJson);

    // Process content to add unique IDs
    const contentWithIds = processContentWithIds({
      ...getDefaultResumeContent(),
      ...parsedContent,
    });

    return NextResponse.json({ content: contentWithIds });
  } catch (error: any) {
    console.error('AI generation API failed:', error);
    
    const errorMessage = error?.message || '';
    if (errorMessage.includes('image') || errorMessage.includes('model does not support')) {
      return NextResponse.json({ 
        error: 'Image processing is not supported. Please remove images and try again.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: error?.message || 'Failed to generate content' }, { status: 500 });
  }
}
