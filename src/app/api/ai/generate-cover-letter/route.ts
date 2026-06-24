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

    const { personalInfo, recipient, jobDescription, tone, length, prompt: userPrompt, resumeContent, resumeTitle } = await req.json();

    const candidateName = personalInfo?.fullName || 'Candidate';
    const jobTitle = personalInfo?.professionalTitle || 'the position';
    const company = recipient?.company || 'your company';
    const hiringManager = recipient?.name || 'Hiring Manager';
    const address = recipient?.address || '';
    const toneStyle = tone || 'professional';
    const userInstruction = userPrompt || '';

    // Build resume context string if resume is synced
    let resumeContext = '';
    if (resumeContent) {
      const exp = resumeContent.experience || [];
      const edu = resumeContent.education || [];
      const skills = resumeContent.skills || [];
      const summary = resumeContent.personalInfo?.summary || '';

      resumeContext = `
Resume Context (${resumeTitle || 'Synced Resume'}):
${summary ? `Summary: ${summary}` : ''}
${exp.length > 0 ? `Experience:\n${exp.slice(0, 5).map((e: any) => `- ${e.position || ''} at ${e.company || ''} (${e.startDate || ''} - ${e.endDate || ''}): ${e.description || ''}`).join('\n')}` : ''}
${edu.length > 0 ? `Education:\n${edu.slice(0, 3).map((e: any) => `- ${e.degree || ''} from ${e.school || ''}`).join('\n')}` : ''}
${skills.length > 0 ? `Skills: ${skills.slice(0, 15).map((s: any) => s.name || '').filter(Boolean).join(', ')}` : ''}
`;
    }

    const prompt = `You are a creative, experienced cover letter writer. Your job is to write a UNIQUE, PERSONALIZED cover letter based on the user's specific request below. NEVER write generic or boilerplate content. EVERY letter must be different.

=== USER'S SPECIFIC REQUEST ===
${userInstruction || `Write a cover letter for ${jobTitle} at ${company}`}
=== END USER REQUEST ===

Applicant: ${candidateName} (${jobTitle})
Company: ${company}
Hiring Manager: ${hiringManager}
Tone: ${toneStyle}
    Length: ${length === 'short' ? '2-3 paragraphs (short)' : length === 'detailed' ? '5-6 paragraphs (detailed)' : '3-4 paragraphs (medium)'}
${address ? `Location: ${address}` : ''}
${jobDescription ? `\nJob Description/Requirements:\n${jobDescription}` : ''}
${personalInfo?.summary ? `\nAbout the candidate:\n${personalInfo.summary}` : ''}
${resumeContext}

CRITICAL INSTRUCTIONS:
- The user's input above is your PRIMARY instruction — follow it closely
- Write 2-3 short paragraphs (the letter should feel concise and confident)
- Start with a hook that relates to what the user mentioned, NOT a generic opening
- Reference specific details from the user's request — be concrete, not vague
- End with a brief, warm call to action
- Tone: ${toneStyle} throughout
- Do NOT include date, headers, "To:", "Dear", "Sincerely" or any greeting/signature — ONLY the body paragraphs
- Write ONLY the letter text, nothing else
- Make it sound like a real person wrote it, not a template`;

    const aiContent = await generateWithAI(prompt, { fieldType: 'cover-letter', temperature: 0.9 });

    let content: string;

    if (aiContent && aiContent.trim().length > 50) {
      content = aiContent.trim();
    } else {
      // Generate a dynamic fallback based on user input
      const introLines = [
        `I've been following ${company}'s work in the industry for some time now, and I'm genuinely excited about the ${jobTitle} opportunity.`,
        `What drew me to ${company} is the reputation for innovation — and I believe my background makes me a strong fit for the ${jobTitle} role.`,
        `I've always admired how ${company} approaches challenges, and I'd love to contribute as your next ${jobTitle}.`,
        `The ${jobTitle} position at ${company} immediately caught my attention — it perfectly aligns with my experience and career goals.`,
      ];
      const middleLines = [
        `In my previous roles, I've developed strong skills in problem-solving and delivering results. I'm confident I can bring that same energy to your team.`,
        `My experience has prepared me well for this role. I've consistently delivered quality work and I'm excited about the chance to do the same for ${company}.`,
        `Over the years, I've honed my abilities to deliver under pressure and collaborate effectively. I'd love to apply these strengths at ${company}.`,
        `I thrive in environments that value creativity and hard work — and everything I've seen about ${company} tells me this is exactly that kind of place.`,
      ];
      const closingLines = [
        `I'd love the chance to discuss how I can contribute to ${company}'s continued success. Thank you for your time and consideration.`,
        `I'm eager to bring my skills to ${company} and would welcome the opportunity to speak with you further. Thank you for considering my application.`,
        `I look forward to the possibility of joining ${company} and contributing to your team's success. Thank you for your time.`,
        `I would appreciate the opportunity to discuss my application further and show you what I can bring to the ${jobTitle} role. Thank you.`,
      ];
      
      // Use user input to seed consistent but unique choices per session/userInput
      const seedStr = userInstruction + candidateName + jobTitle;
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
        hash |= 0;
      }
      const idx1 = Math.abs(hash) % introLines.length;
      const idx2 = Math.abs(hash + 7) % middleLines.length;
      const idx3 = Math.abs(hash + 13) % closingLines.length;
      
      content = `${introLines[idx1]}\n\n${middleLines[idx2]}\n\n${closingLines[idx3]}`;
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
