import { NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const instruction = `You are an expert resume writer. Fix spelling/grammar in this resume instruction and make it clearer. Return ONLY the improved prompt, no explanations.

User input: "${prompt}"
Improved prompt:`;

    const enhancedPrompt = await generateWithGemini(instruction);
    return NextResponse.json({ enhancedPrompt });
  } catch (error: any) {
    console.error('Enhance prompt failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
