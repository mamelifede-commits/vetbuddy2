import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';

// Controlla vaccini in scadenza/scaduti e invia promemoria ai proprietari
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { daysAhead = 30, dryRun = false } = body;

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    // Trova tutte le vaccinazioni con scadenza prossima o già scadute
    const vaccinations = await db.collection('vaccinations').find({
      nextDueDate: { $exists: true, $ne: null },
      $or: [
        // Scaduti (nextDueDate < now)
        { nextDueDate: { $lt: now.toISOString() } },
        // In scadenza (nextDueDate tra now e futureDate)
        { nextDueDate: { $gte: now.toISOString(), $lte: futureDate.toISOString() } }
      ],
      // Non inviare reminder se già inviato nelle ultime 72 ore
      $or: [
        { lastReminderSent: { $exists: false } },
        { lastReminderSent: { $lt: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString() } }
      ]
    }).toArray();

    if (vaccinations.length === 0) {
      return NextResponse.json({ success: true, reminders: 0, message: 'Nessun vaccino in scadenza trovato' });
    }

    // Raggruppa per petId per inviare un unico email per animale
    const petVaccineMap = {};
    for (const vac of vaccinations) {
      if (!petVaccineMap[vac.petId]) petVaccineMap[vac.petId] = [];
      petVaccineMap[vac.petId].push(vac);
    }

    let emailsSent = 0;
    let errors = 0;
    const details = [];

    for (const [petId, vaccines] of Object.entries(petVaccineMap)) {
      try {
        const pet = await db.collection('pets').findOne({ id: petId });
        if (!pet || !pet.ownerId) continue;

        const owner = await db.collection('users').findOne({ id: pet.ownerId });
        if (!owner || !owner.email) continue;

        const expired = vaccines.filter(v => new Date(v.nextDueDate) < now);
        const expiring = vaccines.filter(v => new Date(v.nextDueDate) >= now);

        const vaccineListHtml = vaccines.map(v => {
          const dueDate = new Date(v.nextDueDate);
          const isExpired = dueDate < now;
          const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          const statusColor = isExpired ? '#dc2626' : daysUntil <= 7 ? '#f59e0b' : '#3b82f6';
          const statusText = isExpired ? `⚠️ Scaduto da ${Math.abs(daysUntil)} giorni` : `⏰ Scade tra ${daysUntil} giorni`;
          
          return `<tr>
            <td style="padding:10px;border-bottom:1px solid #f3f4f6;font-weight:600;color:#111827;">${v.name || 'Vaccino'}</td>
            <td style="padding:10px;border-bottom:1px solid #f3f4f6;color:#6b7280;">${dueDate.toLocaleDateString('it-IT')}</td>
            <td style="padding:10px;border-bottom:1px solid #f3f4f6;color:${statusColor};font-weight:600;">${statusText}</td>
          </tr>`;
        }).join('');

        const subject = expired.length > 0 
          ? `⚠️ ${pet.name}: ${expired.length} vaccin${expired.length === 1 ? 'o' : 'i'} scadut${expired.length === 1 ? 'o' : 'i'} — VetBuddy Passport`
          : `⏰ ${pet.name}: ${expiring.length} vaccin${expiring.length === 1 ? 'o' : 'i'} in scadenza — VetBuddy Passport`;

        const html = `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="padding:24px 16px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,${expired.length > 0 ? '#dc2626,#ef4444' : '#6366f1,#8b5cf6'});padding:32px 24px;text-align:center;">
        <div style="font-size:36px;">🛡️</div>
        <h1 style="color:#fff;font-size:22px;margin:12px 0 4px;font-weight:700;">VetBuddy Passport</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">Promemoria vaccinale per ${pet.name}</p>
      </div>
      <div style="padding:28px 24px;">
        <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 16px;">
          Ciao <strong>${owner.name || 'Proprietario'}</strong>,<br>
          ${expired.length > 0 
            ? `ci sono <strong style="color:#dc2626;">${expired.length} vaccin${expired.length === 1 ? 'o' : 'i'} scadut${expired.length === 1 ? 'o' : 'i'}</strong> per <strong>${pet.name}</strong>.`
            : `ti ricordiamo che <strong>${pet.name}</strong> ha <strong style="color:#6366f1;">${expiring.length} vaccin${expiring.length === 1 ? 'o' : 'i'} in scadenza</strong>.`
          }
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:10px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase;">Vaccino</th>
              <th style="padding:10px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase;">Scadenza</th>
              <th style="padding:10px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase;">Stato</th>
            </tr>
          </thead>
          <tbody>
            ${vaccineListHtml}
          </tbody>
        </table>

        <div style="text-align:center;margin:24px 0;">
          <a href="${BASE_URL}?tab=pets" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
            Apri il Passport di ${pet.name}
          </a>
        </div>

        <p style="color:#9ca3af;font-size:13px;text-align:center;margin:16px 0 0;">
          Contatta la tua clinica veterinaria per prenotare il richiamo. 🐾
        </p>
      </div>
      <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f3f4f6;">
        <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} VetBuddy — Passaporto sanitario digitale</p>
      </div>
    </div>
  </div>
</body>
</html>`;

        if (!dryRun) {
          const result = await sendEmail({ to: owner.email, subject, html });
          if (result.success) {
            emailsSent++;
            // Aggiorna lastReminderSent per ogni vaccino
            for (const v of vaccines) {
              await db.collection('vaccinations').updateOne(
                { id: v.id },
                { $set: { lastReminderSent: now.toISOString() } }
              );
            }
          } else {
            errors++;
          }
        } else {
          emailsSent++;
        }

        details.push({
          petId,
          petName: pet.name,
          ownerEmail: owner.email,
          expired: expired.length,
          expiring: expiring.length,
          sent: !dryRun
        });

      } catch (e) {
        console.error(`Errore vaccino reminder per pet ${petId}:`, e);
        errors++;
      }
    }

    // Log automazione
    await db.collection('automation_logs').insertOne({
      type: 'passport_vaccine_reminder',
      timestamp: now.toISOString(),
      emailsSent,
      errors,
      dryRun,
      totalVaccines: vaccinations.length,
      totalPets: Object.keys(petVaccineMap).length
    });

    return NextResponse.json({
      success: true,
      reminders: emailsSent,
      errors,
      dryRun,
      details
    });

  } catch (error) {
    console.error('Vaccine reminder automation error:', error);
    return NextResponse.json({ error: 'Errore automazione promemoria vaccini' }, { status: 500 });
  }
}
