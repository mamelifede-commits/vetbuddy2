import { isAutomationEnabled, getContactButton, getPhoneButton, getCancellationPolicyText } from '../cron-helpers';

export async function runAppointmentAutomations({ db, clinicsMap, allClinics, today, todayStr, results, sendEmail }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';

  // 1. PROMEMORIA APPUNTAMENTI (24h prima)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const appointmentsTomorrow = await db.collection('appointments').find({
    date: { $gte: tomorrow.toISOString().split('T')[0], $lte: tomorrowEnd.toISOString().split('T')[0] },
    status: { $in: ['confirmed', 'pending'] },
    reminderSent: { $ne: true }
  }).toArray();

  for (const apt of appointmentsTomorrow) {
    try {
      const clinic = clinicsMap.get(apt.clinicId);
      if (!isAutomationEnabled(clinic, 'appointmentReminders')) { results.promemoria.skipped++; continue; }
      const owner = await db.collection('users').findOne({ id: apt.ownerId });
      const pet = await db.collection('pets').findOne({ id: apt.petId });
      if (owner?.email && pet && clinic) {
        const cancellationPolicy = clinic.cancellationPolicy || { hoursNotice: 24, fee: 0 };
        const cancelUrl = `${baseUrl}?action=cancel&appointmentId=${apt.id}`;
        const phoneNumber = clinic.phone || clinic.phoneNumber || '';
        await sendEmail({
          to: owner.email,
          subject: `⏰ Promemoria: Appuntamento domani per ${pet.name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#FF6B6B,#FF8E53);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">🐾 vetbuddy</h1></div><div style="padding:30px;background:#f9f9f9;"><h2 style="color:#333;">⏰ Promemoria Appuntamento</h2><p style="color:#666;">Ciao ${owner.name || 'Proprietario'},</p><p style="color:#666;">Ti ricordiamo che <strong>${pet.name}</strong> ha un appuntamento <strong>domani</strong>:</p><div style="background:white;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #FF6B6B;"><p style="margin:5px 0;"><strong>📅 Data:</strong> ${apt.date}</p><p style="margin:5px 0;"><strong>🕐 Ora:</strong> ${apt.time}</p><p style="margin:5px 0;"><strong>🏥 Clinica:</strong> ${clinic.clinicName || clinic.name}</p><p style="margin:5px 0;"><strong>📋 Motivo:</strong> ${apt.reason || 'Visita'}</p>${clinic.address ? `<p style="margin:5px 0;"><strong>📍 Indirizzo:</strong> ${clinic.address}</p>` : ''}${phoneNumber ? `<p style="margin:5px 0;"><strong>📞 Telefono:</strong> ${phoneNumber}</p>` : ''}</div><div style="text-align:center;margin:25px 0;">${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, ho una domanda sull'appuntamento di ${pet.name} del ${apt.date}...`)}<a href="${cancelUrl}" style="display:inline-block;background:#E74C3C;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;margin:5px;">❌ Disdici Appuntamento</a></div><div style="background:#FFF3CD;padding:15px;border-radius:10px;margin-top:20px;border-left:4px solid #FFC107;"><p style="margin:0 0 10px 0;font-weight:bold;color:#856404;">📋 Politica di Cancellazione</p><p style="margin:0;color:#856404;font-size:14px;">${getCancellationPolicyText(clinic)}</p>${cancellationPolicy.fee > 0 ? `<p style="margin:10px 0 0 0;color:#856404;font-size:14px;"><strong>⚠️ Nota:</strong> La mancata disdetta comporta un addebito di €${cancellationPolicy.fee.toFixed(2)}.</p>` : ''}</div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>`
        });
        await db.collection('appointments').updateOne({ id: apt.id }, { $set: { reminderSent: true, reminderSentAt: new Date() } });
        results.promemoria.sent++;
      }
    } catch (err) { console.error('Error sending reminder:', err); results.promemoria.errors++; }
  }

  // 3. FOLLOW-UP POST VISITA (48h dopo)
  const twoDaysAgo = new Date(); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
  const completedAppointments = await db.collection('appointments').find({ date: twoDaysAgoStr, status: 'completed', followUpSent: { $ne: true } }).toArray();

  for (const apt of completedAppointments) {
    try {
      const clinic = clinicsMap.get(apt.clinicId);
      if (!isAutomationEnabled(clinic, 'postVisitFollowup')) { results.followUp.skipped++; continue; }
      const owner = await db.collection('users').findOne({ id: apt.ownerId });
      const pet = await db.collection('pets').findOne({ id: apt.petId });
      if (owner?.email && pet && clinic) {
        const reviewUrl = clinic.googlePlaceId ? `https://g.page/r/${clinic.googlePlaceId}/review` : `${baseUrl}?action=review&clinicId=${clinic.id}`;
        await sendEmail({
          to: owner.email,
          subject: `💚 Come sta ${pet.name} dopo la visita?`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#4CAF50,#8BC34A);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">🐾 vetbuddy</h1></div><div style="padding:30px;background:#f9f9f9;"><h2 style="color:#333;">Come sta ${pet.name}?</h2><p style="color:#666;">Ciao ${owner.name || 'Proprietario'},</p><p style="color:#666;">Sono passati un paio di giorni dalla visita di <strong>${pet.name}</strong> presso <strong>${clinic.clinicName || clinic.name}</strong>.</p><div style="text-align:center;margin:30px 0;">${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, ho una domanda riguardo la visita di ${pet.name}...`)}</div><div style="text-align:center;margin:20px 0;"><a href="${reviewUrl}" style="display:inline-block;background:#FFD700;color:#333;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">⭐ Lascia una Recensione</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>`
        });
        await db.collection('appointments').updateOne({ id: apt.id }, { $set: { followUpSent: true, followUpSentAt: new Date() } });
        results.followUp.sent++;
      }
    } catch (err) { console.error('Error sending follow-up:', err); results.followUp.errors++; }
  }

  // 4. NO-SHOW DETECTION
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  let totalNoShowMarked = 0, totalNoShowSkipped = 0;
  for (const clinic of allClinics) {
    if (!isAutomationEnabled(clinic, 'noShowDetection')) { totalNoShowSkipped++; continue; }
    const noShowResult = await db.collection('appointments').updateMany(
      { clinicId: clinic.id, date: { $lt: yesterdayStr }, status: { $in: ['pending', 'confirmed'] } },
      { $set: { status: 'no-show', markedNoShowAt: new Date() } }
    );
    totalNoShowMarked += noShowResult.modifiedCount;
  }
  results.noShow.marked = totalNoShowMarked;
  results.noShow.skipped = totalNoShowSkipped;

  // 5. DOCUMENT REMINDERS
  for (const clinic of allClinics) {
    if (!isAutomationEnabled(clinic, 'documentReminders')) { results.documentReminders.skipped++; continue; }
    const appointmentsWithoutDocs = await db.collection('appointments').find({
      clinicId: clinic.id, status: 'completed', hasDocuments: { $ne: true }, documentReminderSent: { $ne: true },
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
    }).toArray();
    if (appointmentsWithoutDocs.length > 0 && clinic.email) {
      const reminderList = await Promise.all(appointmentsWithoutDocs.map(async (apt) => {
        const pet = await db.collection('pets').findOne({ id: apt.petId });
        return `${pet?.name || 'Paziente'} - ${apt.reason || 'Visita'} (${apt.date})`;
      }));
      await sendEmail({ to: clinic.email, subject: `📋 ${appointmentsWithoutDocs.length} documenti da caricare - vetbuddy`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#FF9800,#FFB74D);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">📋 Documenti Mancanti</h1></div><div style="padding:30px;background:#f9f9f9;"><p>Ciao ${clinic.clinicName || 'Team'},</p><p>Ci sono <strong>${appointmentsWithoutDocs.length} visite completate</strong> senza documenti:</p><ul>${reminderList.map(r => `<li>${r}</li>`).join('')}</ul></div></div>` });
      for (const apt of appointmentsWithoutDocs) { await db.collection('appointments').updateOne({ id: apt.id }, { $set: { documentReminderSent: true } }); }
      results.documentReminders.sent++;
    }
  }

  // 6. WEEKLY REPORT (lunedì)
  if (today.getDay() === 1) {
    for (const clinic of allClinics) {
      if (!clinic.email || !isAutomationEnabled(clinic, 'weeklyReport')) { results.weeklyReports.skipped++; continue; }
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      const weeklyApts = await db.collection('appointments').find({ clinicId: clinic.id, date: { $gte: weekAgoStr, $lte: todayStr } }).toArray();
      const stats = { total: weeklyApts.length, completed: weeklyApts.filter(a => a.status === 'completed').length, noShow: weeklyApts.filter(a => a.status === 'no-show').length };
      const noShowRate = stats.total > 0 ? Math.round((stats.noShow / stats.total) * 100) : 0;
      await sendEmail({ to: clinic.email, subject: `📊 Report Settimanale - ${clinic.clinicName || 'vetbuddy'}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">📊 Report Settimanale</h1></div><div style="padding:30px;background:#f9f9f9;"><h2>Ciao ${clinic.clinicName || 'Team'}!</h2><p>Ecco il riepilogo della settimana:</p><table style="width:100%;margin:20px 0;"><tr><td style="padding:15px;background:white;text-align:center;border-radius:10px;"><strong style="font-size:28px;">${stats.total}</strong><br>Appuntamenti</td><td style="padding:15px;background:white;text-align:center;border-radius:10px;"><strong style="font-size:28px;color:#4CAF50;">${stats.completed}</strong><br>Completati</td><td style="padding:15px;background:white;text-align:center;border-radius:10px;"><strong style="font-size:28px;color:${noShowRate > 20 ? '#f44336' : '#666'};">${noShowRate}%</strong><br>No-show</td></tr></table>${noShowRate > 20 ? '<p style="color:#f44336;">⚠️ Il tasso di no-show è alto.</p>' : '<p style="color:#4CAF50;">✅ Ottimo lavoro!</p>'}</div></div>` });
      results.weeklyReports.sent++;
    }
  }

  // 12. APPOINTMENT CONFIRMATION (48h prima)
  const in2Days = new Date(); in2Days.setDate(in2Days.getDate() + 2);
  const in2DaysStr = in2Days.toISOString().split('T')[0];
  const appointmentsToConfirm = await db.collection('appointments').find({ date: in2DaysStr, status: 'pending', confirmationRequestSent: { $ne: true } }).toArray();

  for (const apt of appointmentsToConfirm) {
    const clinic = clinicsMap.get(apt.clinicId);
    if (!isAutomationEnabled(clinic, 'appointmentConfirmation')) { results.appointmentConfirmation.skipped++; continue; }
    const owner = await db.collection('users').findOne({ id: apt.ownerId });
    const pet = await db.collection('pets').findOne({ id: apt.petId });
    if (owner?.email && clinic) {
      try {
        const cancellationPolicy = clinic.cancellationPolicy || { hoursNotice: 24, fee: 0 };
        const cancelUrl = `${baseUrl}?action=cancel&appointmentId=${apt.id}`;
        await sendEmail({ to: owner.email, subject: `✅ Conferma appuntamento per ${pet?.name || 'il tuo animale'}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#FF6B6B,#FF8E53);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">✅ Conferma Appuntamento</h1></div><div style="padding:30px;background:#f9f9f9;"><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">Ti ricordiamo l'appuntamento tra 2 giorni:</p><div style="background:white;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #FF6B6B;"><p style="margin:5px 0;"><strong>📅</strong> ${apt.date}</p><p style="margin:5px 0;"><strong>🕐</strong> ${apt.time}</p><p style="margin:5px 0;"><strong>🐾</strong> ${pet?.name || 'N/A'}</p><p style="margin:5px 0;"><strong>🏥</strong> ${clinic.clinicName}</p></div><div style="text-align:center;margin:25px 0;">${getContactButton(clinic, baseUrl, 'Conferma Presenza', `Confermo la mia presenza il ${apt.date} alle ${apt.time} per ${pet?.name || 'il mio animale'}.`)}<a href="${cancelUrl}" style="display:inline-block;background:#E74C3C;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;margin:5px;">❌ Disdici</a></div><div style="background:#FFF3CD;padding:15px;border-radius:10px;border-left:4px solid #FFC107;"><p style="margin:0;font-weight:bold;color:#856404;">📋 Politica di Cancellazione</p><p style="margin:5px 0 0;color:#856404;font-size:14px;">${getCancellationPolicyText(clinic)}</p>${cancellationPolicy.fee > 0 ? `<p style="margin:10px 0 0;color:#856404;font-size:14px;"><strong>⚠️</strong> Addebito di €${cancellationPolicy.fee.toFixed(2)} per mancata disdetta.</p>` : ''}</div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>` });
        await db.collection('appointments').updateOne({ id: apt.id }, { $set: { confirmationRequestSent: true } });
        results.appointmentConfirmation.sent++;
      } catch (err) { results.appointmentConfirmation.errors++; }
    }
  }

  return results;
}
