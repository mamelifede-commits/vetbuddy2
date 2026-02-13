import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

/**
 * Genera un PDF della fattura e lo restituisce come Buffer
 * @param {Object} invoice - Oggetto fattura dal database
 * @returns {Promise<Buffer>} - Buffer del PDF generato
 */
export async function generateInvoicePDF(invoice) {
  return new Promise((resolve, reject) => {
    try {
      // Crea un nuovo documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Fattura ${invoice.invoiceNumber}`,
          Author: invoice.clinicName || 'VetBuddy',
          Subject: 'Fattura Veterinaria',
          Creator: 'VetBuddy - Sistema Gestionale Veterinario'
        }
      });

      // Array per raccogliere i chunks del PDF
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colori
      const primaryColor = '#FF6B6B';
      const darkGray = '#333333';
      const lightGray = '#666666';
      const bgGray = '#f5f5f5';

      // ========== HEADER ==========
      // Logo/Titolo
      doc.fontSize(28)
         .fillColor(primaryColor)
         .text('🐾 VetBuddy', 50, 50);
      
      doc.fontSize(10)
         .fillColor(lightGray)
         .text('Sistema Gestionale Veterinario', 50, 85);

      // Numero fattura (destra)
      doc.fontSize(24)
         .fillColor(darkGray)
         .text(`FATTURA`, 400, 50, { align: 'right' });
      
      doc.fontSize(14)
         .fillColor(primaryColor)
         .text(`N° ${invoice.invoiceNumber}`, 400, 80, { align: 'right' });

      // Linea separatrice
      doc.moveTo(50, 110)
         .lineTo(545, 110)
         .strokeColor(primaryColor)
         .lineWidth(2)
         .stroke();

      // ========== INFO CLINICA E CLIENTE ==========
      let yPos = 130;

      // Clinica (sinistra)
      doc.fontSize(10)
         .fillColor(primaryColor)
         .text('DA:', 50, yPos);
      
      doc.fontSize(11)
         .fillColor(darkGray)
         .text(invoice.clinicName || 'Clinica Veterinaria', 50, yPos + 15);
      
      doc.fontSize(9)
         .fillColor(lightGray)
         .text(invoice.clinicAddress || '', 50, yPos + 30)
         .text(invoice.clinicPhone || '', 50, yPos + 42)
         .text(invoice.clinicEmail || '', 50, yPos + 54);

      // Cliente (destra)
      doc.fontSize(10)
         .fillColor(primaryColor)
         .text('A:', 350, yPos);
      
      doc.fontSize(11)
         .fillColor(darkGray)
         .text(invoice.customerName || 'Cliente', 350, yPos + 15);
      
      doc.fontSize(9)
         .fillColor(lightGray)
         .text(invoice.customerAddress || '', 350, yPos + 30)
         .text(invoice.customerCF ? `C.F.: ${invoice.customerCF}` : '', 350, yPos + 42)
         .text(invoice.customerEmail || '', 350, yPos + 54);

      // ========== INFO FATTURA ==========
      yPos = 220;
      
      // Box info
      doc.rect(50, yPos, 495, 50)
         .fillColor(bgGray)
         .fill();

      doc.fontSize(9)
         .fillColor(lightGray)
         .text('Data Emissione:', 60, yPos + 10)
         .text('Scadenza:', 200, yPos + 10)
         .text('Stato:', 340, yPos + 10);

      if (invoice.petName) {
        doc.text('Paziente:', 440, yPos + 10);
      }

      doc.fontSize(10)
         .fillColor(darkGray)
         .text(invoice.issueDate || new Date().toLocaleDateString('it-IT'), 60, yPos + 25)
         .text(invoice.dueDate || '-', 200, yPos + 25)
         .text(invoice.status === 'paid' ? '✓ Pagata' : invoice.status === 'issued' ? 'Emessa' : 'Bozza', 340, yPos + 25);

      if (invoice.petName) {
        doc.text(`🐕 ${invoice.petName}`, 440, yPos + 25);
      }

      // ========== TABELLA ITEMS ==========
      yPos = 290;

      // Header tabella
      doc.rect(50, yPos, 495, 25)
         .fillColor(primaryColor)
         .fill();

      doc.fontSize(10)
         .fillColor('#ffffff')
         .text('Descrizione', 60, yPos + 8)
         .text('Qtà', 350, yPos + 8, { width: 40, align: 'center' })
         .text('Prezzo', 400, yPos + 8, { width: 60, align: 'right' })
         .text('Totale', 470, yPos + 8, { width: 65, align: 'right' });

      yPos += 25;

      // Righe items
      const items = invoice.items || [];
      items.forEach((item, index) => {
        const rowBg = index % 2 === 0 ? '#ffffff' : bgGray;
        
        doc.rect(50, yPos, 495, 25)
           .fillColor(rowBg)
           .fill();

        doc.fontSize(9)
           .fillColor(darkGray)
           .text(item.description || '', 60, yPos + 8, { width: 280 })
           .text(item.quantity?.toString() || '1', 350, yPos + 8, { width: 40, align: 'center' })
           .text(`€${(item.unitPrice || 0).toFixed(2)}`, 400, yPos + 8, { width: 60, align: 'right' })
           .text(`€${(item.total || 0).toFixed(2)}`, 470, yPos + 8, { width: 65, align: 'right' });

        yPos += 25;
      });

      // Linea sotto la tabella
      doc.moveTo(50, yPos)
         .lineTo(545, yPos)
         .strokeColor('#dddddd')
         .lineWidth(1)
         .stroke();

      // ========== TOTALI ==========
      yPos += 20;

      const totals = invoice.totals || {};
      
      // Box totali
      doc.rect(350, yPos, 195, 100)
         .fillColor(bgGray)
         .fill();

      doc.fontSize(9)
         .fillColor(lightGray)
         .text('Imponibile:', 360, yPos + 10)
         .text(`IVA (${totals.vatRate || 22}%):`, 360, yPos + 25);

      doc.fillColor(darkGray)
         .text(`€${(totals.subtotal || 0).toFixed(2)}`, 470, yPos + 10, { width: 65, align: 'right' })
         .text(`€${(totals.vatAmount || 0).toFixed(2)}`, 470, yPos + 25, { width: 65, align: 'right' });

      if (totals.bolloAmount && totals.bolloAmount > 0) {
        doc.fillColor(lightGray)
           .text('Marca da bollo:', 360, yPos + 40);
        doc.fillColor(darkGray)
           .text(`€${totals.bolloAmount.toFixed(2)}`, 470, yPos + 40, { width: 65, align: 'right' });
      }

      // Linea prima del totale
      doc.moveTo(360, yPos + 60)
         .lineTo(535, yPos + 60)
         .strokeColor(primaryColor)
         .lineWidth(2)
         .stroke();

      // Totale
      doc.fontSize(14)
         .fillColor(primaryColor)
         .text('TOTALE:', 360, yPos + 70)
         .text(`€${(totals.total || 0).toFixed(2)}`, 450, yPos + 70, { width: 85, align: 'right' });

      // ========== NOTE ==========
      if (invoice.notes) {
        yPos += 130;
        doc.fontSize(9)
           .fillColor(lightGray)
           .text('Note:', 50, yPos);
        
        doc.fontSize(9)
           .fillColor(darkGray)
           .text(invoice.notes, 50, yPos + 12, { width: 495 });
      }

      // ========== FOOTER ==========
      doc.fontSize(8)
         .fillColor(lightGray)
         .text(
           'Documento generato automaticamente da VetBuddy - Sistema Gestionale per Cliniche Veterinarie',
           50,
           750,
           { align: 'center', width: 495 }
         )
         .text(
           `www.vetbuddy.it | Fattura generata il ${new Date().toLocaleDateString('it-IT')} alle ${new Date().toLocaleTimeString('it-IT')}`,
           50,
           762,
           { align: 'center', width: 495 }
         );

      // Finalizza il documento
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
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
    amount: invoice.totals?.total || 0,
    
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
