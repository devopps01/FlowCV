import { NextRequest, NextResponse } from 'next/server';

// Page size definitions in mm → px (at 96dpi)
const PAGE_SIZES: Record<string, { widthPx: number; format: string }> = {
  a4:     { widthPx: 794, format: 'A4' },
  letter: { widthPx: 816, format: 'letter' },
  legal:  { widthPx: 816, format: 'legal' },
  a3:     { widthPx: 1123, format: 'A3' },
  b5:     { widthPx: 665, format: 'B5' },
  a5:     { widthPx: 559, format: 'A5' },
};

/**
 * Convert image URLs in HTML to base64 data URLs so Puppeteer can render them.
 */
async function convertImagesToBase64(html: string, baseUrl: string): Promise<string> {
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  const replacements: { original: string; base64: string }[] = [];

  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.startsWith('data:')) continue;

    try {
      let imgUrl = src;
      if (src.startsWith('/')) {
        const base = new URL(baseUrl);
        imgUrl = `${base.protocol}//${base.host}${src}`;
      }

      const response = await fetch(imgUrl);
      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') || 'image/png';
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      replacements.push({ original: src, base64: `data:${contentType};base64,${base64}` });
    } catch {
      // Skip failed images
    }
  }

  let result = html;
  for (const { original, base64 } of replacements) {
    result = result.split(original).join(base64);
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { html, title, pageSize } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'html is required' }, { status: 400 });
    }

    // Convert image URLs to base64
    const processedHtml = await convertImagesToBase64(html, req.url);

    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--allow-running-insecure-content',
      ],
    });

    const page = await browser.newPage();

    // Use correct viewport width for the page size
    const sizeDef = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
    await page.setViewport({ width: sizeDef.widthPx, height: 10000, deviceScaleFactor: 1 });

    // Load HTML
    await page.setContent(processedHtml, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for fonts
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 800));

    // Remove empty/blank pages (pages with no resume content, only footer)
    // and fix last page page-break
    await page.evaluate(() => {
      const pages = document.querySelectorAll('.resume-print-page');
      const toRemove: HTMLElement[] = [];
      pages.forEach((p, idx) => {
        const el = p as HTMLElement;
        // Check for actual resume content (sections, blocks, or meaningful text beyond footer)
        const hasSections = el.querySelectorAll('[data-resume-section]').length > 0;
        const hasBlocks = el.querySelectorAll('[data-resume-block]').length > 0;
        const hasImages = el.querySelectorAll('img').length > 0;
        // Get text content excluding footer (small gray text at bottom)
        const allText = el.textContent?.trim() || '';
        const isOnlyFooter = allText.length > 0 && allText.length < 60 && !hasSections && !hasBlocks;
        if (!hasSections && !hasBlocks && !hasImages && isOnlyFooter) {
          toRemove.push(el);
        }
      });
      toRemove.forEach(el => el.remove());
      // Fix last page page-break
      const remaining = document.querySelectorAll('.resume-print-page');
      if (remaining.length > 0) {
        const last = remaining[remaining.length - 1] as HTMLElement;
        last.style.pageBreakAfter = 'auto';
        last.style.breakAfter = 'auto';
      }
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: sizeDef.format as any,
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(title || 'Resume')}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF: ' + error.message },
      { status: 500 }
    );
  }
}
