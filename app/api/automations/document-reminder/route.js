import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';

// Controlla documenti mancanti e invia reminder
export async function POST(request) {
  try {
    const { clinicId } = await request.json();

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    // Trova appuntamenti completati senza documenti allegati
    const appointmentsWithoutDocs = await db.collection('appointments').find({
      clinicId,
      status: 'completed',
      hasDocuments: { $ne: true },
      documentReminderSent: { $ne: true },
      // Solo appuntamenti degli ultimi 7 giorni
      date: { 
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
      }
    }).toArray();

    const clinic = await db.collection('users').findOne({ id: clinicId });
    let reminders = [];

    for (const apt of appointmentsWithoutDocs) {
      const pet = await db.collection('pets').findOne({ id: apt.petId });
      const owner = await db.collection('users').findOne({ id: apt.ownerId });

      reminders.push({
        appointmentId: apt.id,
        date: apt.date,
        petName: pet?.name || 'N/A',
        ownerName: owner?.name || 'N/A',
        reason: apt.reason || 'Visita'
      });

      // Segna come reminder inviato
      await db.collection('appointments').updateOne(
        { id: apt.id },
        { $set: { documentReminderSent: true, documentReminderAt: new Date() } }
      );
    }

    // Se ci sono reminder, invia email riepilogativa alla clinica
    if (reminders.length > 0 && clinic?.email) {
      const reminderList = reminders.map(r => 
        `<li style="margin: 10px 0; padding: 10px; background: #fff3cd; border-radius: 5px;">
          <strong>${r.petName}</strong> - ${r.reason} (${r.date})<br>
          <span style="color: #666;">Proprietario: ${r.ownerName}</span>
        </li>`
      ).join('');

      await sendEmail({
        to: clinic.email,
        subject: `📋 ${reminders.length} documenti da caricare - VetBuddy`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF9800, #FFB74D); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">📋 Documenti Mancanti</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <p style="color: #666;">Ciao ${clinic.clinicName || 'Team'},</p>
              <p style="color: #666;">Ci sono <strong>${reminders.length} visite completate</strong> senza documenti allegati:</p>
              <ul style="list-style: none; padding: 0;">
                ${reminderList}
              </ul>
              <p style="color: #666;">Ricordati di caricare referti, prescrizioni o altri documenti per questi pazienti.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://vetbuddy.it/dashboard" style="background: #FF9800; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">Vai alla Dashboard</a>
              </div>
            </div>
            <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: #999; margin: 0; font-size: 12px;">© 2025 VetBuddy - Automazione documenti</p>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({
      success: true,
      reminders: reminders.length,
      details: reminders
    });

  } catch (error) {
    console.error('Document reminder error:', error);
    return NextResponse.json({ error: 'Errore' }, { status: 500 });
  }
}
