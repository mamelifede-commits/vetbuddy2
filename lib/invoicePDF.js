import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';

/**
 * Genera un PDF della fattura e lo restituisce come Buffer
 * @param {Object} invoice - Oggetto fattura dal database
 * @returns {Promise<Buffer>} - Buffer del PDF generato
 */
export async function generateInvoicePDF(invoice) {
  try {
    // Crea un nuovo documento PDF
    const pdfDoc = await PDFDocument.create();
    
    // Embed font standard
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Aggiungi una pagina
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    
    // Colori
    const primaryColor = rgb(1, 0.42, 0.42); // #FF6B6B
    const darkGray = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.4, 0.4, 0.4);
    const bgGray = rgb(0.96, 0.96, 0.96);
    
    let yPos = height - 50;
    
    // ========== HEADER ==========
    // Logo/Titolo
    page.drawText('VetBuddy', {
      x: 50,
      y: yPos,
      size: 28,
      font: helveticaBold,
      color: primaryColor,
    });
    
    page.drawText('Sistema Gestionale Veterinario', {
      x: 50,
      y: yPos - 22,
      size: 10,
      font: helvetica,
      color: lightGray,
    });
    
    // FATTURA (destra)
    page.drawText('FATTURA', {
      x: width - 150,
      y: yPos,
      size: 24,
      font: helveticaBold,
      color: darkGray,
    });
    
    page.drawText(`N. ${invoice.invoiceNumber}`, {
      x: width - 150,
      y: yPos - 25,
      size: 14,
      font: helveticaBold,
      color: primaryColor,
    });
    
    // Linea separatrice
    yPos -= 50;
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 2,
      color: primaryColor,
    });
    
    // ========== INFO CLINICA E CLIENTE ==========
    yPos -= 30;
    
    // Clinica (sinistra)
    page.drawText('DA:', {
      x: 50,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: primaryColor,
    });
    
    page.drawText(invoice.clinicName || 'Clinica Veterinaria', {
      x: 50,
      y: yPos - 15,
      size: 11,
      font: helveticaBold,
      color: darkGray,
    });
    
    if (invoice.clinicAddress) {
      page.drawText(invoice.clinicAddress, {
        x: 50,
        y: yPos - 30,
        size: 9,
        font: helvetica,
        color: lightGray,
      });
    }
    
    if (invoice.clinicPhone) {
      page.drawText(invoice.clinicPhone, {
        x: 50,
        y: yPos - 42,
        size: 9,
        font: helvetica,
        color: lightGray,
      });
    }
    
    if (invoice.clinicEmail) {
      page.drawText(invoice.clinicEmail, {
        x: 50,
        y: yPos - 54,
        size: 9,
        font: helvetica,
        color: lightGray,
      });
    }
    
    // Cliente (destra)
    page.drawText('A:', {
      x: 350,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: primaryColor,
    });
    
    page.drawText(invoice.customerName || 'Cliente', {
      x: 350,
      y: yPos - 15,
      size: 11,
      font: helveticaBold,
      color: darkGray,
    });
    
    if (invoice.customerAddress) {
      page.drawText(invoice.customerAddress, {
        x: 350,
        y: yPos - 30,
        size: 9,
        font: helvetica,
        color: lightGray,
      });
    }
    
    if (invoice.customerCF) {
      page.drawText(`C.F.: ${invoice.customerCF}`, {
        x: 350,
        y: yPos - 42,
        size: 9,
        font: helvetica,
        color: lightGray,
      });
    }
    
    if (invoice.customerEmail) {
      page.drawText(invoice.customerEmail, {
        x: 350,
        y: yPos - 54,
        size: 9,
        font: helvetica,
        color: lightGray,
      });
    }
    
    // ========== INFO FATTURA ==========
    yPos -= 90;
    
    // Box info
    page.drawRectangle({
      x: 50,
      y: yPos - 40,
      width: width - 100,
      height: 45,
      color: bgGray,
    });
    
    page.drawText('Data Emissione:', {
      x: 60,
      y: yPos - 12,
      size: 9,
      font: helvetica,
      color: lightGray,
    });
    page.drawText(invoice.issueDate || new Date().toLocaleDateString('it-IT'), {
      x: 60,
      y: yPos - 27,
      size: 10,
      font: helveticaBold,
      color: darkGray,
    });
    
    page.drawText('Scadenza:', {
      x: 200,
      y: yPos - 12,
      size: 9,
      font: helvetica,
      color: lightGray,
    });
    page.drawText(invoice.dueDate || '-', {
      x: 200,
      y: yPos - 27,
      size: 10,
      font: helveticaBold,
      color: darkGray,
    });
    
    page.drawText('Stato:', {
      x: 340,
      y: yPos - 12,
      size: 9,
      font: helvetica,
      color: lightGray,
    });
    const statusText = invoice.status === 'paid' ? 'PAGATA' : invoice.status === 'issued' ? 'Emessa' : 'Bozza';
    page.drawText(statusText, {
      x: 340,
      y: yPos - 27,
      size: 10,
      font: helveticaBold,
      color: invoice.status === 'paid' ? rgb(0.2, 0.7, 0.3) : darkGray,
    });
    
    if (invoice.petName) {
      page.drawText('Paziente:', {
        x: 440,
        y: yPos - 12,
        size: 9,
        font: helvetica,
        color: lightGray,
      });
      page.drawText(invoice.petName, {
        x: 440,
        y: yPos - 27,
        size: 10,
        font: helveticaBold,
        color: darkGray,
      });
    }
    
    // ========== TABELLA ITEMS ==========
    yPos -= 70;
    
    // Header tabella
    page.drawRectangle({
      x: 50,
      y: yPos - 20,
      width: width - 100,
      height: 25,
      color: primaryColor,
    });
    
    page.drawText('Descrizione', {
      x: 60,
      y: yPos - 13,
      size: 10,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });
    
    page.drawText('Qta', {
      x: 350,
      y: yPos - 13,
      size: 10,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });
    
    page.drawText('Prezzo', {
      x: 410,
      y: yPos - 13,
      size: 10,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });
    
    page.drawText('Totale', {
      x: 490,
      y: yPos - 13,
      size: 10,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });
    
    yPos -= 20;
    
    // Righe items
    const items = invoice.items || [];
    items.forEach((item, index) => {
      yPos -= 25;
      
      if (index % 2 === 1) {
        page.drawRectangle({
          x: 50,
          y: yPos - 5,
          width: width - 100,
          height: 25,
          color: bgGray,
        });
      }
      
      // Tronca descrizione se troppo lunga
      let desc = item.description || '';
      if (desc.length > 45) desc = desc.substring(0, 42) + '...';
      
      page.drawText(desc, {
        x: 60,
        y: yPos + 5,
        size: 9,
        font: helvetica,
        color: darkGray,
      });
      
      page.drawText((item.quantity || 1).toString(), {
        x: 355,
        y: yPos + 5,
        size: 9,
        font: helvetica,
        color: darkGray,
      });
      
      page.drawText(`€${(item.unitPrice || 0).toFixed(2)}`, {
        x: 410,
        y: yPos + 5,
        size: 9,
        font: helvetica,
        color: darkGray,
      });
      
      page.drawText(`€${(item.total || 0).toFixed(2)}`, {
        x: 490,
        y: yPos + 5,
        size: 9,
        font: helveticaBold,
        color: darkGray,
      });
    });
    
    // Linea sotto la tabella
    yPos -= 10;
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    });
    
    // ========== TOTALI ==========
    yPos -= 30;
    
    const totals = invoice.totals || {};
    
    // Box totali
    page.drawRectangle({
      x: 350,
      y: yPos - 80,
      width: width - 400,
      height: 100,
      color: bgGray,
    });
    
    page.drawText('Imponibile:', {
      x: 360,
      y: yPos - 5,
      size: 9,
      font: helvetica,
      color: lightGray,
    });
    page.drawText(`€${(totals.subtotal || 0).toFixed(2)}`, {
      x: 490,
      y: yPos - 5,
      size: 9,
      font: helveticaBold,
      color: darkGray,
    });
    
    page.drawText(`IVA (${totals.vatRate || 22}%):`, {
      x: 360,
      y: yPos - 22,
      size: 9,
      font: helvetica,
      color: lightGray,
    });
    page.drawText(`€${(totals.vatAmount || 0).toFixed(2)}`, {
      x: 490,
      y: yPos - 22,
      size: 9,
      font: helveticaBold,
      color: darkGray,
    });
    
    if (totals.bolloAmount && totals.bolloAmount > 0) {
      page.drawText('Marca da bollo:', {
        x: 360,
        y: yPos - 39,
        size: 9,
        font: helvetica,
        color: lightGray,
      });
      page.drawText(`€${totals.bolloAmount.toFixed(2)}`, {
        x: 490,
        y: yPos - 39,
        size: 9,
        font: helveticaBold,
        color: darkGray,
      });
    }
    
    // Linea prima del totale
    page.drawLine({
      start: { x: 360, y: yPos - 55 },
      end: { x: width - 60, y: yPos - 55 },
      thickness: 2,
      color: primaryColor,
    });
    
    // Totale
    page.drawText('TOTALE:', {
      x: 360,
      y: yPos - 75,
      size: 14,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText(`€${(totals.total || 0).toFixed(2)}`, {
      x: 465,
      y: yPos - 75,
      size: 14,
      font: helveticaBold,
      color: primaryColor,
    });
    
    // ========== NOTE ==========
    if (invoice.notes) {
      yPos -= 110;
      page.drawText('Note:', {
        x: 50,
        y: yPos,
        size: 9,
        font: helveticaBold,
        color: lightGray,
      });
      
      // Tronca note se troppo lunghe
      let notes = invoice.notes;
      if (notes.length > 100) notes = notes.substring(0, 97) + '...';
      
      page.drawText(notes, {
        x: 50,
        y: yPos - 15,
        size: 9,
        font: helvetica,
        color: darkGray,
      });
    }
    
    // ========== FOOTER ==========
    page.drawText(
      'Documento generato automaticamente da VetBuddy - Sistema Gestionale per Cliniche Veterinarie',
      {
        x: 100,
        y: 50,
        size: 8,
        font: helvetica,
        color: lightGray,
      }
    );
    
    page.drawText(
      `www.vetbuddy.it | Generato il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}`,
      {
        x: 150,
        y: 38,
        size: 8,
        font: helvetica,
        color: lightGray,
      }
    );
    
    // Serializza il PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Salva il PDF della fattura nel database come documento
 * @param {Object} db - Connessione al database
 * @param {Object} invoice - Oggetto fattura
 * @param {Buffer} pdfBuffer - Buffer del PDF
 * @returns {Object} - Documento creato
 */
export async function saveInvoicePDFAsDocument(db, invoice, pdfBuffer) {
  const documentId = uuidv4();
  const fileName = `Fattura_${invoice.invoiceNumber.replace('/', '-')}.pdf`;
  
  // Converti buffer in base64 per storage
  const pdfBase64 = pdfBuffer.toString('base64');
  
  const document = {
    id: documentId,
    type: 'invoice',
    category: 'fattura',
    name: fileName,
    fileName: fileName,
    mimeType: 'application/pdf',
    size: pdfBuffer.length,
    content: pdfBase64, // Base64 encoded PDF
    
    // Riferimenti
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    clinicId: invoice.clinicId,
    ownerId: invoice.ownerId || invoice.customerId,
    petId: invoice.petId,
    petName: invoice.petName,
    
    // Info cliente
    customerName: invoice.customerName,
    customerEmail: invoice.customerEmail,
    
    // Importi
    amount: invoice.totals?.total || invoice.total || 0,
    
    // Metadati
    description: `Fattura ${invoice.invoiceNumber} - ${invoice.customerName}`,
    tags: ['fattura', 'pagamento', invoice.invoiceNumber],
    
    // Visibilità
    visibleToOwner: true,
    visibleToClinic: true,
    
    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    issuedAt: invoice.issueDate || new Date().toISOString()
  };

  await db.collection('documents').insertOne(document);
  
  // Aggiorna anche la fattura con il riferimento al documento
  await db.collection('invoices').updateOne(
    { id: invoice.id },
    { 
      $set: { 
        pdfDocumentId: documentId,
        pdfGeneratedAt: new Date().toISOString()
      } 
    }
  );

  return document;
}
