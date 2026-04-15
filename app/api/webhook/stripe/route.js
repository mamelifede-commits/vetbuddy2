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

    // Verifica firma webhook Stripe (produzione)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
      }
    } else {
      // Fallback per test senza firma
      try {
        event = JSON.parse(body);
      } catch (err) {
        console.error('Webhook parsing error:', err);
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }
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

        // Se il pagamento è completato (paid) o trial gratuito (no_payment_required)
        if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
          const metadata = session.metadata || {};
          
          // Caso 1: Pagamento sottoscrizione (clinica o lab)
          if (metadata.type === 'subscription' && metadata.userId && metadata.planId) {
            const subStatus = session.payment_status === 'no_payment_required' ? 'trialing' : 'active';
            await db.collection('users').updateOne(
              { id: metadata.userId },
              { 
                $set: { 
                  subscriptionPlan: metadata.planId,
                  subscriptionStatus: subStatus,
                  stripeCustomerId: session.customer,
                  stripeSubscriptionId: session.subscription,
                  subscriptionUpdatedAt: new Date().toISOString()
                } 
              }
            );
            console.log(`✅ Subscription ${subStatus} for user ${metadata.userId}: plan ${metadata.planId}`);
          }
          // Caso 1b: Legacy metadata format (clinicId)
          else if (metadata.clinicId && metadata.planId) {
            const subStatus = session.payment_status === 'no_payment_required' ? 'trialing' : 'active';
            await db.collection('users').updateOne(
              { id: metadata.clinicId },
              { 
                $set: { 
                  subscriptionPlan: metadata.planId,
                  subscriptionStatus: subStatus,
                  stripeCustomerId: session.customer,
                  stripeSubscriptionId: session.subscription,
                  subscriptionUpdatedAt: new Date().toISOString()
                } 
              }
            );
            console.log(`✅ Subscription ${subStatus} for clinic ${metadata.clinicId}: plan ${metadata.planId}`);
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
                        <h1 style="color: white; margin: 0; font-size: 24px;">🐾 vetbuddy</h1>
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
                        <p style="color: #666;">Puoi anche trovarla nella sezione <strong>Documenti</strong> della tua dashboard vetbuddy.</p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                          <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF6B6B, #FF8E8E); color: white; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px;">
                            Vai alla Dashboard
                          </a>
                        </div>
                      </div>
                      
                      <div style="padding: 20px; background: #f5f5f5; border-radius: 0 0 12px 12px; text-align: center;">
                        <p style="color: #888; font-size: 12px; margin: 0;">
                          Questa è una email automatica generata da vetbuddy.<br>
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

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id, 'Status:', subscription.status);
        
        // Trova l'utente tramite stripeCustomerId
        const subUpdatedUser = await db.collection('users').findOne({ stripeCustomerId: subscription.customer });
        if (subUpdatedUser) {
          await db.collection('users').updateOne(
            { id: subUpdatedUser.id },
            {
              $set: {
                subscriptionStatus: subscription.status, // active, trialing, past_due, canceled, unpaid
                subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
                trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                subscriptionUpdatedAt: new Date().toISOString()
              }
            }
          );
          console.log(`✅ Subscription updated for user ${subUpdatedUser.id}: ${subscription.status}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription cancelled:', subscription.id);
        
        // Trova l'utente e disattiva l'abbonamento
        const subDeletedUser = await db.collection('users').findOne({ stripeCustomerId: subscription.customer });
        if (subDeletedUser) {
          await db.collection('users').updateOne(
            { id: subDeletedUser.id },
            {
              $set: {
                subscriptionStatus: 'cancelled',
                subscriptionPlan: null,
                subscriptionUpdatedAt: new Date().toISOString()
              }
            }
          );
          console.log(`✅ Subscription cancelled for user ${subDeletedUser.id}`);
          
          // Notifica via email
          try {
            if (subDeletedUser.email) {
              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
              await sendEmail({
                to: subDeletedUser.email,
                subject: '⚠️ Il tuo abbonamento VetBuddy è stato cancellato',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E8E); padding: 25px; border-radius: 12px 12px 0 0; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">🐾 vetbuddy</h1>
                    </div>
                    <div style="padding: 30px; background: #ffffff;">
                      <h2 style="color: #FF6B6B; margin-top: 0;">Abbonamento cancellato</h2>
                      <p style="color: #333;">Ciao <strong>${subDeletedUser.name || subDeletedUser.clinicName || ''}</strong>,</p>
                      <p style="color: #666;">Il tuo abbonamento VetBuddy è stato cancellato. Puoi sempre riattivarlo dalla sezione Impostazioni della tua dashboard.</p>
                      <div style="text-align: center; margin-top: 30px;">
                        <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF6B6B, #FF8E8E); color: white; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold;">
                          Riattiva Abbonamento
                        </a>
                      </div>
                    </div>
                    <div style="padding: 20px; background: #f5f5f5; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="color: #888; font-size: 12px; margin: 0;">Email automatica da vetbuddy</p>
                    </div>
                  </div>
                `
              });
            }
          } catch (emailErr) {
            console.error('Error sending cancellation email:', emailErr);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Invoice payment succeeded:', invoice.id);
        
        // Per rinnovi automatici, aggiorna lo stato dell'abbonamento
        if (invoice.subscription) {
          const invoiceUser = await db.collection('users').findOne({ stripeCustomerId: invoice.customer });
          if (invoiceUser) {
            await db.collection('users').updateOne(
              { id: invoiceUser.id },
              {
                $set: {
                  subscriptionStatus: 'active',
                  subscriptionUpdatedAt: new Date().toISOString()
                }
              }
            );
            console.log(`✅ Subscription renewed for user ${invoiceUser.id}`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Invoice payment failed:', invoice.id);
        
        // Marca l'abbonamento come past_due
        if (invoice.subscription) {
          const failedUser = await db.collection('users').findOne({ stripeCustomerId: invoice.customer });
          if (failedUser) {
            await db.collection('users').updateOne(
              { id: failedUser.id },
              {
                $set: {
                  subscriptionStatus: 'past_due',
                  subscriptionUpdatedAt: new Date().toISOString()
                }
              }
            );
            console.log(`⚠️ Payment failed for user ${failedUser.id}, status set to past_due`);
            
            // Notifica via email
            try {
              if (failedUser.email) {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
                await sendEmail({
                  to: failedUser.email,
                  subject: '⚠️ Pagamento abbonamento VetBuddy non riuscito',
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E8E); padding: 25px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🐾 vetbuddy</h1>
                      </div>
                      <div style="padding: 30px; background: #ffffff;">
                        <h2 style="color: #e53e3e; margin-top: 0;">Pagamento non riuscito</h2>
                        <p style="color: #333;">Ciao <strong>${failedUser.name || failedUser.clinicName || ''}</strong>,</p>
                        <p style="color: #666;">Non siamo riusciti a rinnovare il tuo abbonamento. Aggiorna il metodo di pagamento per evitare interruzioni del servizio.</p>
                        <div style="text-align: center; margin-top: 30px;">
                          <a href="${baseUrl}" style="display: inline-block; background: linear-gradient(135deg, #FF6B6B, #FF8E8E); color: white; padding: 14px 35px; text-decoration: none; border-radius: 30px; font-weight: bold;">
                            Aggiorna Pagamento
                          </a>
                        </div>
                      </div>
                      <div style="padding: 20px; background: #f5f5f5; border-radius: 0 0 12px 12px; text-align: center;">
                        <p style="color: #888; font-size: 12px; margin: 0;">Email automatica da vetbuddy</p>
                      </div>
                    </div>
                  `
                });
              }
            } catch (emailErr) {
              console.error('Error sending payment failed email:', emailErr);
            }
          }
        }
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
