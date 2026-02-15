import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';

// Notifica persone in lista d'attesa quando si libera uno slot
export async function POST(request) {
  try {
    const { clinicId, date, time } = await request.json();

    if (!clinicId || !date) {
      return NextResponse.json({ error: 'Parametri mancanti' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Trova persone in attesa per questa data o senza preferenza specifica
    const waitingPeople = await db.collection('waitlist').find({
      clinicId,
      status: 'waiting',
      $or: [
        { preferredDates: date },
        { preferredDates: { $size: 0 } },
        { preferredDates: { $exists: false } }
      ]
    }).sort({ createdAt: 1 }).limit(5).toArray();

    const clinic = await db.collection('users').findOne({ id: clinicId });
    let notified = 0;

    for (const entry of waitingPeople) {
      const owner = await db.collection('users').findOne({ id: entry.ownerId });
      const pet = entry.petId ? await db.collection('pets').findOne({ id: entry.petId }) : null;

      if (owner?.email) {
        await sendEmail({
          to: owner.email,
          subject: `🔔 Slot disponibile! - ${clinic?.clinicName || 'Clinica'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #4CAF50, #8BC34A); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #4CAF50;">🎉 Si è liberato uno slot!</h2>
                <p style="color: #666;">Ciao ${owner.name || 'Proprietario'},</p>
                <p style="color: #666;">Buone notizie! Si è liberato un posto presso <strong>${clinic?.clinicName || 'la clinica'}</strong>.</p>
                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                  <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${date}</p>
                  ${time ? `<p style="margin: 5px 0;"><strong>🕐 Ora:</strong> ${time}</p>` : ''}
                  ${pet ? `<p style="margin: 5px 0;"><strong>🐾 Per:</strong> ${pet.name}</p>` : ''}
                </div>
                <p style="color: #666;">Affrettati a prenotare prima che venga preso da qualcun altro!</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://vetbuddy.it" style="background: #4CAF50; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">Prenota Ora</a>
                </div>
              </div>
              <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
              </div>
            </div>
          `
        });

        // Segna come notificato
        await db.collection('waitlist').updateOne(
          { id: entry.id },
          { $set: { notified: true, notifiedAt: new Date(), notifiedForDate: date } }
        );
        notified++;
      }
    }

    return NextResponse.json({
      success: true,
      notified,
      message: `Notificate ${notified} persone in lista d'attesa`
    });

  } catch (error) {
    console.error('Notify waitlist error:', error);
    return NextResponse.json({ error: 'Errore' }, { status: 500 });
  }
}
