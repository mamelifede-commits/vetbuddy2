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
          ? 'attachment; filename="VetBuddy_Brochure_2025.pdf"'
          : 'inline; filename="VetBuddy_Brochure_2025.pdf"',
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
