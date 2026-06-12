import { getCollection } from '@/lib/db';
import { sendEmail } from '@/lib/email';

// Notifica i clienti in lista d'attesa quando si libera uno slot
// (chiamata automaticamente alla cancellazione/spostamento appuntamento)
export async function notifyWaitlistForSlot({ clinicId, date, time }) {
  if (!clinicId || !date) return { notified: 0 };
  try {
    const waitlistCol = await getCollection('waitlist');
    const usersCol = await getCollection('users');
    const petsCol = await getCollection('pets');

    const clinic = await usersCol.findOne({ id: clinicId });
    // Rispetta il toggle automazione della clinica
    if (clinic?.automationSettings && clinic.automationSettings.waitlistNotification === false) {
      return { notified: 0, skipped: true };
    }

    const waitingPeople = await waitlistCol.find({
      clinicId,
      status: 'waiting',
      $or: [
        { preferredDates: date },
        { preferredDates: { $size: 0 } },
        { preferredDates: { $exists: false } }
      ]
    }).sort({ createdAt: 1 }).limit(5).toArray();

    if (waitingPeople.length === 0) return { notified: 0 };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
    let notified = 0;

    for (const entry of waitingPeople) {
      const owner = await usersCol.findOne({ id: entry.ownerId });
      const pet = entry.petId ? await petsCol.findOne({ id: entry.petId }) : null;
      if (!owner?.email) continue;
      try {
        const bookUrl = `${baseUrl}?action=book&clinicId=${clinicId}${entry.petId ? `&petId=${entry.petId}` : ''}`;
        await sendEmail({
          to: owner.email,
          subject: `🔔 Si è liberato uno slot! - ${clinic?.clinicName || 'Clinica'}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#4CAF50,#8BC34A);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">🐾 vetbuddy</h1></div><div style="padding:30px;background:#f9f9f9;"><h2 style="color:#4CAF50;">🎉 Si è liberato uno slot!</h2><p style="color:#666;">Ciao ${owner.name || 'Proprietario'},</p><p style="color:#666;">Buone notizie! Si è appena liberato un posto presso <strong>${clinic?.clinicName || 'la clinica'}</strong>.</p><div style="background:white;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #4CAF50;"><p style="margin:5px 0;"><strong>📅 Data:</strong> ${date}</p>${time ? `<p style="margin:5px 0;"><strong>🕐 Ora:</strong> ${time}</p>` : ''}${pet ? `<p style="margin:5px 0;"><strong>🐾 Per:</strong> ${pet.name}</p>` : ''}</div><p style="color:#666;">Affrettati a prenotare prima che venga preso da qualcun altro!</p><div style="text-align:center;margin:30px 0;"><a href="${bookUrl}" style="background:#4CAF50;color:white;padding:12px 30px;border-radius:25px;text-decoration:none;font-weight:bold;">📅 Prenota Ora</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>`
        });
        await waitlistCol.updateOne(
          { id: entry.id },
          { $set: { notified: true, notifiedAt: new Date(), notifiedForDate: date, notifiedForTime: time || null } }
        );
        notified++;
      } catch (err) {
        console.error('Waitlist email error:', err);
      }
    }

    // Log esecuzione (visibile nella Cronologia automazioni)
    if (notified > 0) {
      const logs = await getCollection('automation_logs');
      await logs.insertOne({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        clinicId,
        type: 'waitlistNotification',
        title: 'Slot liberato → lista d\'attesa avvisata',
        details: `${notified} clienti notificati per il ${date}${time ? ' alle ' + time : ''}`,
        executedAt: new Date().toISOString(),
        source: 'trigger-cancellazione'
      });
    }

    return { notified };
  } catch (error) {
    console.error('notifyWaitlistForSlot error:', error);
    return { notified: 0, error: error.message };
  }
}
