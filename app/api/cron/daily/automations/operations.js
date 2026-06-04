import { isAutomationEnabled, getCurrentMonth, getContactButton, getPhoneButton } from '../cron-helpers';

export async function runOperationsAutomations({ db, clinicsMap, allClinics, today, todayStr, results, sendEmail }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
  const currentMonth = getCurrentMonth();

  // 13. REMINDER PAGAMENTO
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
  const unpaidInvoices = await db.collection('invoices').find({ status: 'unpaid', createdAt: { $lte: sevenDaysAgoStr }, paymentReminderSent: { $ne: true } }).toArray();
  for (const invoice of unpaidInvoices) {
    const clinic = clinicsMap.get(invoice.clinicId);
    if (!isAutomationEnabled(clinic, 'paymentReminder')) { results.paymentReminder.skipped++; continue; }
    const owner = await db.collection('users').findOne({ id: invoice.ownerId });
    if (owner?.email && clinic) {
      const payUrl = `${baseUrl}?action=payment&invoiceId=${invoice.id}`;
      try {
        await sendEmail({ to: owner.email, subject: `💳 Promemoria pagamento - ${clinic.clinicName}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#E74C3C,#C0392B);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">💳 Promemoria Pagamento</h1></div><div style="padding:30px;background:#f9f9f9;"><p>Ciao ${owner.name || ''},</p><p>Ti ricordiamo che hai una fattura in sospeso:</p><div style="background:white;padding:20px;border-radius:10px;margin:20px 0;"><p><strong>Importo:</strong> €${invoice.amount?.toFixed(2) || '0.00'}</p><p><strong>Data:</strong> ${invoice.createdAt}</p><p><strong>Clinica:</strong> ${clinic.clinicName}</p></div><div style="text-align:center;margin:25px 0;"><a href="${payUrl}" style="display:inline-block;background:#27AE60;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">💳 Paga Ora</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>` });
        await db.collection('invoices').updateOne({ id: invoice.id }, { $set: { paymentReminderSent: true } });
        results.paymentReminder.sent++;
      } catch (err) { results.paymentReminder.errors++; }
    }
  }

  // 14. ALERT STAGIONALI
  let seasonalType = null, seasonalSubject = '', seasonalContent = '';
  if (currentMonth >= 6 && currentMonth <= 8 && today.getDate() === 1) {
    seasonalType = 'summerHeatAlert';
    seasonalSubject = '☀️ Consigli per proteggere il tuo animale dal caldo';
    seasonalContent = '<h2>☀️ Estate: Proteggi il tuo animale dal caldo!</h2><ul><li>🚗 Non lasciare MAI il tuo animale in auto</li><li>💧 Acqua fresca sempre disponibile</li><li>🕐 Passeggiate nelle ore più fresche</li><li>🏠 Zone d\'ombra durante il giorno</li><li>🐾 Attenzione all\'asfalto bollente</li></ul>';
  } else if (currentMonth >= 3 && currentMonth <= 5 && today.getDate() === 1) {
    seasonalType = 'tickSeasonAlert';
    seasonalSubject = '🦟 Stagione zecche: Proteggi il tuo animale!';
    seasonalContent = '<h2>🦟 È iniziata la stagione delle zecche!</h2><ul><li>💊 Applica l\'antiparassitario</li><li>🔍 Controlla il pelo dopo ogni passeggiata</li><li>🌿 Evita erba alta</li><li>⚠️ Rimuovi zecche con pinzette apposite</li></ul>';
  } else if (currentMonth === 12 && today.getDate() >= 27) {
    seasonalType = 'newYearFireworksAlert';
    seasonalSubject = '🎆 Capodanno: Come gestire lo stress da botti';
    seasonalContent = '<h2>🎆 Capodanno in arrivo!</h2><ul><li>🏠 Crea un rifugio sicuro</li><li>🔇 Chiudi finestre e tapparelle</li><li>🎵 Musica o TV per mascherare i rumori</li><li>💊 Chiedi al veterinario per ansiolitici naturali</li></ul>';
  }
  if (seasonalType) {
    for (const clinic of allClinics) {
      if (!isAutomationEnabled(clinic, seasonalType)) { results.seasonalAlerts.skipped++; continue; }
      const clinicApts = await db.collection('appointments').find({ clinicId: clinic.id }).toArray();
      const ownerIds = [...new Set(clinicApts.map(a => a.ownerId))];
      const bookUrl = `${baseUrl}?action=book&clinicId=${clinic.id}`;
      for (const ownerId of ownerIds) {
        const owner = await db.collection('users').findOne({ id: ownerId });
        if (!owner?.email) continue;
        try {
          await sendEmail({ to: owner.email, subject: seasonalSubject, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#FF6B6B,#FF8E53);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">🐾 vetbuddy</h1></div><div style="padding:30px;background:#f9f9f9;">${seasonalContent}<div style="text-align:center;margin:25px 0;"><a href="${bookUrl}" style="display:inline-block;background:#FF6B6B;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">📅 Prenota Visita</a></div><p style="color:#999;margin-top:30px;">Dalla tua clinica: ${clinic.clinicName}</p></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>` });
          results.seasonalAlerts.sent++;
        } catch (err) { /* ignore single errors */ }
      }
    }
  }

  // 20. CHIUSURE FESTIVE
  const upcomingHolidays = [];
  const checkDate = new Date(today); checkDate.setDate(checkDate.getDate() + 7);
  const checkMonth = checkDate.getMonth() + 1;
  const checkDay = checkDate.getDate();
  if (checkMonth === 12 && checkDay >= 24 && checkDay <= 26) upcomingHolidays.push({ name: 'Natale', dates: '24-26 Dicembre' });
  if (checkMonth === 8 && checkDay >= 14 && checkDay <= 16) upcomingHolidays.push({ name: 'Ferragosto', dates: '14-16 Agosto' });
  if (upcomingHolidays.length > 0) {
    for (const clinic of allClinics) {
      if (!isAutomationEnabled(clinic, 'holidayClosures')) { results.holidayClosures.skipped++; continue; }
      const clinicClients = await db.collection('clinic_clients').find({ clinicId: clinic.id }).toArray();
      for (const cc of clinicClients) {
        const owner = await db.collection('users').findOne({ id: cc.ownerId });
        if (owner?.email) {
          const bookUrl = `${baseUrl}?action=book&clinicId=${clinic.id}`;
          await sendEmail({ to: owner.email, subject: `🏖️ Chiusura ${upcomingHolidays[0].name} - ${clinic.clinicName}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#E74C3C,#C0392B);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">🏖️ Avviso Chiusura</h1></div><div style="padding:30px;background:#f9f9f9;"><p>Ciao ${owner.name || ''},</p><p><strong>${clinic.clinicName}</strong> sarà chiusa per <strong>${upcomingHolidays[0].name}</strong>.</p><p><strong>Date:</strong> ${upcomingHolidays[0].dates}</p><div style="text-align:center;margin:25px 0;"><a href="${bookUrl}" style="display:inline-block;background:#27AE60;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">📅 Prenota Prima/Dopo</a>${getPhoneButton(clinic, true)}</div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>` });
          results.holidayClosures.sent++;
        }
      }
    }
  }

  // 22. DAILY SUMMARY
  const currentHour = today.getHours();
  if (currentHour >= 18 && currentHour <= 20) {
    for (const clinic of allClinics) {
      if (!isAutomationEnabled(clinic, 'dailySummary') || !clinic.email) { results.dailySummary.skipped++; continue; }
      const todayApts = await db.collection('appointments').find({ clinicId: clinic.id, date: todayStr }).toArray();
      const todayMessages = await db.collection('messages').countDocuments({ clinicId: clinic.id, createdAt: { $gte: new Date(todayStr) } });
      const stats = { totalApts: todayApts.length, completed: todayApts.filter(a => a.status === 'completed').length, noShow: todayApts.filter(a => a.status === 'no-show').length, messages: todayMessages };
      try {
        await sendEmail({ to: clinic.email, subject: `📊 Riepilogo di oggi - ${todayStr}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">📊 Riepilogo Giornaliero</h1></div><div style="padding:30px;background:#f9f9f9;"><h2>${todayStr}</h2><table style="width:100%;border-collapse:collapse;"><tr><td style="padding:15px;background:white;text-align:center;border-radius:10px;"><strong style="font-size:28px;color:#3498DB;">${stats.totalApts}</strong><br>Appuntamenti</td><td style="padding:15px;background:white;text-align:center;border-radius:10px;"><strong style="font-size:28px;color:#27AE60;">${stats.completed}</strong><br>Completati</td></tr><tr><td style="padding:15px;background:white;text-align:center;border-radius:10px;"><strong style="font-size:28px;color:#E74C3C;">${stats.noShow}</strong><br>No-show</td><td style="padding:15px;background:white;text-align:center;border-radius:10px;"><strong style="font-size:28px;color:#9B59B6;">${stats.messages}</strong><br>Messaggi</td></tr></table><p style="text-align:center;margin-top:20px;color:#666;">Buon riposo! A domani 💪</p></div></div>` });
        results.dailySummary.sent++;
      } catch (err) { results.dailySummary.errors++; }
    }
  }

  // 23. STAFF BIRTHDAY
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  for (const clinic of allClinics) {
    if (!isAutomationEnabled(clinic, 'staffBirthday')) { results.staffBirthday.skipped++; continue; }
    const staff = await db.collection('staff').find({ clinicId: clinic.id }).toArray();
    for (const member of staff) {
      if (!member.birthDate) continue;
      const birthDate = new Date(member.birthDate);
      if (birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay) {
        if (clinic.email) {
          try {
            await sendEmail({ to: clinic.email, subject: `🎂 Oggi è il compleanno di ${member.name}!`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#FF6B6B,#FFE66D);padding:30px;border-radius:10px 10px 0 0;text-align:center;"><h1 style="color:white;margin:0;">🎂 Buon Compleanno!</h1></div><div style="padding:30px;background:#f9f9f9;text-align:center;"><h2>${member.name}</h2><p style="font-size:48px;">🎉🎁🎈</p><p>Ricordati di fargli/le gli auguri!</p></div></div>` });
            results.staffBirthday.sent++;
          } catch (err) { results.staffBirthday.errors++; }
        }
      }
    }
  }

  return results;
}
