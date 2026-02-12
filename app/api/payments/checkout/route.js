import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import clientPromise from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY);

// Piani tariffari fissi (sicurezza: non accettare prezzi dal frontend)
const PLANS = {
  starter: {
    name: 'Starter',
    price: 0,
    description: 'Piano gratuito per il Pilot'
  },
  pro: {
    name: 'Pro',
    price: 99.00, // €99/mese
    description: 'Tutte le funzionalità per la tua clinica'
  },
  enterprise: {
    name: 'Enterprise', 
    price: 199.00, // €199/mese
    description: 'Multi-sede e supporto dedicato'
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { planId, clinicId, originUrl } = body;

    // Validazione
    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: 'Piano non valido' }, { status: 400 });
    }

    if (!originUrl) {
      return NextResponse.json({ error: 'Origin URL mancante' }, { status: 400 });
    }

    const plan = PLANS[planId];

    // Se il piano è gratuito, non serve checkout Stripe
    if (plan.price === 0) {
      return NextResponse.json({ 
        message: 'Piano gratuito attivato',
        plan: planId
      });
    }

    // Costruisci URL di successo e cancellazione
    const successUrl = `${originUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${originUrl}/dashboard?payment=cancelled`;

    // Crea sessione Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `VetBuddy ${plan.name}`,
              description: plan.description,
            },
            unit_amount: Math.round(plan.price * 100), // Stripe usa centesimi
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        clinicId: clinicId || '',
        planId: planId,
        source: 'vetbuddy_web'
      },
    });

    // Salva transazione nel database
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
    await db.collection('payment_transactions').insertOne({
      id: uuidv4(),
      sessionId: session.id,
      clinicId: clinicId || null,
      planId: planId,
      amount: plan.price,
      currency: 'eur',
      status: 'pending',
      paymentStatus: 'initiated',
      metadata: {
        planName: plan.name,
        source: 'vetbuddy_web'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione del pagamento' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Restituisci i piani disponibili
  return NextResponse.json({
    plans: Object.entries(PLANS).map(([id, plan]) => ({
      id,
      ...plan,
      priceFormatted: plan.price === 0 ? 'Gratis' : `€${plan.price}/mese +IVA`
    }))
  });
}
