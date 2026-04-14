import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { generateWithAI } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { personalInfo, recipient, jobDescription, tone } = await req.json();

    const candidateName = personalInfo?.fullName || 'Candidate';
    const jobTitle = personalInfo?.professionalTitle || 'the position';
    const company = recipient?.company || 'your company';
    const hiringManager = recipient?.name || 'Hiring Manager';
    const address = recipient?.address || '';
    const toneStyle = tone || 'professional';

    const prompt = `You are an expert cover letter writer. Write a compelling, ${toneStyle} cover letter.

Candidate: ${candidateName}
Applying for: ${jobTitle} at ${company}
Hiring Manager: ${hiringManager}
${address ? `Company Address: ${address}` : ''}
${jobDescription ? `Job Description: ${jobDescription}` : ''}
${personalInfo?.summary ? `Candidate Summary: ${personalInfo.summary}` : ''}

Requirements:
- Write 3-4 paragraphs
- Opening: Express enthusiasm for the role and company
- Middle: Highlight 2-3 specific achievements/skills relevant to the role
- Closing: Call to action, thank them for their time
- Tone: ${toneStyle}
- Do NOT include date, address headers, or "Sincerely" signature block — just the letter body paragraphs
- Return ONLY the letter text, no extra commentary

Write the cover letter now:`;

    const aiContent = await generateWithAI(prompt, { fieldType: 'cover-letter' });

    let content: string;

    if (aiContent && aiContent.trim().length > 50) {
      content = aiContent.trim();
    } else {
      // High-quality local fallback
      content = `Dear ${hiringManager},

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background and proven track record of delivering results, I am confident that I would be a valuable addition to your team.

Throughout my career, I have consistently demonstrated the ability to drive meaningful outcomes. I am particularly drawn to ${company} because of its reputation for excellence and innovation in the industry. I believe my skills and experience align perfectly with what you are looking for in this role.

I am excited about the opportunity to bring my expertise to ${company} and contribute to your continued success. I would welcome the chance to discuss how my background can benefit your team.

Thank you for your time and consideration. I look forward to the opportunity to speak with you further.`;
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
