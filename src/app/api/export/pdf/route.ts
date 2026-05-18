import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { html, title } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'html is required' }, { status: 400 });
    }

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

    // 96 DPI, deviceScaleFactor=1 → 210mm = 794px exactly (A4 width at 96dpi)
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

    // Load the HTML — networkidle0 waits for Google Fonts to finish loading
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for fonts to fully render
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 600));

    // Generate PDF at A4, no margins (resume already has its own padding)
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
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
