import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { generateInvoicePDF, saveInvoicePDFAsDocument } from '@/lib/invoicePDF';

// POST - Invia fattura via email
export async function POST(request) {
  try {
    const body = await request.json();
    const { invoiceId, recipientEmail } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'ID fattura mancante' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Recupera la fattura
    const invoice = await db.collection('invoices').findOne({ id: invoiceId });
    
    if (!invoice) {
      return NextResponse.json({ error: 'Fattura non trovata' }, { status: 404 });
    }

    // Usa l'email specificata o quella del cliente
    const toEmail = recipientEmail || invoice.customerEmail;
    
    if (!toEmail) {
      return NextResponse.json({ error: 'Email destinatario mancante' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';

    // Costruisci il contenuto HTML della fattura
    const itemsHtml = invoice.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${item.unitPrice.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #fff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E8E); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🐾 vetbuddy</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Fattura N° ${invoice.invoiceNumber}</p>
        </div>
        
        <!-- Info Box -->
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="display: flex; justify-content: space-between;">
            <div style="flex: 1;">
              <h3 style="color: #333; margin: 0 0 10px;">Da:</h3>
              <p style="margin: 0; color: #666;">
                <strong>${invoice.clinicName || 'Clinica Veterinaria vetbuddy'}</strong><br>
                ${invoice.clinicAddress || ''}<br>
                ${invoice.clinicPhone || ''}<br>
                ${invoice.clinicEmail || ''}
              </p>
            </div>
            <div style="flex: 1; text-align: right;">
              <h3 style="color: #333; margin: 0 0 10px;">A:</h3>
              <p style="margin: 0; color: #666;">
                <strong>${invoice.customerName}</strong><br>
                ${invoice.customerAddress || ''}<br>
                ${invoice.customerCF ? `C.F.: ${invoice.customerCF}` : ''}<br>
                ${toEmail}
              </p>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #eee;">
            <p style="margin: 0;"><strong>Data Emissione:</strong> ${invoice.issueDate || new Date().toLocaleDateString('it-IT')}</p>
            ${invoice.petName ? `<p style="margin: 5px 0 0;"><strong>🐕 Paziente:</strong> ${invoice.petName}</p>` : ''}
          </div>
        </div>
        
        <!-- Items Table -->
        <div style="padding: 0 30px;">
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #FF6B6B; color: white;">
                <th style="padding: 12px; text-align: left;">Descrizione</th>
                <th style="padding: 12px; text-align: center;">Qtà</th>
                <th style="padding: 12px; text-align: right;">Prezzo</th>
                <th style="padding: 12px; text-align: right;">Totale</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
        
        <!-- Totals -->
        <div style="padding: 0 30px 30px;">
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: right;">
            <p style="margin: 0; font-size: 14px; color: #666;">Imponibile: <strong>€${invoice.totals?.subtotal?.toFixed(2) || '0.00'}</strong></p>
            <p style="margin: 8px 0; font-size: 14px; color: #666;">IVA (${invoice.totals?.vatRate || 22}%): <strong>€${invoice.totals?.vatAmount?.toFixed(2) || '0.00'}</strong></p>
            ${invoice.totals?.bolloAmount > 0 ? `<p style="margin: 8px 0; font-size: 14px; color: #666;">Marca da bollo: <strong>€${invoice.totals.bolloAmount.toFixed(2)}</strong></p>` : ''}
            <hr style="border: none; border-top: 2px solid #FF6B6B; margin: 15px 0;">
            <p style="margin: 0; font-size: 24px; color: #FF6B6B;"><strong>TOTALE: €${invoice.totals?.total?.toFixed(2) || '0.00'}</strong></p>
          </div>
        </div>
        
        ${invoice.notes ? `
        <div style="padding: 0 30px 30px;">
          <p style="color: #888; font-size: 13px; padding: 15px; background: #fff8dc; border-radius: 8px; margin: 0;">
            <strong>📝 Note:</strong> ${invoice.notes}
          </p>
        </div>
        ` : ''}
        
        <!-- CTA -->
        <div style="padding: 30px; text-align: center; background: #f9f9f9; border-radius: 0 0 8px 8px;">
          <a href="${baseUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px;">
            Accedi a vetbuddy
          </a>
          <p style="color: #888; font-size: 11px; margin: 20px 0 0;">
            Questa fattura è stata generata automaticamente da vetbuddy.<br>
            Per qualsiasi domanda, contatta la tua clinica veterinaria.
          </p>
        </div>
      </div>
    `;

    // Genera il PDF della fattura
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateInvoicePDF(invoice);
      
      // Se il PDF non è già salvato come documento, salvalo
      if (!invoice.pdfDocumentId) {
        const pdfDocument = await saveInvoicePDFAsDocument(db, invoice, pdfBuffer);
        console.log(`PDF fattura ${invoice.invoiceNumber} salvato come documento ${pdfDocument.id}`);
      }
    } catch (pdfError) {
      console.error('Error generating invoice PDF:', pdfError);
    }

    // Prepara l'email
    const emailConfig = {
      to: toEmail,
      subject: `📋 Fattura ${invoice.invoiceNumber} - ${invoice.clinicName || 'vetbuddy'}`,
      html: emailHtml
    };
    
    // Aggiungi allegato PDF se disponibile
    if (pdfBuffer) {
      emailConfig.attachments = [{
        filename: `Fattura_${invoice.invoiceNumber.replace('/', '-')}.pdf`,
        content: pdfBuffer.toString('base64'),
        type: 'application/pdf'
      }];
    }

    // Invia l'email
    await sendEmail(emailConfig);

    // Aggiorna la fattura con lo stato di invio
    await db.collection('invoices').updateOne(
      { id: invoiceId },
      { 
        $set: { 
          emailSentAt: new Date().toISOString(),
          emailSentTo: toEmail
        },
        $push: {
          emailHistory: {
            sentAt: new Date().toISOString(),
            sentTo: toEmail
          }
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: `Fattura ${invoice.invoiceNumber} inviata a ${toEmail}`,
      invoiceNumber: invoice.invoiceNumber,
      recipient: toEmail
    });

  } catch (error) {
    console.error('Send invoice email error:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'invio della fattura', details: error.message },
      { status: 500 }
    );
  }
}
