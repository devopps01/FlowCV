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

    // Width = 794px (A4 at 96dpi). Height = 10000px so ALL pages render before PDF generation.
    await page.setViewport({ width: 794, height: 10000, deviceScaleFactor: 1 });

    // Load HTML — networkidle2 is faster than networkidle0 while still waiting for fonts
    await page.setContent(html, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for Google Fonts to load and layout to stabilise
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 800));

    // Generate PDF — format:A4 + page-break-after:always on each .resume-page = correct pagination
    const pdfBuffer = await page.pdf({
      format: 'A4',
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
