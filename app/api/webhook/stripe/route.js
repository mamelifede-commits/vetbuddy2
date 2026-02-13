import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import clientPromise from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/lib/email';
import { generateInvoicePDF, saveInvoicePDFAsDocument } from '@/lib/invoicePDF';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY);

// Funzione per generare numero fattura progressivo
async function generateInvoiceNumber(db, clinicId) {
  const year = new Date().getFullYear();
  const lastInvoice = await db.collection('invoices')
    .find({ clinicId, invoiceNumber: { $regex: `^${year}/` } })
    .sort({ invoiceNumber: -1 })
    .limit(1)
    .toArray();
  
  let nextNumber = 1;
  if (lastInvoice.length > 0) {
    const lastNum = parseInt(lastInvoice[0].invoiceNumber.split('/')[1]);
    nextNumber = lastNum + 1;
  }
  
  return `${year}/${String(nextNumber).padStart(3, '0')}`;
}

// Funzione per creare fattura automatica dopo pagamento
async function createAutoInvoice(db, paymentData) {
  const { clinicId, ownerId, ownerName, ownerEmail, ownerCF, amount, description, appointmentId, petName, petId } = paymentData;
  
  const invoiceNumber = await generateInvoiceNumber(db, clinicId);
  
  // Recupera info clinica
  const clinic = await db.collection('users').findOne({ id: clinicId });
  
  // Calcoli IVA e marca da bollo
  const subtotal = amount / 1.22; // Scorporo IVA 22%
  const iva = amount - subtotal;
  const marcaBollo = subtotal > 77.47 ? 2.00 : 0;
  const total = amount + marcaBollo;
  
  const invoice = {
    id: uuidv4(),
    clinicId,
    ownerId,
    invoiceNumber,
    
    // Info clinica
    clinicName: clinic?.clinicName || clinic?.name || 'Clinica Veterinaria',
    clinicAddress: clinic?.address || '',
    clinicPhone: clinic?.phone || '',
    clinicEmail: clinic?.email || '',
    clinicVAT: clinic?.vatNumber || clinic?.partitaIva || '',
    
    // Info cliente
    customerName: ownerName,
    customerEmail: ownerEmail,
    customerCF: ownerCF || '',
    customerAddress: '',
    customerId: ownerId,
    
    // Info paziente
    petId: petId || '',
    petName: petName || '',
    
    // Date
    date: new Date().toISOString(),
    issueDate: new Date().toLocaleDateString('it-IT'),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT'),
    
    // Items
    items: [{
      id: uuidv4(),
      description: description || `Prestazione veterinaria${petName ? ` per ${petName}` : ''}`,
      quantity: 1,
      unitPrice: parseFloat(subtotal.toFixed(2)),
      total: parseFloat(subtotal.toFixed(2))
    }],
    
    // Totali
    totals: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      vatRate: 22,
      vatAmount: parseFloat(iva.toFixed(2)),
      bolloAmount: marcaBollo,
      total: parseFloat(total.toFixed(2))
    },
    
    // Legacy fields
    subtotal: parseFloat(subtotal.toFixed(2)),
    vatRate: 22,
    vatAmount: parseFloat(iva.toFixed(2)),
    marcaBollo,
    total: parseFloat(total.toFixed(2)),
    
    // Stato
    status: 'paid',
    paidAt: new Date().toISOString(),
    paymentMethod: 'stripe',
    appointmentId,
    
    notes: 'Fattura generata automaticamente dopo pagamento online',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await db.collection('invoices').insertOne(invoice);
  
  return invoice;
}

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;

    // In produzione, verificare la firma del webhook
    // Per ora, processiamo direttamente l'evento
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Webhook parsing error:', err);
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Gestisci i vari tipi di eventi
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Aggiorna la transazione
        await db.collection('payment_transactions').updateOne(
          { sessionId: session.id },
          { 
            $set: { 
              status: 'completed',
              paymentStatus: session.payment_status,
              paidAt: new Date(),
              updatedAt: new Date()
            } 
          }
        );

        // Se il pagamento è completato
        if (session.payment_status === 'paid') {
          const metadata = session.metadata || {};
          
          // Caso 1: Pagamento sottoscrizione clinica
          if (metadata.clinicId && metadata.planId) {
            await db.collection('users').updateOne(
              { id: metadata.clinicId },
              { 
                $set: { 
                  subscriptionPlan: metadata.planId,
                  subscriptionStatus: 'active',
                  subscriptionUpdatedAt: new Date()
                } 
              }
            );
          }
          
          // Caso 2: Pagamento appuntamento da parte di proprietario
          if (metadata.appointmentId && metadata.ownerId) {
            // Aggiorna stato appuntamento come pagato
            await db.collection('appointments').updateOne(
              { id: metadata.appointmentId },
              { 
                $set: { 
                  paymentStatus: 'paid',
                  paidAt: new Date().toISOString(),
                  paidAmount: session.amount_total / 100,
                  stripeSessionId: session.id
                } 
              }
            );
            
            // Genera fattura automatica
            const invoiceData = {
              clinicId: metadata.clinicId,
              ownerId: metadata.ownerId,
              ownerName: metadata.ownerName || session.customer_details?.name,
              ownerEmail: metadata.ownerEmail || session.customer_details?.email,
              ownerCF: metadata.ownerCF || '',
              amount: session.amount_total / 100,
              description: metadata.description || 'Prestazione veterinaria',
              appointmentId: metadata.appointmentId,
              petName: metadata.petName || ''
            };
            
            try {
              const invoice = await createAutoInvoice(db, invoiceData);
              
              // Genera il PDF della fattura
              let pdfBuffer = null;
              let pdfDocument = null;
              try {
                pdfBuffer = await generateInvoicePDF(invoice);
                pdfDocument = await saveInvoicePDFAsDocument(db, invoice, pdfBuffer);
                console.log(`PDF fattura ${invoice.invoiceNumber} generato e salvato come documento ${pdfDocument.id}`);
              } catch (pdfError) {
                console.error('Error generating invoice PDF:', pdfError);
              }
              
              // Invia fattura via email con allegato PDF
              if (invoiceData.ownerEmail) {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
                
                const emailConfig = {
                  to: invoiceData.ownerEmail,
                  subject: `📋 Fattura ${invoice.invoiceNumber} - Pagamento Confermato`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E8E); padding: 25px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🐾 VetBuddy</h1>
                      </div>
                      
                      <div style="padding: 30px; background: #ffffff;">
                        <h2 style="color: #FF6B6B; margin-top: 0;">Grazie per il tuo pagamento! 🎉</h2>
                        <p style="color: #333;">Ciao <strong>${invoiceData.ownerName}</strong>,</p>
                        <p style="color: #666;">Il tuo pagamento è stato confermato con successo. In allegato trovi la fattura in formato PDF.</p>
                        
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FF6B6B;">
                          <p style="margin: 0 0 8px;"><strong>📋 Fattura N°:</strong> ${invoice.invoiceNumber}</p>
                          <p style="margin: 0 0 8px;"><strong>📅 Data:</strong> ${invoice.issueDate}</p>
                          <p style="margin: 0 0 8px;"><strong>💰 Importo:</strong> €${invoice.totals.total.toFixed(2)}</p>
                          ${invoice.petName ? `<p style="margin: 0;"><strong>🐕 Paziente:</strong> ${invoice.petName}</p>` : ''}
                        </div>
                        
                        <p style="color: #666;">📎 <strong>La fattura PDF è allegata a questa email.</strong></p>
                        <p style="color: #666;">Puoi anche trovarla nella sezione <strong>Documenti</strong> della tua dashboard VetBuddy.</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                          <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF6B6B, #FF8E8E); color: white; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px;">
                            Vai alla Dashboard
                          </a>
                        </div>
                      </div>
                      
                      <div style="padding: 20px; background: #f5f5f5; border-radius: 0 0 12px 12px; text-align: center;">
                        <p style="color: #888; font-size: 12px; margin: 0;">
                          Questa è una email automatica generata da VetBuddy.<br>
                          Per assistenza, contatta la tua clinica veterinaria.
                        </p>
                      </div>
                    </div>
                  `
                };
                
                // Aggiungi allegato PDF se disponibile
                if (pdfBuffer) {
                  emailConfig.attachments = [{
                    filename: `Fattura_${invoice.invoiceNumber.replace('/', '-')}.pdf`,
                    content: pdfBuffer.toString('base64'),
                    type: 'application/pdf'
                  }];
                }
                
                await sendEmail(emailConfig);
                console.log(`Email fattura ${invoice.invoiceNumber} inviata a ${invoiceData.ownerEmail}`);
              }
            } catch (invoiceError) {
              console.error('Error creating auto invoice:', invoiceError);
            }
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Invoice payment succeeded:', invoice.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Invoice payment failed:', invoice.id);
        
        // Potresti voler notificare la clinica o sospendere l'abbonamento
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription cancelled:', subscription.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
