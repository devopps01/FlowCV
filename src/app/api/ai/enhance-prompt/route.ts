import { NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/ai/gemini';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const instruction = `Fix spelling/grammar in this resume instruction and make it clearer. Return ONLY the improved prompt, no explanations.

User input: "${prompt}"
Improved prompt:`;

    const enhancedPrompt = await generateWithAI(instruction, { fallbackText: prompt, fieldType: 'default' });
    return NextResponse.json({ enhancedPrompt });
  } catch (error: any) {
    console.error('Enhance prompt failed:', error.message);
    // Return original prompt as fallback — never fail silently
    return NextResponse.json({ enhancedPrompt: prompt });
  }
}
