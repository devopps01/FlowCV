import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in .env.local' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const instruction = `
You are an expert resume writer and prompt engineer. 
The user wants to instruct an AI to build their resume, but their input might have spelling mistakes, poor grammar, or be too brief.
Your goal is to fix their spelling/grammar, maintain their core intent, and rephrase it into a clear, professional instruction for an AI to generate a resume.
Do NOT output anything except the enhanced prompt string. No conversational text.
Example User: "mak me a resome for recat coder with 5 yrs exp"
Example Output: "Create a professional resume for a Senior React Developer with 5 years of extensive experience building optimized web applications. Emphasize react, modern frontend technologies, and scalable architecture."

User's raw prompt: "${prompt}"
Enhanced prompt:`;

    const result = await model.generateContent(instruction);
    const text = result.response.text().trim();

    return NextResponse.json({ enhancedPrompt: text });
  } catch (error: any) {
    console.error('Enhance prompt API failed:', error);
    return NextResponse.json({ error: error?.message || 'Failed to enhance prompt' }, { status: 500 });
  }
}
