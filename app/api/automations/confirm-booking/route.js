import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';

// Invia email di conferma prenotazione
export async function POST(request) {
  try {
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId richiesto' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Trova l'appuntamento
    const appointment = await db.collection('appointments').findOne({ id: appointmentId });
    if (!appointment) {
      return NextResponse.json({ error: 'Appuntamento non trovato' }, { status: 404 });
    }

    // Trova i dati correlati
    const owner = await db.collection('users').findOne({ id: appointment.ownerId });
    const pet = await db.collection('pets').findOne({ id: appointment.petId });
    const clinic = await db.collection('users').findOne({ id: appointment.clinicId });

    if (!owner?.email) {
      return NextResponse.json({ error: 'Email proprietario non trovata' }, { status: 400 });
    }

    // Invia email di conferma
    await sendEmail({
      to: owner.email,
      subject: `✅ Prenotazione confermata per ${pet?.name || 'il tuo animale'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #4CAF50;">✅ Prenotazione Confermata!</h2>
            <p style="color: #666; font-size: 16px;">Ciao ${owner.name || 'Proprietario'},</p>
            <p style="color: #666; font-size: 16px;">La tua prenotazione è stata confermata con successo!</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <p style="margin: 5px 0;"><strong>🐾 Paziente:</strong> ${pet?.name || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${appointment.date}</p>
              <p style="margin: 5px 0;"><strong>🕐 Ora:</strong> ${appointment.time}</p>
              <p style="margin: 5px 0;"><strong>🏥 Clinica:</strong> ${clinic?.clinicName || clinic?.name || 'N/A'}</p>
              ${clinic?.address ? `<p style="margin: 5px 0;"><strong>📍 Indirizzo:</strong> ${clinic.address}</p>` : ''}
              <p style="margin: 5px 0;"><strong>📋 Motivo:</strong> ${appointment.reason || 'Visita'}</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">Ti invieremo un promemoria 24 ore prima dell'appuntamento.</p>
            
            <div style="background: #FFF3CD; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">⚠️ <strong>Importante:</strong> Se non puoi presentarti, ti preghiamo di avvisare la clinica con almeno 24 ore di anticipo.</p>
            </div>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
          </div>
        </div>
      `
    });

    // Aggiorna l'appuntamento
    await db.collection('appointments').updateOne(
      { id: appointmentId },
      { $set: { confirmationSent: true, confirmationSentAt: new Date() } }
    );

    return NextResponse.json({
      success: true,
      message: 'Email di conferma inviata'
    });

  } catch (error) {
    console.error('Error sending confirmation:', error);
    return NextResponse.json(
      { error: 'Errore nell\'invio della conferma' },
      { status: 500 }
    );
  }
}
