import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import clientPromise from '@/lib/mongodb';

const stripe = new Stripe(process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY);

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

        // Se il pagamento è completato, aggiorna la clinica
        if (session.payment_status === 'paid' && session.metadata?.clinicId) {
          await db.collection('users').updateOne(
            { id: session.metadata.clinicId },
            { 
              $set: { 
                subscriptionPlan: session.metadata.planId,
                subscriptionStatus: 'active',
                subscriptionUpdatedAt: new Date()
              } 
            }
          );
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
