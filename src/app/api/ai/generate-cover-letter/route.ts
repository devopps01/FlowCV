import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { personalInfo, recipient } = await req.json();

    // AI PROMPT
    const prompt = `
      Generate a professional and compelling cover letter.
      Candidate: ${personalInfo.fullName}
      Title: ${personalInfo.professionalTitle}
      To: ${recipient.name} at ${recipient.company}
      Location: ${recipient.address}
    `;

    // FALLBACK AI-LIKE GENERATOR (until an API key is provided)
    const content = `Dear ${recipient.name || 'Hiring Manager'},\n\n` +
      `I am writing to express my strong interest in the ${personalInfo.professionalTitle || 'specified position'} at ${recipient.company || 'your company'}. ` +
      `With my background in ${personalInfo.location || 'this field'}, I am confident that my skills and experience make me a perfect fit for this role.\n\n` +
      `Throughout my career, I have consistently demonstrated a strong commitment to professional excellence and a passion for ${personalInfo.professionalTitle}. ` +
      `I am impressed by ${recipient.company}'s reputation for innovation and would love the opportunity to contribute to your team's success.\n\n` +
      `Thank you for your time and consideration. I look forward to the possibility of discussing how my experience can benefit ${recipient.company}.\n\n` +
      `Sincerely,\n\n${personalInfo.fullName || 'Your Name'}`;

    // Here you would normally call OpenAI/Anthropic:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    return NextResponse.json({ content: data.choices[0].message.content });
    */

    // Returning simulated AI content
    return NextResponse.json({ content });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
