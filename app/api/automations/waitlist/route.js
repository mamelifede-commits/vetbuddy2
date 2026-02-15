import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Gestione lista d'attesa
export async function POST(request) {
  try {
    const { clinicId, ownerId, petId, preferredDates, preferredTimes, reason } = await request.json();

    if (!clinicId || !ownerId) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Aggiungi alla lista d'attesa
    const waitlistEntry = {
      id: uuidv4(),
      clinicId,
      ownerId,
      petId,
      preferredDates: preferredDates || [], // es. ['2025-02-15', '2025-02-16']
      preferredTimes: preferredTimes || [], // es. ['morning', 'afternoon']
      reason: reason || 'Visita',
      status: 'waiting',
      notified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('waitlist').insertOne(waitlistEntry);

    // Invia conferma al proprietario
    const owner = await db.collection('users').findOne({ id: ownerId });
    const pet = await db.collection('pets').findOne({ id: petId });
    const clinic = await db.collection('users').findOne({ id: clinicId });

    if (owner?.email) {
      await sendEmail({
        to: owner.email,
        subject: `📋 Sei in lista d'attesa - ${clinic?.clinicName || 'Clinica'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333;">Sei in lista d'attesa!</h2>
              <p style="color: #666;">Ciao ${owner.name || 'Proprietario'},</p>
              <p style="color: #666;">Ti abbiamo aggiunto alla lista d'attesa di <strong>${clinic?.clinicName || 'la clinica'}</strong>${pet ? ` per ${pet.name}` : ''}.</p>
              <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
                <p style="margin: 5px 0;"><strong>📋 Motivo:</strong> ${reason || 'Visita'}</p>
                ${preferredDates?.length ? `<p style="margin: 5px 0;"><strong>📅 Date preferite:</strong> ${preferredDates.join(', ')}</p>` : ''}
              </div>
              <p style="color: #666;">Ti contatteremo appena si libera uno slot! 🔔</p>
            </div>
            <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Aggiunto alla lista d\'attesa',
      waitlistId: waitlistEntry.id
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Errore' }, { status: 500 });
  }
}

// Ottieni lista d'attesa per clinica
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId richiesto' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    const waitlist = await db.collection('waitlist').find({
      clinicId,
      status: 'waiting'
    }).sort({ createdAt: 1 }).toArray();

    // Arricchisci con dati owner e pet
    const enrichedWaitlist = await Promise.all(
      waitlist.map(async (entry) => {
        const owner = await db.collection('users').findOne({ id: entry.ownerId });
        const pet = entry.petId ? await db.collection('pets').findOne({ id: entry.petId }) : null;
        return {
          ...entry,
          ownerName: owner?.name || 'N/A',
          ownerEmail: owner?.email,
          petName: pet?.name || 'N/A'
        };
      })
    );

    return NextResponse.json({ waitlist: enrichedWaitlist });

  } catch (error) {
    console.error('Get waitlist error:', error);
    return NextResponse.json({ error: 'Errore' }, { status: 500 });
  }
}
