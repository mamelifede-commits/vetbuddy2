import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ownerTutorial, clinicTutorial, labTutorial } from './tutorial-content';

export const dynamic = 'force-dynamic';

// Helper: sanitize text for PDF — keeps Italian accented chars (WinAnsi supported)
function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/•/g, '-')
    .replace(/…/g, '...')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/[^\x00-\xFF]/g, '');
}

// ==========================================================================
//  PDF GENERATION (PROFESSIONAL STYLE)
// ==========================================================================
async function generateTutorialPDF(tutorial) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  const lineHeight = 14;
  const sectionGap = 25;

  // Colors
  const coralColor = rgb(0.96, 0.42, 0.42);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const mediumGray = rgb(0.45, 0.45, 0.45);
  const lightGray = rgb(0.7, 0.7, 0.7);
  const bgLight = rgb(0.97, 0.97, 0.97);

  // Helper: Add new page
  const addPage = () => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    return { page, y: pageHeight - margin };
  };

  // Helper: Draw wrapped text
  const drawWrappedText = (page, text, x, y, maxWidth, fontSize, textFont, color) => {
    const safeText = sanitizeText(text);
    const words = safeText.split(' ');
    let currentLine = '';
    let currentY = y;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = textFont.widthOfTextAtSize(testLine, fontSize);

      if (textWidth > maxWidth && currentLine) {
        page.drawText(currentLine, { x, y: currentY, size: fontSize, font: textFont, color });
        currentY -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, { x, y: currentY, size: fontSize, font: textFont, color });
      currentY -= lineHeight;
    }

    return currentY;
  };

  // ==================== PAGE 1: COVER ====================
  let { page, y } = addPage();

  page.drawRectangle({
    x: 0, y: pageHeight - 120, width: pageWidth, height: 120,
    color: coralColor
  });

  // Brand: "VetBuddy" with consistent casing
  page.drawText('Vet', {
    x: margin, y: pageHeight - 70, size: 36, font: boldFont, color: rgb(1, 1, 1)
  });
  page.drawText('Buddy', {
    x: margin + boldFont.widthOfTextAtSize('Vet', 36), y: pageHeight - 70, size: 36, font: font, color: rgb(1, 1, 1)
  });

  // Dynamic subtitle
  let coverSubtitle = 'Guida per Proprietari di Animali';
  if (tutorial.title.includes('Cliniche')) coverSubtitle = 'Guida per Cliniche Veterinarie';
  else if (tutorial.title.includes('Laboratori')) coverSubtitle = 'Guida per Laboratori di Analisi';

  page.drawText(sanitizeText(coverSubtitle), {
    x: margin, y: pageHeight - 100, size: 14, font: font, color: rgb(1, 1, 1)
  });

  y = pageHeight - 170;

  y = drawWrappedText(page, tutorial.subtitle, margin, y, contentWidth, 16, font, darkGray);
  y -= 40;

  // Quick Start Box
  page.drawRectangle({
    x: margin, y: y - 120, width: contentWidth, height: 130,
    color: bgLight
  });
  page.drawRectangle({
    x: margin, y: y - 120, width: 4, height: 130,
    color: coralColor
  });

  page.drawText('PER INIZIARE', {
    x: margin + 20, y: y - 20, size: 12, font: boldFont, color: coralColor
  });

  let qsY = y - 45;
  tutorial.quickStart.forEach((step, i) => {
    page.drawText(`${i + 1}.`, {
      x: margin + 20, y: qsY, size: 11, font: boldFont, color: coralColor
    });
    page.drawText(sanitizeText(step), {
      x: margin + 40, y: qsY, size: 11, font: font, color: darkGray
    });
    qsY -= 20;
  });

  y -= 160;

  page.drawText(`Generato il ${new Date().toLocaleDateString('it-IT')}`, {
    x: margin, y: margin + 20, size: 9, font: font, color: lightGray
  });
  page.drawText('www.vetbuddy.it', {
    x: pageWidth - margin - 80, y: margin + 20, size: 9, font: boldFont, color: coralColor
  });

  // ==================== PAGE 2: INDEX ====================
  ({ page, y } = addPage());

  page.drawText('INDICE', {
    x: margin, y, size: 18, font: boldFont, color: coralColor
  });
  y -= 30;

  tutorial.sections.forEach((section, i) => {
    page.drawText(`${i + 1}. ${sanitizeText(section.title)}`, {
      x: margin, y, size: 11, font: font, color: darkGray
    });
    y -= 20;
  });

  y -= 10;
  let idxNum = tutorial.sections.length + 1;
  if (tutorial.onboarding) {
    page.drawText(`${idxNum}. ${sanitizeText(tutorial.onboarding.title)}`, {
      x: margin, y, size: 11, font: font, color: darkGray
    });
    y -= 20;
    idxNum++;
  }
  page.drawText(`${idxNum}. DOMANDE FREQUENTI`, {
    x: margin, y, size: 11, font: font, color: darkGray
  });
  y -= 20;
  page.drawText(`${idxNum + 1}. CONTATTI E SUPPORTO`, {
    x: margin, y, size: 11, font: font, color: darkGray
  });

  // ==================== CONTENT SECTIONS ====================
  // Always start content on a new page after index
  ({ page, y } = addPage());

  for (let i = 0; i < tutorial.sections.length; i++) {
    const section = tutorial.sections[i];

    // Check if we need a new page
    if (y < 250) {
      ({ page, y } = addPage());
    }

    y -= sectionGap;

    page.drawRectangle({
      x: margin, y: y - 5, width: contentWidth, height: 30,
      color: coralColor
    });

    page.drawText(`${i + 1}. ${sanitizeText(section.title)}`, {
      x: margin + 10, y, size: 12, font: boldFont, color: rgb(1, 1, 1)
    });

    y -= 40;

    for (const item of section.content) {
      if (y < 100) {
        ({ page, y } = addPage());
      }

      page.drawText('-', {
        x: margin, y, size: 10, font: font, color: coralColor
      });

      y = drawWrappedText(page, item, margin + 15, y, contentWidth - 15, 10, font, darkGray);
      y -= 6;
    }

    if (section.tip) {
      y -= 10;

      if (y < 80) {
        ({ page, y } = addPage());
      }

      // Measure tip height
      const tipLines = Math.ceil(sanitizeText(section.tip).length / 70);
      const tipBoxHeight = Math.max(40, 22 + tipLines * 14);

      page.drawRectangle({
        x: margin, y: y - tipBoxHeight + 10, width: contentWidth, height: tipBoxHeight,
        color: bgLight
      });

      page.drawText('Nota:', {
        x: margin + 10, y: y - 10, size: 9, font: boldFont, color: coralColor
      });

      drawWrappedText(page, section.tip, margin + 10, y - 22, contentWidth - 20, 9, font, mediumGray);

      y -= tipBoxHeight + 10;
    }
  }

  // ==================== ONBOARDING SECTION ====================
  if (tutorial.onboarding) {
    const ob = tutorial.onboarding;
    ({ page, y } = addPage());

    // Section header - CORAL
    page.drawRectangle({
      x: margin, y: y - 5, width: contentWidth, height: 30,
      color: coralColor
    });

    const obIdx = tutorial.sections.length + 1;
    page.drawText(`${obIdx}. ${sanitizeText(ob.title)}`, {
      x: margin + 10, y, size: 12, font: boldFont, color: rgb(1, 1, 1)
    });

    y -= 45;
    y = drawWrappedText(page, ob.subtitle, margin, y, contentWidth, 10, font, mediumGray);
    y -= 20;

    // First 10 minutes
    page.drawText(sanitizeText(ob.first10.title), {
      x: margin, y, size: 11, font: boldFont, color: darkGray
    });
    y -= 20;

    for (const item of ob.first10.items) {
      if (y < 80) ({ page, y } = addPage());
      page.drawText('-', { x: margin + 10, y, size: 10, font: font, color: coralColor });
      y = drawWrappedText(page, item, margin + 25, y, contentWidth - 25, 10, font, darkGray);
      y -= 6;
    }

    y -= 15;

    // First week
    if (y < 200) ({ page, y } = addPage());
    page.drawText(sanitizeText(ob.firstWeek.title), {
      x: margin, y, size: 11, font: boldFont, color: darkGray
    });
    y -= 20;

    for (const item of ob.firstWeek.items) {
      if (y < 80) ({ page, y } = addPage());
      page.drawText('-', { x: margin + 10, y, size: 10, font: font, color: coralColor });
      y = drawWrappedText(page, item, margin + 25, y, contentWidth - 25, 10, font, darkGray);
      y -= 6;
    }

    y -= 15;

    // Checklist
    if (y < 200) ({ page, y } = addPage());

    const checklistHeight = ob.checklist.items.length * 18 + 40;
    page.drawRectangle({
      x: margin, y: y - checklistHeight + 10, width: contentWidth,
      height: checklistHeight,
      color: bgLight
    });

    page.drawText(sanitizeText(ob.checklist.title), {
      x: margin + 10, y, size: 11, font: boldFont, color: coralColor
    });
    y -= 22;

    for (const item of ob.checklist.items) {
      if (y < 60) ({ page, y } = addPage());
      page.drawText('[ ]', { x: margin + 10, y, size: 10, font: font, color: coralColor });
      page.drawText(sanitizeText(item), { x: margin + 32, y, size: 10, font: font, color: darkGray });
      y -= 18;
    }

    y -= 15;
  }

  // ==================== FAQ PAGE (always new page) ====================
  ({ page, y } = addPage());

  page.drawRectangle({
    x: margin, y: y - 5, width: contentWidth, height: 30,
    color: coralColor
  });

  const faqIdx = tutorial.sections.length + (tutorial.onboarding ? 2 : 1);
  page.drawText(`${faqIdx}. DOMANDE FREQUENTI`, {
    x: margin + 10, y, size: 12, font: boldFont, color: rgb(1, 1, 1)
  });

  y -= 45;

  for (const faq of tutorial.faqs) {
    if (y < 100) {
      ({ page, y } = addPage());
    }

    y = drawWrappedText(page, `D: ${faq.q}`, margin, y, contentWidth, 10, boldFont, darkGray);
    y -= 4;

    y = drawWrappedText(page, `R: ${faq.a}`, margin, y, contentWidth, 10, font, mediumGray);
    y -= 15;
  }

  // ==================== CONTACT PAGE ====================
  if (y < 250) {
    ({ page, y } = addPage());
  }

  y -= sectionGap;

  page.drawRectangle({
    x: margin, y: y - 5, width: contentWidth, height: 30,
    color: coralColor
  });

  page.drawText(`${faqIdx + 1}. CONTATTI E SUPPORTO`, {
    x: margin + 10, y, size: 12, font: boldFont, color: rgb(1, 1, 1)
  });

  y -= 50;

  page.drawText('Sito web:', {
    x: margin, y, size: 10, font: boldFont, color: darkGray
  });
  page.drawText(sanitizeText(tutorial.contacts.website), {
    x: margin + 80, y, size: 10, font: font, color: coralColor
  });

  y -= 20;

  page.drawText('Email:', {
    x: margin, y, size: 10, font: boldFont, color: darkGray
  });
  page.drawText(sanitizeText(tutorial.contacts.email), {
    x: margin + 80, y, size: 10, font: font, color: coralColor
  });

  y -= 40;

  page.drawText('Per assistenza puoi contattarci via email o tramite la piattaforma.', {
    x: margin, y, size: 10, font: font, color: mediumGray
  });

  // ==================== ADD PAGE NUMBERS & FOOTER ====================
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const pg = pages[i];

    pg.drawRectangle({
      x: margin, y: 15, width: contentWidth, height: 0.5,
      color: rgb(0.9, 0.9, 0.9)
    });

    if (i > 0) {
      pg.drawText(`Pagina ${i}`, {
        x: pageWidth / 2 - 20, y: 5, size: 8, font: font, color: lightGray
      });
    }

    // Footer brand: "VetBuddy"
    pg.drawText('Vet', {
      x: margin, y: 5, size: 8, font: boldFont, color: darkGray
    });
    pg.drawText('Buddy', {
      x: margin + boldFont.widthOfTextAtSize('Vet', 8), y: 5, size: 8, font: font, color: coralColor
    });
  }

  return await pdfDoc.save();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'owner';

    let tutorial, filename;
    if (type === 'clinic') {
      tutorial = clinicTutorial;
      filename = 'VetBuddy_Guida_Cliniche.pdf';
    } else if (type === 'lab') {
      tutorial = labTutorial;
      filename = 'VetBuddy_Guida_Laboratori.pdf';
    } else {
      tutorial = ownerTutorial;
      filename = 'VetBuddy_Guida_Proprietari.pdf';
    }

    const pdfBytes = await generateTutorialPDF(tutorial);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });

  } catch (error) {
    console.error('Tutorial PDF generation error:', error);
    return NextResponse.json(
      { error: 'Errore durante la generazione del PDF', details: error.message },
      { status: 500 }
    );
  }
}
