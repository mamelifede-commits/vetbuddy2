import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import clientPromise from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY);

export async function GET(request, { params }) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID mancante' }, { status: 400 });
    }

    // Ottieni lo stato della sessione da Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Aggiorna il database con lo stato attuale
    const updateData = {
      status: session.status,
      paymentStatus: session.payment_status,
      updatedAt: new Date()
    };

    // Se il pagamento è completato, aggiorna anche la clinica
    if (session.payment_status === 'paid') {
      updateData.paidAt = new Date();
      
      // Trova la transazione per ottenere clinicId e planId
      const transaction = await db.collection('payment_transactions').findOne({ sessionId });
      
      if (transaction && transaction.clinicId) {
        // Aggiorna il piano della clinica
        await db.collection('users').updateOne(
          { id: transaction.clinicId },
          { 
            $set: { 
              subscriptionPlan: transaction.planId,
              subscriptionStatus: 'active',
              subscriptionUpdatedAt: new Date()
            } 
          }
        );
      }
    }

    await db.collection('payment_transactions').updateOne(
      { sessionId },
      { $set: updateData }
    );

    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email || null,
      metadata: session.metadata
    });

  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dello stato del pagamento' },
      { status: 500 }
    );
  }
}
