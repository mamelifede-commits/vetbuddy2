import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const dynamic = 'force-dynamic';

// Helper to sanitize text for PDF
function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/€/g, 'EUR')
    .replace(/•/g, '-')
    .replace(/…/g, '...')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/[^\x00-\x7F]/g, '');
}

// Generate a simple PDF from text content
async function generatePDFFromText(content, documentName) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const lineHeight = 16;
  const fontSize = 11;
  
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  // Title
  page.drawText(sanitizeText(documentName), {
    x: margin,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2)
  });
  yPosition -= 40;
  
  // Content
  const lines = (content || '').split('\n');
  for (const line of lines) {
    if (yPosition < margin + 30) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    const safeLine = sanitizeText(line);
    if (safeLine.length > 0) {
      // Word wrap
      const words = safeLine.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (textWidth > pageWidth - 2 * margin && currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0.2, 0.2, 0.2)
          });
          yPosition -= lineHeight;
          currentLine = word;
          
          if (yPosition < margin + 30) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yPosition = pageHeight - margin;
          }
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0.2, 0.2, 0.2)
        });
        yPosition -= lineHeight;
      }
    } else {
      yPosition -= lineHeight / 2;
    }
  }
  
  // Footer with date
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    pages[i].drawText(`VetBuddy - Pagina ${i + 1} di ${pages.length}`, {
      x: margin,
      y: 30,
      size: 9,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });
  }
  
  return await pdfDoc.save();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const clinicId = searchParams.get('clinicId');
    const role = searchParams.get('role'); // 'owner' or 'clinic'
    
    if (!userId && !clinicId) {
      return NextResponse.json(
        { error: 'userId o clinicId richiesto' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // Build query based on role
    let query = {};
    if (role === 'clinic' && clinicId) {
      query = { clinicId: clinicId };
    } else if (role === 'owner' && userId) {
      // Support both userId and ownerId field names
      query = { $or: [{ userId: userId }, { ownerId: userId }] };
    } else if (userId) {
      query = { $or: [{ userId: userId }, { ownerId: userId }] };
    } else {
      query = { clinicId: clinicId };
    }
    
    // Fetch all documents for the user/clinic
    const documents = await db.collection('documents').find(query).toArray();
    
    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'Nessun documento trovato' },
        { status: 404 }
      );
    }
    
    // Create ZIP file
    const zip = new JSZip();
    
    // Create folders for organization
    const fattureFolder = zip.folder('Fatture');
    const prescrizioniFolder = zip.folder('Prescrizioni');
    const altriFolder = zip.folder('Altri_Documenti');
    
    let processedCount = 0;
    
    for (const doc of documents) {
      try {
        let fileData;
        let fileName = doc.name || `documento_${processedCount + 1}`;
        
        // Ensure filename has proper extension
        if (!fileName.toLowerCase().endsWith('.pdf')) {
          fileName = fileName + '.pdf';
        }
        
        // Sanitize filename
        fileName = fileName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        
        // Check if document has S3 URL or stored content
        if (doc.s3_url || doc.url) {
          // Try to fetch from S3/URL
          const docUrl = doc.s3_url || doc.url;
          try {
            const response = await fetch(docUrl);
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              fileData = new Uint8Array(arrayBuffer);
            }
          } catch (fetchError) {
            console.log(`Could not fetch document from URL: ${docUrl}`);
          }
        }
        
        // If no URL data, check for base64 or text content
        if (!fileData && doc.content) {
          // Check if it's base64 encoded PDF
          if (doc.content.startsWith('JVBERi0') || doc.content.startsWith('data:application/pdf')) {
            // It's base64 PDF
            let base64Data = doc.content;
            if (base64Data.startsWith('data:')) {
              base64Data = base64Data.split(',')[1];
            }
            fileData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          } else {
            // Plain text - generate PDF
            fileData = await generatePDFFromText(doc.content, doc.name || 'Documento');
          }
        }
        
        // If we still don't have data, create a placeholder PDF
        if (!fileData) {
          const placeholderContent = `Documento: ${doc.name || 'Sconosciuto'}\n\nCategoria: ${doc.category || 'N/A'}\nData: ${doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('it-IT') : 'N/A'}\n\nNota: Il contenuto originale di questo documento non è disponibile per il download.`;
          fileData = await generatePDFFromText(placeholderContent, doc.name || 'Documento');
        }
        
        // Determine which folder based on category
        const category = (doc.category || '').toLowerCase();
        let targetFolder = altriFolder;
        
        if (category.includes('fattura') || category.includes('invoice')) {
          targetFolder = fattureFolder;
        } else if (category.includes('prescrizione') || category.includes('prescription') || category.includes('ricetta')) {
          targetFolder = prescrizioniFolder;
        }
        
        // Add to appropriate folder
        targetFolder.file(fileName, fileData);
        processedCount++;
        
      } catch (docError) {
        console.error(`Error processing document ${doc._id || doc.id}:`, docError);
        // Continue with other documents
      }
    }
    
    if (processedCount === 0) {
      return NextResponse.json(
        { error: 'Nessun documento processato con successo' },
        { status: 500 }
      );
    }
    
    // Generate ZIP file
    const zipContent = await zip.generateAsync({ 
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const zipFilename = role === 'clinic' 
      ? `VetBuddy_Documenti_Clinica_${dateStr}.zip`
      : `VetBuddy_I_Miei_Documenti_${dateStr}.zip`;
    
    return new NextResponse(zipContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'Content-Length': zipContent.length.toString(),
        'X-Documents-Count': processedCount.toString()
      }
    });
    
  } catch (error) {
    console.error('Download all documents error:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione dello ZIP', details: error.message },
      { status: 500 }
    );
  }
}
