import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 0;

export async function GET() {
  try {
    const themePath = path.join(process.cwd(), 'src', 'config', 'theme.json');
    const raw = fs.readFileSync(themePath, 'utf8');
    const json = JSON.parse(raw);
    // Return the inner theme object directly to avoid double nesting
    return NextResponse.json({ ok: true, theme: json.theme || json });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to read theme' }, { status: 500 });
  }
}

