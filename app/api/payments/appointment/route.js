import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import clientPromise from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY);

// POST - Crea sessione Stripe per pagamento appuntamento
export async function POST(request) {
  try {
    const body = await request.json();
    const { appointmentId, originUrl } = body;

    if (!appointmentId) {
      return NextResponse.json({ error: 'ID appuntamento mancante' }, { status: 400 });
    }

    // Connessione al database
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Recupera l'appuntamento
    const appointment = await db.collection('appointments').findOne({ id: appointmentId });
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404 });
    }

    // Verifica che l'appuntamento non sia già pagato
    if (appointment.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Appuntamento già pagato' }, { status: 400 });
    }

    // Recupera dati clinica
    const clinic = await db.collection('users').findOne({ id: appointment.clinicId });
    
    // Recupera dati proprietario
    const owner = await db.collection('users').findOne({ id: appointment.ownerId });
    
    // Recupera dati animale
    const pet = await db.collection('pets').findOne({ id: appointment.petId });

    // Calcola il prezzo (se non specificato, usa un default)
    let price = appointment.price || appointment.amount || 0;
    
    // Se non c'è un prezzo, cerca nel servizio
    if (!price && appointment.serviceId) {
      const service = await db.collection('clinic_services').findOne({ 
        id: appointment.serviceId,
        clinicId: appointment.clinicId 
      });
      if (service) {
        price = service.price || 50;
      }
    }
    
    // Prezzo minimo di default
    if (!price || price < 1) {
      price = 50; // €50 default
    }

    // Base URL
    const baseUrl = originUrl || process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';

    // Costruisci URL di successo e cancellazione
    const successUrl = `${baseUrl}?payment=success&appointmentId=${appointmentId}`;
    const cancelUrl = `${baseUrl}?payment=cancelled&appointmentId=${appointmentId}`;

    // Descrizione per Stripe
    const description = `${appointment.reason || 'Visita veterinaria'}${pet ? ` per ${pet.name}` : ''}${clinic ? ` - ${clinic.clinicName || clinic.name}` : ''}`;

    // Crea sessione Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Prestazione Veterinaria',
              description: description.substring(0, 500), // Max 500 chars per Stripe
            },
            unit_amount: Math.round(price * 100), // Stripe usa centesimi
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: owner?.email,
      metadata: {
        appointmentId: appointmentId,
        ownerId: appointment.ownerId || '',
        ownerName: owner?.name || '',
        ownerEmail: owner?.email || '',
        ownerCF: owner?.codiceFiscale || owner?.cf || '',
        clinicId: appointment.clinicId || '',
        petId: appointment.petId || '',
        petName: pet?.name || '',
        description: description.substring(0, 200),
        source: 'vetbuddy_appointment_payment'
      },
    });

    // Aggiorna l'appuntamento con il session ID
    await db.collection('appointments').updateOne(
      { id: appointmentId },
      { 
        $set: { 
          paymentStatus: 'pending',
          stripeSessionId: session.id,
          paymentInitiatedAt: new Date().toISOString()
        } 
      }
    );

    // Salva transazione nel database
    await db.collection('payment_transactions').insertOne({
      id: uuidv4(),
      sessionId: session.id,
      appointmentId: appointmentId,
      clinicId: appointment.clinicId,
      ownerId: appointment.ownerId,
      amount: price,
      currency: 'eur',
      status: 'pending',
      paymentStatus: 'initiated',
      type: 'appointment_payment',
      metadata: {
        petName: pet?.name || '',
        description: description,
        source: 'vetbuddy_appointment_payment'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      amount: price,
      description: description
    });

  } catch (error) {
    console.error('Appointment checkout error:', error);
    return NextResponse.json(
      { error: 'Errore durante la creazione del pagamento', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Recupera stato pagamento di un appuntamento
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return NextResponse.json({ error: 'ID appuntamento mancante' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    const appointment = await db.collection('appointments').findOne({ id: appointmentId });
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404 });
    }

    return NextResponse.json({
      appointmentId: appointment.id,
      paymentStatus: appointment.paymentStatus || 'unpaid',
      paidAt: appointment.paidAt,
      paidAmount: appointment.paidAmount,
      stripeSessionId: appointment.stripeSessionId
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    return NextResponse.json(
      { error: 'Errore durante il recupero dello stato pagamento' },
      { status: 500 }
    );
  }
}
