/**
 * AI service — multi-provider with automatic fallback chain:
 * 1. Groq (FREE — llama3, mixtral — fast, generous limits)
 * 2. Gemini (FREE tier — google)
 * 3. OpenAI (paid)
 * 4. Local rule-based enhancement (always works, no API needed)
 *
 * Configure in .env.local:
 *   GROQ_API_KEY=...       get free at console.groq.com
 *   GEMINI_API_KEY=...     get free at aistudio.google.com
 *   OPENAI_API_KEY=...     get at platform.openai.com
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Local rule-based fallback (always works) ─────────────────────────────────

const ACTION_VERBS = [
  'Led', 'Built', 'Developed', 'Designed', 'Implemented', 'Managed',
  'Delivered', 'Optimized', 'Launched', 'Created', 'Improved', 'Increased',
  'Reduced', 'Achieved', 'Collaborated', 'Coordinated', 'Established',
  'Executed', 'Generated', 'Maintained', 'Mentored', 'Produced', 'Resolved',
  'Streamlined', 'Transformed', 'Spearheaded', 'Accelerated', 'Drove',
  'Engineered', 'Pioneered', 'Championed', 'Facilitated', 'Oversaw',
  'Directed', 'Delivered', 'Architected', 'Scaled', 'Automated',
];

const WEAK_STARTERS = /^(I |We |Was |Were |Did |Had |Have |Has |Worked on |Helped |Assisted with |Responsible for |Duties included |My role was )/i;

function localEnhanceText(text: string, fieldType: string): string {
  if (!text || text.trim().length < 3) return text;
  let enhanced = text.trim();

  if (fieldType === 'summary') {
    const openers = [
      'Results-driven', 'Accomplished', 'Dynamic', 'Experienced', 'Skilled',
      'Dedicated', 'Innovative', 'Strategic', 'Passionate', 'Versatile',
      'High-performing', 'Goal-oriented', 'Detail-oriented', 'Proactive',
    ];
    const hasOpener = new RegExp(`^(${openers.join('|')})`, 'i').test(enhanced);
    if (!hasOpener) {
      const opener = openers[Math.floor(Math.random() * openers.length)];
      enhanced = `${opener} professional with ${enhanced.charAt(0).toLowerCase()}${enhanced.slice(1)}`;
    }
    if (!enhanced.endsWith('.')) enhanced += '.';
    return enhanced;
  }

  if (fieldType === 'description') {
    // Split on sentence boundaries
    const sentences = enhanced.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 3);
    const improved = sentences.map(sentence => {
      const s = sentence.trim();
      if (!s) return '';
      if (WEAK_STARTERS.test(s)) {
        const verb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
        const rest = s.replace(WEAK_STARTERS, '').trim();
        return `${verb} ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`;
      }
      return s.charAt(0).toUpperCase() + s.slice(1);
    }).filter(Boolean);
    const joined = improved.join(' ');
    return joined + (!joined.match(/[.!?]$/) ? '.' : '');
  }

  enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
  if (!enhanced.match(/[.!?]$/)) enhanced += '.';
  return enhanced;
}

// ─── Groq (FREE — OpenAI-compatible, very fast) ───────────────────────────────

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

async function tryGroq(prompt: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.startsWith('your_')) return null;

  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2048,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (res.status === 429) continue; // rate limited, try next model
      if (!res.ok) continue;

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch {
      continue;
    }
  }
  return null;
}

// ─── Gemini (FREE tier) ───────────────────────────────────────────────────────

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

async function tryGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith('your_')) return null;

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text) return text;
    } catch {
      continue;
    }
  }
  return null;
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────

async function tryOpenAI(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith('your_')) return null;

  for (const model of ['gpt-4o-mini', 'gpt-3.5-turbo']) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2048,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (res.status === 429) continue;
      if (!res.ok) continue;

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch {
      continue;
    }
  }
  return null;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateWithAI(
  prompt: string,
  options: { fieldType?: string; fallbackText?: string } = {}
): Promise<string> {
  console.log('🤖 AI Request:', { fieldType: options.fieldType, hasText: !!options.fallbackText });
  
  // Try all AI providers in order — first one that works wins
  const providers = [
    { name: 'Groq', fn: tryGroq },
    { name: 'Gemini', fn: tryGemini },
    { name: 'OpenAI', fn: tryOpenAI }
  ];

  for (const provider of providers) {
    try {
      console.log(`🔄 Trying ${provider.name}...`);
      const result = await provider.fn(prompt);
      if (result && result.trim().length > 0) {
        console.log(`✅ ${provider.name} succeeded!`);
        return result;
      }
      console.log(`❌ ${provider.name} returned empty`);
    } catch (error: any) {
      console.log(`❌ ${provider.name} failed:`, error.message);
    }
  }

  console.log('⚠️ All AI providers failed, using local enhancement');

  // All AI providers failed — use local enhancement if we have text
  if (options.fallbackText) {
    const enhanced = localEnhanceText(options.fallbackText, options.fieldType || 'default');
    console.log('✅ Local enhancement succeeded');
    return enhanced;
  }

  // For resume/cover-letter generation — return empty, caller handles gracefully
  if (options.fieldType === 'resume' || options.fieldType === 'cover-letter') {
    console.log('❌ No fallback for resume/cover-letter generation');
    return '';
  }

  // For field enhancement with no text at all
  console.log('❌ No text provided for enhancement');
  throw new Error('AI service temporarily unavailable. Please try again in a moment.');
}

// Backward-compatible alias
export const generateWithGemini = generateWithAI;
