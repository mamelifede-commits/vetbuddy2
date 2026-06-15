import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request) {
  try {
    const puppeteer = require('puppeteer-core');
    
    let executablePath;
    let args;

    // Detect environment: Vercel (serverless) vs local
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      // Vercel / AWS Lambda — use @sparticuz/chromium
      const chromium = require('@sparticuz/chromium');
      executablePath = await chromium.executablePath();
      args = chromium.args;
    } else {
      // Local development — use system chromium
      executablePath = '/usr/bin/chromium';
      args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none',
      ];
    }

    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args,
    });

    const page = await browser.newPage();
    
    // Set viewport to match A4 proportions (210mm x 297mm at 96dpi)
    await page.setViewport({ width: 794, height: 1123 });
    
    // Get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Navigate to the presentazione page
    await page.goto(`${baseUrl}/presentazione`, {
      waitUntil: 'networkidle0',
      timeout: 20000,
    });

    // Hide the download button and navigation elements for PDF
    await page.evaluate(() => {
      const noprint = document.querySelectorAll('.no-print');
      noprint.forEach(el => el.style.display = 'none');
      
      // Apply page break rules to brochure pages WITHOUT forcing fixed height
      // This allows content to flow naturally across multiple A4 pages if needed
      const pages = document.querySelectorAll('.brochure-page');
      pages.forEach(p => {
        p.style.pageBreakAfter = 'always';
        p.style.breakAfter = 'page';
        p.style.pageBreakInside = 'auto';
        p.style.breakInside = 'auto';
        p.style.boxSizing = 'border-box';
        p.style.width = '210mm';
        p.style.padding = '12mm';
        p.style.overflow = 'visible';
      });
      // Remove page-break on last page
      if (pages.length > 0) {
        pages[pages.length - 1].style.pageBreakAfter = 'auto';
        pages[pages.length - 1].style.breakAfter = 'auto';
      }
      
      // Prevent cards, FAQ items and grids from being split across pages
      const grids = document.querySelectorAll('.brochure-page .grid');
      grids.forEach(g => {
        g.style.pageBreakInside = 'auto';
        g.style.breakInside = 'auto';
      });
      const cards = document.querySelectorAll('.brochure-page .grid > div, .brochure-page .bg-white.rounded-2xl, .brochure-page [class*="rounded-2xl"], .brochure-page [class*="rounded-3xl"]');
      cards.forEach(c => {
        c.style.pageBreakInside = 'avoid';
        c.style.breakInside = 'avoid';
      });
    });

    // Wait for renders to complete
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate PDF - A4 portrait, print background colors
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();

    const { searchParams } = new URL(request.url);
    const forceDownload = searchParams.get('download') === '1';

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': forceDownload
          ? 'attachment; filename="VetBuddy_Brochure_2026.pdf"'
          : 'inline; filename="VetBuddy_Brochure_2026.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store',
      },
    });
  } catch (error) {
    console.error('Brochure PDF generation error:', error);
    return NextResponse.json(
      { error: 'Errore nella generazione del PDF', details: error.message },
      { status: 500 }
    );
  }
}
