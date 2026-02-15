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

// Generate professional invoice PDF
async function generateInvoicePDF(invoice) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  
  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  // Colors
  const coralColor = rgb(0.96, 0.42, 0.42);
  const darkGray = rgb(0.15, 0.15, 0.15);
  const mediumGray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.6, 0.6, 0.6);
  
  // Header - Logo area - New Brand Style (vet + buddy)
  page.drawText('vet', {
    x: margin,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: darkGray
  });
  page.drawText('buddy', {
    x: margin + 35,
    y: yPosition,
    size: 24,
    font: boldFont,
    color: coralColor
  });
  
  // Invoice title on the right
  const titleText = 'FATTURA PROFORMA';
  const titleWidth = boldFont.widthOfTextAtSize(titleText, 18);
  page.drawText(titleText, {
    x: pageWidth - margin - titleWidth,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: darkGray
  });
  
  yPosition -= 40;
  
  // Invoice number and date
  page.drawText(`N. ${invoice.invoiceNumber || 'BOZZA'}`, {
    x: pageWidth - margin - 150,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: darkGray
  });
  
  yPosition -= 18;
  page.drawText(`Data: ${invoice.issueDate || new Date().toLocaleDateString('it-IT')}`, {
    x: pageWidth - margin - 150,
    y: yPosition,
    size: 10,
    font: font,
    color: mediumGray
  });
  
  if (invoice.dueDate) {
    yPosition -= 14;
    page.drawText(`Scadenza: ${invoice.dueDate}`, {
      x: pageWidth - margin - 150,
      y: yPosition,
      size: 10,
      font: font,
      color: mediumGray
    });
  }
  
  // Reset Y for clinic info on left
  yPosition = pageHeight - margin - 50;
  
  // Clinic Info
  if (invoice.clinicName) {
    page.drawText(sanitizeText(invoice.clinicName), {
      x: margin,
      y: yPosition,
      size: 11,
      font: boldFont,
      color: darkGray
    });
    yPosition -= 14;
  }
  
  if (invoice.clinicAddress) {
    page.drawText(sanitizeText(invoice.clinicAddress), {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
      color: mediumGray
    });
    yPosition -= 14;
  }
  
  if (invoice.clinicPIVA) {
    page.drawText(`P.IVA: ${sanitizeText(invoice.clinicPIVA)}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
      color: mediumGray
    });
    yPosition -= 14;
  }
  
  if (invoice.clinicPhone) {
    page.drawText(`Tel: ${sanitizeText(invoice.clinicPhone)}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
      color: mediumGray
    });
    yPosition -= 14;
  }
  
  if (invoice.clinicEmail) {
    page.drawText(`Email: ${sanitizeText(invoice.clinicEmail)}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
      color: mediumGray
    });
  }
  
  yPosition -= 40;
  
  // Customer Info Box
  page.drawRectangle({
    x: margin,
    y: yPosition - 80,
    width: pageWidth - 2 * margin,
    height: 80,
    color: rgb(0.97, 0.97, 0.97)
  });
  
  yPosition -= 20;
  page.drawText('DESTINATARIO:', {
    x: margin + 15,
    y: yPosition,
    size: 9,
    font: boldFont,
    color: lightGray
  });
  
  yPosition -= 16;
  page.drawText(sanitizeText(invoice.customerName || 'N/A'), {
    x: margin + 15,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: darkGray
  });
  
  if (invoice.customerAddress) {
    yPosition -= 14;
    page.drawText(sanitizeText(invoice.customerAddress), {
      x: margin + 15,
      y: yPosition,
      size: 10,
      font: font,
      color: mediumGray
    });
  }
  
  if (invoice.customerCF) {
    yPosition -= 14;
    page.drawText(`C.F.: ${sanitizeText(invoice.customerCF)}`, {
      x: margin + 15,
      y: yPosition,
      size: 10,
      font: font,
      color: mediumGray
    });
  }
  
  if (invoice.customerPIVA) {
    yPosition -= 14;
    page.drawText(`P.IVA: ${sanitizeText(invoice.customerPIVA)}`, {
      x: margin + 15,
      y: yPosition,
      size: 10,
      font: font,
      color: mediumGray
    });
  }
  
  yPosition -= 50;
  
  // Pet info if present
  if (invoice.petName) {
    page.drawText(`Paziente: ${sanitizeText(invoice.petName)}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
      color: mediumGray
    });
    yPosition -= 20;
  }
  
  // Items Table Header
  const colX = {
    desc: margin,
    qty: pageWidth - margin - 180,
    price: pageWidth - margin - 120,
    total: pageWidth - margin - 60
  };
  
  // Table header background
  page.drawRectangle({
    x: margin,
    y: yPosition - 5,
    width: pageWidth - 2 * margin,
    height: 25,
    color: coralColor
  });
  
  page.drawText('Descrizione', { x: colX.desc + 10, y: yPosition, size: 10, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText('Qta', { x: colX.qty, y: yPosition, size: 10, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText('Prezzo', { x: colX.price, y: yPosition, size: 10, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText('Totale', { x: colX.total, y: yPosition, size: 10, font: boldFont, color: rgb(1, 1, 1) });
  
  yPosition -= 30;
  
  // Items
  const items = invoice.items || [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isEven = i % 2 === 0;
    
    if (isEven) {
      page.drawRectangle({
        x: margin,
        y: yPosition - 5,
        width: pageWidth - 2 * margin,
        height: 20,
        color: rgb(0.98, 0.98, 0.98)
      });
    }
    
    // Truncate long descriptions
    let desc = sanitizeText(item.description || '');
    if (desc.length > 50) desc = desc.substring(0, 47) + '...';
    
    page.drawText(desc, { x: colX.desc + 10, y: yPosition, size: 10, font: font, color: darkGray });
    page.drawText(String(item.quantity || 1), { x: colX.qty, y: yPosition, size: 10, font: font, color: darkGray });
    page.drawText(`EUR ${(item.unitPrice || 0).toFixed(2)}`, { x: colX.price, y: yPosition, size: 10, font: font, color: darkGray });
    page.drawText(`EUR ${(item.total || 0).toFixed(2)}`, { x: colX.total, y: yPosition, size: 10, font: font, color: darkGray });
    
    yPosition -= 22;
  }
  
  yPosition -= 20;
  
  // Totals section
  const totals = invoice.totals || {};
  const totalsX = pageWidth - margin - 180;
  
  // Line
  page.drawRectangle({
    x: totalsX,
    y: yPosition + 10,
    width: 180,
    height: 1,
    color: lightGray
  });
  
  // Subtotal
  page.drawText('Imponibile:', { x: totalsX, y: yPosition - 5, size: 10, font: font, color: mediumGray });
  page.drawText(`EUR ${(totals.subtotal || 0).toFixed(2)}`, { x: totalsX + 100, y: yPosition - 5, size: 10, font: font, color: darkGray });
  
  yPosition -= 18;
  
  // VAT
  page.drawText(`IVA (${totals.vatRate || 22}%):`, { x: totalsX, y: yPosition - 5, size: 10, font: font, color: mediumGray });
  page.drawText(`EUR ${(totals.vatAmount || 0).toFixed(2)}`, { x: totalsX + 100, y: yPosition - 5, size: 10, font: font, color: darkGray });
  
  yPosition -= 18;
  
  // Bollo if present
  if (totals.bolloAmount > 0) {
    page.drawText('Marca da bollo:', { x: totalsX, y: yPosition - 5, size: 10, font: font, color: mediumGray });
    page.drawText(`EUR ${totals.bolloAmount.toFixed(2)}`, { x: totalsX + 100, y: yPosition - 5, size: 10, font: font, color: darkGray });
    yPosition -= 18;
  }
  
  // Total
  page.drawRectangle({
    x: totalsX,
    y: yPosition - 25,
    width: 180,
    height: 30,
    color: coralColor
  });
  
  page.drawText('TOTALE:', { x: totalsX + 10, y: yPosition - 15, size: 12, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText(`EUR ${(totals.total || 0).toFixed(2)}`, { x: totalsX + 90, y: yPosition - 15, size: 12, font: boldFont, color: rgb(1, 1, 1) });
  
  // Notes if present
  if (invoice.notes) {
    yPosition -= 60;
    page.drawText('Note:', { x: margin, y: yPosition, size: 10, font: boldFont, color: mediumGray });
    yPosition -= 14;
    page.drawText(sanitizeText(invoice.notes).substring(0, 100), { x: margin, y: yPosition, size: 9, font: font, color: lightGray });
  }
  
  // Footer
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: 40,
    color: rgb(0.97, 0.97, 0.97)
  });
  
  page.drawText('Documento PROFORMA - Non valido ai fini fiscali', {
    x: margin,
    y: 15,
    size: 8,
    font: font,
    color: lightGray
  });
  
  page.drawText('Generato da VetBuddy - www.vetbuddy.it', {
    x: pageWidth - margin - 150,
    y: 15,
    size: 8,
    font: font,
    color: lightGray
  });
  
  return await pdfDoc.save();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const status = searchParams.get('status'); // Optional filter
    
    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinicId richiesto' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    
    // Build query
    const query = { clinicId };
    if (status) {
      query.status = status;
    }
    
    // Fetch all invoices for the clinic
    const invoices = await db.collection('invoices').find(query).sort({ createdAt: -1 }).toArray();
    
    if (!invoices || invoices.length === 0) {
      return NextResponse.json(
        { error: 'Nessuna fattura trovata' },
        { status: 404 }
      );
    }
    
    // Create ZIP file
    const zip = new JSZip();
    
    // Create folders for organization by status
    const pagate = zip.folder('Pagate');
    const emesse = zip.folder('Emesse');
    const bozze = zip.folder('Bozze');
    
    let processedCount = 0;
    
    for (const invoice of invoices) {
      try {
        // Generate PDF for each invoice
        const pdfBytes = await generateInvoicePDF(invoice);
        
        // Create filename
        const invoiceNum = invoice.invoiceNumber ? invoice.invoiceNumber.replace('/', '-') : `BOZZA_${invoice.id.substring(0, 8)}`;
        const customerName = (invoice.customerName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const fileName = `Fattura_${invoiceNum}_${customerName}.pdf`;
        
        // Add to appropriate folder
        let targetFolder = bozze;
        if (invoice.status === 'paid') {
          targetFolder = pagate;
        } else if (invoice.status === 'issued' || invoice.status === 'sent') {
          targetFolder = emesse;
        }
        
        targetFolder.file(fileName, pdfBytes);
        processedCount++;
        
      } catch (docError) {
        console.error(`Error processing invoice ${invoice.id}:`, docError);
        // Continue with other invoices
      }
    }
    
    if (processedCount === 0) {
      return NextResponse.json(
        { error: 'Nessuna fattura processata con successo' },
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
    const zipFilename = `VetBuddy_Fatture_${dateStr}.zip`;
    
    return new NextResponse(zipContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'Content-Length': zipContent.length.toString(),
        'X-Invoices-Count': processedCount.toString()
      }
    });
    
  } catch (error) {
    console.error('Download all invoices error:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione dello ZIP', details: error.message },
      { status: 500 }
    );
  }
}
