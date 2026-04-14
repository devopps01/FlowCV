import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/ai/gemini';
import { processContentWithIds, getDefaultResumeContent } from '@/lib/utils/resume-ids';

export async function POST(req: Request) {
  try {
    const { prompt, currentData } = await req.json();

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

    let rawJson = await generateWithAI(instruction, { fieldType: 'resume' });

    // If AI returned empty — build a structured resume from the user's existing data
    if (!rawJson || rawJson.trim().length === 0) {
      const existing = cleanData || {};
      const pInfo = existing.personalInfo || {};
      const fallbackContent = {
        personalInfo: {
          fullName: pInfo.fullName || pInfo.firstName ? `${pInfo.firstName || ''} ${pInfo.lastName || ''}`.trim() : 'Your Name',
          email: pInfo.email || 'your.email@example.com',
          phone: pInfo.phone || '+1 (555) 000-0000',
          location: pInfo.location || 'City, State',
          professionalTitle: pInfo.professionalTitle || prompt?.split(' ').slice(0, 4).join(' ') || 'Professional',
          summary: `Results-driven ${pInfo.professionalTitle || 'professional'} with proven expertise in delivering high-impact solutions. Skilled at leading cross-functional teams, optimizing processes, and driving measurable business outcomes. Committed to continuous learning and professional excellence.`,
        },
        experience: existing.experience?.length > 0 ? existing.experience : [
          { company: 'Previous Company', position: 'Senior Role', startDate: '2020-01', endDate: 'Present', description: 'Led key initiatives that improved team productivity by 30%. Collaborated with stakeholders to deliver projects on time and within budget.' },
          { company: 'Earlier Company', position: 'Mid-Level Role', startDate: '2017-06', endDate: '2019-12', description: 'Developed and implemented solutions that reduced operational costs by 20%. Mentored junior team members and contributed to knowledge-sharing initiatives.' },
        ],
        education: existing.education?.length > 0 ? existing.education : [
          { school: 'University', degree: 'Bachelor of Science', field: 'Relevant Field', graduationYear: '2017' },
        ],
        skills: existing.skills?.length > 0 ? existing.skills : ['Leadership', 'Project Management', 'Communication', 'Problem Solving', 'Team Collaboration', 'Strategic Planning'],
        languages: existing.languages?.length > 0 ? existing.languages : [{ language: 'English', proficiency: 'Native' }],
        projects: existing.projects || [],
        certifications: existing.certifications || [],
      };

      const contentWithIds = processContentWithIds({
        ...getDefaultResumeContent(),
        ...fallbackContent,
      });
      return NextResponse.json({ content: contentWithIds, warning: 'AI unavailable — resume built from your existing data. Add a GROQ_API_KEY to .env.local for AI generation.' });
    }

    // Strip markdown code fences if present
    rawJson = rawJson.trim();
    if (rawJson.startsWith('```json')) rawJson = rawJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    else if (rawJson.startsWith('```')) rawJson = rawJson.replace(/^```\s*/, '').replace(/```$/, '').trim();

    // Find the JSON object (skip any leading text)
    const jsonStart = rawJson.indexOf('{');
    if (jsonStart === -1) {
      return NextResponse.json({ error: 'AI returned invalid response. Please try again.' }, { status: 500 });
    }
    rawJson = rawJson.slice(jsonStart);

    const parsedContent = JSON.parse(rawJson);

    // Process content to add unique IDs
    const contentWithIds = processContentWithIds({
      ...getDefaultResumeContent(),
      ...parsedContent,
    });

    return NextResponse.json({ content: contentWithIds });
  } catch (error: any) {
    console.error('AI generation failed:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to generate resume' }, { status: 500 });
  }
}
