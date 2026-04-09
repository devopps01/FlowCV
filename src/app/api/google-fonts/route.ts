import { NextResponse } from 'next/server';

export const revalidate = 60 * 60 * 24; // 24h

/**
 * Returns a simplified Google Fonts list without requiring an API key.
 * Source: https://fonts.google.com/metadata/fonts
 */
export async function GET() {
  try {
    const res = await fetch('https://fonts.google.com/metadata/fonts', {
      // Keep cache friendly for repeated UI searches
      next: { revalidate },
      headers: {
        // Some environments behave better with a UA
        'User-Agent': 'flowcv/1.0',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Failed to fetch fonts (${res.status})` },
        { status: 502 },
      );
    }

    const text = await res.text();
    // Google Fonts returns: ")]}'\n{json...}"
    const cleaned = text.replace(/^\)\]\}'\s*\n/, '');
    const json = JSON.parse(cleaned) as any;

    const families: string[] =
      (json?.familyMetadataList || [])
        .map((f: any) => f?.family)
        .filter(Boolean);

    return NextResponse.json({ ok: true, families });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Unknown error' },
      { status: 500 },
    );
  }
}

