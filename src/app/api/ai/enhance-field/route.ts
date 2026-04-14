import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/ai/gemini';

export async function POST(req: Request) {
  try {
    const { text, fieldType, context, instruction } = await req.json();

    if (!text && !instruction) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const prompts: Record<string, string> = {
      summary: `You are an expert resume writer. Rewrite this professional summary to be more impactful and ATS-optimized. Use strong action words. Keep it 2-4 sentences. Return ONLY the improved text.

Original: "${text}"
${context ? `Context: ${context}` : ''}
${instruction ? `Instruction: ${instruction}` : ''}`,

      description: `You are an expert resume writer. Improve this job description with strong action verbs and quantifiable results. Return ONLY the improved text.

Original: "${text}"
${context ? `Context: ${context}` : ''}
${instruction ? `Instruction: ${instruction}` : ''}`,

      default: `You are an expert resume writer. Improve this resume text to be more professional and impactful. Return ONLY the improved text.

Original: "${text}"
${context ? `Context: ${context}` : ''}
${instruction ? `Instruction: ${instruction}` : ''}`,
    };

    const prompt = prompts[fieldType] || prompts.default;

    // Pass fallbackText so local enhancement works even without API key
    const enhanced = await generateWithAI(prompt, {
      fieldType,
      fallbackText: text,
    });

    return NextResponse.json({ enhanced });
  } catch (error: any) {
    console.error('Enhance field failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
