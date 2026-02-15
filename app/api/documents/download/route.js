import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const dynamic = 'force-dynamic';

// Helper function to return user-friendly error page
function errorPage(message, details = '') {
  const html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Errore - VetBuddy</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #FFF5F5 0%, #FFF0F0 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        h1 {
          color: #FF6B6B;
          font-size: 24px;
          margin-bottom: 12px;
        }
        p {
          color: #666;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .back-btn {
          display: inline-block;
          background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
          color: white;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 16px;
        }
        .details {
          margin-top: 20px;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 8px;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📄❌</div>
        <h1>${message}</h1>
        <p>Non è stato possibile caricare il documento richiesto. Torna indietro e riprova.</p>
        <a href="javascript:history.back()" class="back-btn">← Torna indietro</a>
        ${details ? `<div class="details">${details}</div>` : ''}
      </div>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

// Helper to check if content is valid base64 PDF
function isValidBase64PDF(content) {
  if (!content || typeof content !== 'string') return false;
  
  // Remove data URL prefix if present
  let base64Content = content;
  if (base64Content.startsWith('data:')) {
    base64Content = base64Content.split(',')[1];
  }
  
  // PDF files in base64 typically start with 'JVBERi' (which is '%PDF-' encoded)
  if (base64Content.startsWith('JVBERi')) return true;
  
  // Also check for PDF magic bytes after decoding first few chars
  try {
    const decoded = Buffer.from(base64Content.substring(0, 20), 'base64').toString('ascii');
    return decoded.startsWith('%PDF-');
  } catch {
    return false;
  }
}

// Generate a PDF from plain text content
async function generatePDFFromText(text, title, metadata = {}) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 595; // A4 width in points
  const pageHeight = 842; // A4 height in points
  const margin = 50;
  const lineHeight = 20;
  const titleSize = 18;
  const textSize = 12;
  
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  // VetBuddy Header - New Brand Style (vet + buddy)
  page.drawText('vet', {
    x: margin,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2), // Dark gray for "vet"
  });
  page.drawText('buddy', {
    x: margin + 35, // positioned after "vet"
    y: yPosition,
    size: 24,
    font: boldFont,
    color: rgb(0.96, 0.42, 0.42), // Coral color for "buddy"
  });
  yPosition -= 15;
  
  page.drawText('Gestionale Veterinario', {
    x: margin,
    y: yPosition,
    size: 10,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  yPosition -= 30;
  
  // Horizontal line
  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: pageWidth - margin, y: yPosition },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  yPosition -= 30;
  
  // Document title
  page.drawText(title || 'Documento', {
    x: margin,
    y: yPosition,
    size: titleSize,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  yPosition -= 30;
  
  // Metadata (date, pet name, etc.)
  if (metadata.petName) {
    page.drawText(`Animale: ${metadata.petName}`, {
      x: margin,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= lineHeight;
  }
  
  if (metadata.ownerName) {
    page.drawText(`Proprietario: ${metadata.ownerName}`, {
      x: margin,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= lineHeight;
  }
  
  if (metadata.date) {
    page.drawText(`Data: ${new Date(metadata.date).toLocaleDateString('it-IT')}`, {
      x: margin,
      y: yPosition,
      size: 11,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
    });
    yPosition -= lineHeight;
  }
  
  yPosition -= 20;
  
  // Content
  const lines = text.split('\n');
  for (const line of lines) {
    // Word wrap for long lines
    const words = line.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, textSize);
      
      if (textWidth > pageWidth - 2 * margin) {
        if (yPosition < margin + 50) {
          // New page needed
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }
        
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: textSize,
          font: font,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPosition -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      if (yPosition < margin + 50) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
      }
      
      page.drawText(currentLine, {
        x: margin,
        y: yPosition,
        size: textSize,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= lineHeight;
    }
  }
  
  // Footer
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const pg = pages[i];
    pg.drawText(`Generato da VetBuddy - www.vetbuddy.it`, {
      x: margin,
      y: 30,
      size: 8,
      font: font,
      color: rgb(0.6, 0.6, 0.6),
    });
    pg.drawText(`Pagina ${i + 1} di ${pages.length}`, {
      x: pageWidth - margin - 60,
      y: 30,
      size: 8,
      font: font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }
  
  return await pdfDoc.save();
}

// GET - Scarica un documento (PDF)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return errorPage('ID documento mancante', 'Nessun ID fornito nella richiesta');
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Recupera il documento
    const document = await db.collection('documents').findOne({ id: documentId });
    
    if (!document) {
      return errorPage('Documento non trovato', `ID: ${documentId}`);
    }

    // Check if we have content or a URL
    if (!document.content && !document.fileUrl && !document.s3_url) {
      return errorPage('Contenuto non disponibile', 'Il file non è stato salvato correttamente');
    }

    // If we have a URL, redirect to it
    if (!document.content && (document.fileUrl || document.s3_url)) {
      const url = document.fileUrl || document.s3_url;
      return NextResponse.redirect(url);
    }

    // Determine filename
    const filename = document.fileName || document.name || 'documento.pdf';

    // Check if content is valid base64 PDF
    if (isValidBase64PDF(document.content)) {
      // Valid PDF - decode and return
      let base64Content = document.content;
      if (base64Content.startsWith('data:')) {
        base64Content = base64Content.split(',')[1];
      }
      
      const pdfBuffer = Buffer.from(base64Content, 'base64');
      const contentType = document.mimeType || document.fileType || 'application/pdf';

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${filename}"`,
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'private, max-age=3600',
        },
      });
    } else {
      // Plain text content - generate PDF from it
      console.log('Generating PDF from plain text for document:', documentId);
      
      // Get additional metadata for the PDF
      let petName = document.petName;
      let ownerName = document.ownerName;
      
      // Try to fetch pet and owner info if IDs are present
      if (document.petId && !petName) {
        const pet = await db.collection('pets').findOne({ id: document.petId });
        petName = pet?.name;
      }
      
      if (document.ownerId && !ownerName) {
        const owner = await db.collection('users').findOne({ id: document.ownerId });
        ownerName = owner?.name;
      }
      
      const pdfBytes = await generatePDFFromText(
        document.content,
        document.name || 'Prescrizione Medica',
        {
          petName,
          ownerName,
          date: document.createdAt || document.date,
        }
      );
      
      const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

      return new NextResponse(pdfBytes, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${pdfFilename}"`,
          'Content-Length': pdfBytes.length.toString(),
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

  } catch (error) {
    console.error('Document download error:', error);
    return errorPage('Errore di sistema', error.message);
  }
}
