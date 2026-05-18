import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/ai/gemini';
import { processContentWithIds } from '@/lib/utils/resume-ids';

/**
 * POST /api/ai/generate-section
 * Generates content for a specific resume section based on a user prompt.
 * Returns only the data for that section, not the full resume.
 */
export async function POST(req: Request) {
  try {
    const { section, prompt, currentData, resumeContext } = await req.json();

    if (!section || !prompt?.trim()) {
      return NextResponse.json({ error: 'Section and prompt are required' }, { status: 400 });
    }

    const contextStr = resumeContext
      ? `Resume context: Name: ${resumeContext.fullName || ''}, Title: ${resumeContext.professionalTitle || ''}`
      : '';

    const sectionPrompts: Record<string, string> = {
      personalInfo: `You are an expert resume writer. Generate professional personal info fields based on this description: "${prompt}"
${contextStr}
Current data: ${JSON.stringify(currentData || {})}

Return ONLY a valid JSON object with these fields (fill only what's relevant, keep existing values if not mentioned):
{
  "fullName": "string",
  "professionalTitle": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "2-4 sentence professional summary with strong action words and ATS keywords"
}
Return ONLY the raw JSON, no markdown.`,

      experience: `You are an expert resume writer. Generate professional work experience entries based on: "${prompt}"
${contextStr}
Current experience: ${JSON.stringify(currentData || [])}

Return ONLY a valid JSON array of experience objects:
[{
  "company": "Company Name",
  "position": "Job Title",
  "startDate": "YYYY-MM",
  "endDate": "YYYY-MM or Present",
  "description": "Achievement-focused description with strong action verbs and quantifiable results. Use <ul><li> for bullet points."
}]
Return ONLY the raw JSON array, no markdown.`,

      education: `You are an expert resume writer. Generate education entries based on: "${prompt}"
${contextStr}
Current education: ${JSON.stringify(currentData || [])}

Return ONLY a valid JSON array:
[{
  "school": "University Name",
  "degree": "Degree Type",
  "field": "Field of Study",
  "graduationYear": "YYYY"
}]
Return ONLY the raw JSON array, no markdown.`,

      skills: `You are an expert resume writer. Generate a relevant skills list based on: "${prompt}"
${contextStr}
Current skills: ${JSON.stringify(currentData || [])}

Return ONLY a valid JSON array of skill strings (mix technical and soft skills, 8-15 items):
["Skill 1", "Skill 2", "Skill 3"]
Return ONLY the raw JSON array, no markdown.`,

      languages: `Generate language proficiency entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"language": "Language Name", "proficiency": "Native|Fluent|Advanced|Intermediate|Basic"}]
Return ONLY the raw JSON array, no markdown.`,

      projects: `You are an expert resume writer. Generate project entries based on: "${prompt}"
${contextStr}
Current projects: ${JSON.stringify(currentData || [])}

Return ONLY a valid JSON array:
[{
  "name": "Project Name",
  "description": "Impact-focused description with technologies used and results achieved.",
  "technologies": ["Tech1", "Tech2"]
}]
Return ONLY the raw JSON array, no markdown.`,

      certifications: `Generate certification entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"name": "Certification Name", "issuer": "Issuing Organization", "date": "YYYY-MM"}]
Return ONLY the raw JSON array, no markdown.`,

      awards: `Generate award/achievement entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"title": "Award Title", "issuer": "Organization", "date": "YYYY-MM", "description": "Brief description"}]
Return ONLY the raw JSON array, no markdown.`,

      courses: `Generate course entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"title": "Course Title", "provider": "Platform/Institution", "date": "YYYY-MM", "description": "What you learned"}]
Return ONLY the raw JSON array, no markdown.`,

      organisations: `Generate organisation/volunteer entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"name": "Organisation Name", "role": "Your Role", "startDate": "YYYY-MM", "endDate": "YYYY-MM or Present", "description": "Your contributions"}]
Return ONLY the raw JSON array, no markdown.`,

      publications: `Generate publication entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"title": "Publication Title", "publisher": "Publisher/Journal", "date": "YYYY-MM", "description": "Brief description", "url": ""}]
Return ONLY the raw JSON array, no markdown.`,

      references: `Generate reference entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"name": "Full Name", "position": "Job Title", "company": "Company", "email": "email@example.com", "phone": "+1 (555) 000-0000", "relationship": "Former Manager"}]
Return ONLY the raw JSON array, no markdown.`,

      interests: `Generate interest/hobby entries based on: "${prompt}"
Return ONLY a valid JSON array of strings: ["Interest 1", "Interest 2"]
Return ONLY the raw JSON array, no markdown.`,

      socials: `Generate social/link entries based on: "${prompt}"
Return ONLY a valid JSON array:
[{"platform": "LinkedIn|GitHub|Portfolio|Twitter", "label": "Display Label", "url": "https://..."}]
Return ONLY the raw JSON array, no markdown.`,
    };

    const instruction = sectionPrompts[section];
    if (!instruction) {
      return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 });
    }

    let rawJson = await generateWithAI(instruction, { fieldType: 'section' });

    if (!rawJson || rawJson.trim().length === 0) {
      return NextResponse.json({ error: 'AI returned empty response. Please try again.' }, { status: 500 });
    }

    // Strip markdown fences
    rawJson = rawJson.trim();
    if (rawJson.startsWith('```json')) rawJson = rawJson.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    else if (rawJson.startsWith('```')) rawJson = rawJson.replace(/^```\s*/, '').replace(/```$/, '').trim();

    // Find start of JSON
    const startChar = rawJson[0] === '[' ? '[' : '{';
    const startIdx = rawJson.indexOf(startChar);
    if (startIdx === -1) {
      return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 500 });
    }
    rawJson = rawJson.slice(startIdx);

    const parsed = JSON.parse(rawJson);

    // Add IDs to array items and ensure object format
    let result = parsed;
    if (Array.isArray(parsed)) {
      result = parsed.map((item: any, i: number) => {
        const base = typeof item === 'string' ? { name: item } : item;
        return {
          id: `${section}_ai_${Date.now()}_${i}`,
          ...base,
        };
      });
    }

    return NextResponse.json({ data: result, section });
  } catch (error: any) {
    console.error('Section generation failed:', error.message);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
