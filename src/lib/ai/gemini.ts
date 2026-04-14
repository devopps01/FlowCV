/**
 * AI utility with Gemini + local fallback.
 * If Gemini is unavailable/rate-limited, uses rule-based local enhancement.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Local fallback enhancement ───────────────────────────────────────────────

const ACTION_VERBS = [
  'Led', 'Built', 'Developed', 'Designed', 'Implemented', 'Managed',
  'Delivered', 'Optimized', 'Launched', 'Created', 'Improved', 'Increased',
  'Reduced', 'Achieved', 'Collaborated', 'Coordinated', 'Established',
  'Executed', 'Generated', 'Maintained', 'Mentored', 'Produced', 'Resolved',
  'Streamlined', 'Transformed', 'Utilized',
];

function localEnhanceText(text: string, fieldType: string): string {
  if (!text || text.trim().length < 3) return text;

  let enhanced = text.trim();

  if (fieldType === 'summary') {
    // Ensure it starts with a strong opener
    if (!/^(Results|Experienced|Skilled|Dynamic|Dedicated|Passionate|Innovative|Strategic)/i.test(enhanced)) {
      enhanced = `Results-driven professional with ${enhanced.toLowerCase()}`;
    }
    // Ensure it ends with a period
    if (!enhanced.endsWith('.')) enhanced += '.';
    return enhanced;
  }

  if (fieldType === 'description') {
    // Split into sentences and enhance each
    const sentences = enhanced.split(/[.!?]+/).filter(s => s.trim().length > 3);
    const improved = sentences.map(sentence => {
      const s = sentence.trim();
      if (!s) return '';
      // Replace weak starters with action verbs
      const weakStarters = /^(I |We |Was |Were |Did |Had |Have |Has |Worked on |Helped |Assisted with )/i;
      if (weakStarters.test(s)) {
        const verb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
        return `${verb} ${s.replace(weakStarters, '').toLowerCase()}`;
      }
      // Capitalize first letter
      return s.charAt(0).toUpperCase() + s.slice(1);
    }).filter(Boolean);

    return improved.join('. ') + (improved.length > 0 ? '.' : '');
  }

  // Default: capitalize and clean up
  enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
  if (!enhanced.endsWith('.') && !enhanced.endsWith('!') && !enhanced.endsWith('?')) {
    enhanced += '.';
  }
  return enhanced;
}

// ─── Model chain ──────────────────────────────────────────────────────────────

const MODEL_CHAIN = [
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash',
  'gemini-1.0-pro',
];

function isRateLimitError(error: any): boolean {
  const msg = String(error?.message || '');
  return msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests');
}

function isModelError(error: any): boolean {
  const msg = String(error?.message || '');
  return msg.includes('404') || msg.includes('not found') || msg.includes('not supported') || msg.includes('unavailable');
}

function parseRetrySeconds(msg: string): number {
  const m = msg.match(/retry[^0-9]*(\d+(?:\.\d+)?)\s*s/i);
  return m ? Math.ceil(parseFloat(m[1])) : 30;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateWithGemini(
  prompt: string,
  options: { fieldType?: string; fallbackText?: string } = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  // No API key — use local fallback immediately
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    if (options.fallbackText) {
      return localEnhanceText(options.fallbackText, options.fieldType || 'default');
    }
    throw new Error('GEMINI_API_KEY not configured. Add it to .env.local (get free key at aistudio.google.com)');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any;

  for (const modelName of MODEL_CHAIN) {
    for (let attempt = 0; attempt <= 1; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
      } catch (err: any) {
        lastError = err;

        if (isModelError(err)) break; // try next model

        if (isRateLimitError(err)) {
          if (attempt === 0) {
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          break; // try next model
        }

        // Other error — fall through to local
        break;
      }
    }
  }

  // All Gemini models failed — use local fallback if we have text
  if (options.fallbackText) {
    return localEnhanceText(options.fallbackText, options.fieldType || 'default');
  }

  // No fallback available
  const msg = String(lastError?.message || '');
  if (isRateLimitError(lastError)) {
    const secs = parseRetrySeconds(msg);
    throw new Error(`Rate limit reached. Please wait ${secs}s and try again, or add a paid API key.`);
  }
  throw new Error('AI service temporarily unavailable. Please try again in a moment.');
}
