import { isAutomationEnabled, getContactButton, logAutomation } from '../cron-helpers';

export async function runEngagementAutomations({ db, clinicsMap, allClinics, allPets, today, todayStr, results, sendEmail }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  // 7. COMPLEANNO PET
  for (const pet of allPets) {
    if (!pet.birthDate) continue;
    const birthDate = new Date(pet.birthDate);
    if (birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay) {
      const clinic = pet.clinicId ? clinicsMap.get(pet.clinicId) : null;
      if (clinic && !isAutomationEnabled(clinic, 'petBirthday')) { results.petBirthday.skipped++; continue; }
      const owner = await db.collection('users').findOne({ id: pet.ownerId });
      if (owner?.email) {
        const age = today.getFullYear() - birthDate.getFullYear();
        const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Controllo%20Compleanno`;
        try {
          await sendEmail({ to: owner.email, subject: `🎂 Buon compleanno ${pet.name}! 🐾`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#FF6B6B,#FFE66D);padding:30px;border-radius:10px 10px 0 0;text-align:center;"><h1 style="color:white;margin:0;font-size:32px;">🎂 Buon Compleanno! 🎉</h1></div><div style="padding:30px;background:#f9f9f9;text-align:center;"><h2 style="color:#333;">${pet.name} compie ${age} anni oggi!</h2><p style="color:#666;">Tanti auguri da tutto il team vetbuddy!</p><p style="font-size:48px;">🎁🐾🎈</p><div style="margin:25px 0;"><a href="${bookUrl}" style="display:inline-block;background:#FF6B6B;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">🎁 Prenota Checkup Regalo</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>` });
          results.petBirthday.sent++;
        } catch (err) { results.petBirthday.errors++; }
      }
    }
  }

  // 8. REVIEW REQUEST (3 giorni dopo visita)
  const threeDaysAgo = new Date(); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
  const recentCompletedApts = await db.collection('appointments').find({ date: threeDaysAgoStr, status: 'completed', reviewRequestSent: { $ne: true } }).toArray();
  for (const apt of recentCompletedApts) {
    const clinic = clinicsMap.get(apt.clinicId);
    if (!isAutomationEnabled(clinic, 'reviewRequest')) { results.reviewRequest.skipped++; continue; }
    const owner = await db.collection('users').findOne({ id: apt.ownerId });
    const pet = await db.collection('pets').findOne({ id: apt.petId });
    if (owner?.email && clinic) {
      const reviewUrl = clinic.googlePlaceId ? `https://g.page/r/${clinic.googlePlaceId}` : `${baseUrl}?action=review&clinicId=${clinic.id}`;
      const bookUrl = `${baseUrl}?action=book&clinicId=${clinic.id}`;
      try {
        await sendEmail({ to: owner.email, subject: `⭐ Come è andata la visita di ${pet?.name || 'il tuo animale'}?`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#FFD700,#FFA500);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">⭐ La tua opinione conta!</h1></div><div style="padding:30px;background:#f9f9f9;"><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">Come è andata la visita di <strong>${pet?.name || 'il tuo animale'}</strong> presso <strong>${clinic.clinicName}</strong>?</p><div style="text-align:center;margin:30px 0;"><a href="${reviewUrl}" style="display:inline-block;background:#4285F4;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;margin:5px;">⭐ Lascia una Recensione</a><a href="${bookUrl}" style="display:inline-block;background:#FF6B6B;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;margin:5px;">📅 Prenota Prossima Visita</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>` });
        await db.collection('appointments').updateOne({ id: apt.id }, { $set: { reviewRequestSent: true } });
        results.reviewRequest.sent++;
      } catch (err) { results.reviewRequest.errors++; }
    }
  }

  // 9. RIATTIVAZIONE CLIENTI INATTIVI (1° del mese) — segmenti 6/9/12 mesi
  if (today.getDate() === 1) {
    const monthsAgoStr = (m) => { const d = new Date(); d.setMonth(d.getMonth() - m); return d.toISOString().split('T')[0]; };
    const sixMonthsAgoStr = monthsAgoStr(6);
    const nineMonthsAgoStr = monthsAgoStr(9);
    const twelveMonthsAgoStr = monthsAgoStr(12);

    // Messaggi differenziati per segmento
    const SEGMENTS = [
      { months: 12, flag: 'reactivation12Sent', minDateExcl: twelveMonthsAgoStr, subject: '🐾 È passato un anno... ci pensiamo noi a ricordartelo!', headline: 'Un anno senza vederci!', body: 'È passato più di un anno dall\'ultima visita. Un controllo completo è il modo migliore per assicurarti che il tuo amico stia bene: molte patologie si prevengono con una visita annuale.' },
      { months: 9, flag: 'reactivation9Sent', minDateExcl: nineMonthsAgoStr, subject: '🐾 Il tuo amico merita un controllo: sono passati 9 mesi', headline: 'Ci manchi da un po\'!', body: 'Sono passati 9 mesi dall\'ultima visita. È un buon momento per un controllo di salute e per verificare vaccini e antiparassitari.' },
      { months: 6, flag: 'reactivation6Sent', minDateExcl: sixMonthsAgoStr, subject: '🐾 Ci manchi! È tempo di un controllo?', headline: 'Ci manchi!', body: 'È passato un po\' di tempo dalla tua ultima visita. Un rapido controllo mantiene il tuo amico in salute!' }
    ];

    for (const clinic of allClinics) {
      if (!isAutomationEnabled(clinic, 'inactiveClientReactivation')) { results.inactiveClients.skipped++; continue; }
      const allClinicApts = await db.collection('appointments').find({ clinicId: clinic.id }).toArray();

      // Ultima visita per proprietario
      const lastVisitByOwner = new Map();
      for (const apt of allClinicApts) {
        if (!apt.ownerId || !apt.date) continue;
        const prev = lastVisitByOwner.get(apt.ownerId);
        if (!prev || apt.date > prev) lastVisitByOwner.set(apt.ownerId, apt.date);
      }

      let reactivatedThisClinic = 0;
      for (const [ownerId, lastDate] of lastVisitByOwner) {
        if (lastDate >= sixMonthsAgoStr) continue; // attivo

        // Determina il segmento più alto applicabile
        const segment = SEGMENTS.find(s => lastDate < s.minDateExcl);
        if (!segment) continue;

        // Backward compat: il vecchio flag unico vale come segmento 6 mesi
        const legacyCondition = segment.months === 6 ? { reactivationSent: { $ne: true } } : {};
        const owner = await db.collection('users').findOne({ id: ownerId, [segment.flag]: { $ne: true }, ...legacyCondition });
        if (!owner?.email) continue;

        const bookUrl = `${baseUrl}?action=book&clinicId=${clinic.id}`;
        try {
          await sendEmail({
            to: owner.email,
            subject: segment.subject,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#9B59B6,#E74C3C);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">🐾 ${segment.headline}</h1></div><div style="padding:30px;background:#f9f9f9;"><p>Ciao ${owner.name || ''},</p><p>${segment.body}</p><p style="color:#999;font-size:13px;">Ultima visita registrata presso <strong>${clinic.clinicName}</strong>: ${new Date(lastDate).toLocaleDateString('it-IT')}</p><div style="text-align:center;margin:30px 0;"><a href="${bookUrl}" style="display:inline-block;background:#FF6B6B;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">📅 Prenota Ora</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>`
          });
          const setFlags = { [segment.flag]: true, [`${segment.flag}At`]: new Date() };
          if (segment.months === 6) setFlags.reactivationSent = true; // legacy
          await db.collection('users').updateOne({ id: ownerId }, { $set: setFlags });
          results.inactiveClients.sent++;
          reactivatedThisClinic++;
        } catch (err) { results.inactiveClients.errors++; }
      }

      if (reactivatedThisClinic > 0) {
        await logAutomation(db, clinic.id, 'inactiveClientReactivation', 'Campagna clienti dormienti', `${reactivatedThisClinic} clienti inattivi ricontattati (segmenti 6/9/12 mesi)`);
      }
    }
  }

  // 18. WELCOME NEW PET
  const threeDaysAgoWelcome = new Date(); threeDaysAgoWelcome.setDate(threeDaysAgoWelcome.getDate() - 3);
  const newClients = await db.collection('users').find({ role: 'owner', createdAt: { $gte: threeDaysAgoWelcome, $lte: today }, welcomeEmailSent: { $ne: true } }).toArray();
  for (const client of newClients) {
    const clientClinic = await db.collection('clinic_clients').findOne({ ownerId: client.id });
    const clinic = clientClinic ? clinicsMap.get(clientClinic.clinicId) : null;
    if (clinic && !isAutomationEnabled(clinic, 'welcomeNewPet')) { results.welcomeNewPet.skipped++; continue; }
    if (client.email) {
      const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}`;
      try {
        await sendEmail({ to: client.email, subject: `🎉 Benvenuto in ${clinic?.clinicName || 'vetbuddy'}!`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#FF6B6B,#FF8E53);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">🎉 Benvenuto!</h1></div><div style="padding:30px;background:#f9f9f9;"><p style="color:#666;">Ciao ${client.name || ''},</p><p style="color:#666;">Siamo felicissimi di averti con noi! 🐾</p><h3 style="color:#333;">Cosa puoi fare con vetbuddy:</h3><ul style="color:#666;"><li>📅 Prenotare appuntamenti online</li><li>📄 Ricevere documenti e referti</li><li>💬 Chattare con la clinica</li><li>🔔 Ricevere promemoria automatici</li><li>🛡️ Creare il Passport sanitario del tuo animale</li></ul><div style="text-align:center;margin:25px 0;"><a href="${bookUrl}" style="display:inline-block;background:#FF6B6B;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">📅 Prenota Prima Visita</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>` });
        await db.collection('users').updateOne({ id: client.id }, { $set: { welcomeEmailSent: true } });
        results.welcomeNewPet.sent++;
      } catch (err) { results.welcomeNewPet.errors++; }
    }
  }

  // 19. LOYALTY PROGRAM (5, 10, 20 visite)
  for (const clinic of allClinics) {
    if (!isAutomationEnabled(clinic, 'loyaltyProgram')) { results.loyaltyProgram.skipped++; continue; }
    const clientVisitCounts = await db.collection('appointments').aggregate([
      { $match: { clinicId: clinic.id, status: 'completed' } },
      { $group: { _id: '$ownerId', visitCount: { $sum: 1 } } },
      { $match: { visitCount: { $in: [5, 10, 20] } } }
    ]).toArray();
    for (const clientStats of clientVisitCounts) {
      const owner = await db.collection('users').findOne({ id: clientStats._id, [`loyaltyMilestone${clientStats.visitCount}Sent`]: { $ne: true } });
      if (owner?.email) {
        const discount = clientStats.visitCount === 5 ? '10%' : clientStats.visitCount === 10 ? '15%' : '20%';
        try {
          await sendEmail({ to: owner.email, subject: `🏆 Hai raggiunto ${clientStats.visitCount} visite! Ecco il tuo premio`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#F39C12,#E74C3C);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">🏆 Traguardo Raggiunto!</h1></div><div style="padding:30px;background:#f9f9f9;text-align:center;"><p style="font-size:48px;margin:0;">🎉</p><h2 style="color:#333;">${clientStats.visitCount} visite con noi!</h2><div style="background:#27AE60;color:white;padding:20px;border-radius:10px;margin:20px 0;"><p style="font-size:32px;font-weight:bold;margin:0;">${discount} DI SCONTO</p><p style="margin:5px 0;">sulla prossima visita</p></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2026 vetbuddy</p></div></div>` });
          await db.collection('users').updateOne({ id: clientStats._id }, { $set: { [`loyaltyMilestone${clientStats.visitCount}Sent`]: true } });
          results.loyaltyProgram.sent++;
        } catch (err) { results.loyaltyProgram.errors++; }
      }
    }
  }

  // 21. CONDOGLIANZE PET
  const deceasedPets = await db.collection('pets').find({ status: 'deceased', deceasedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, condolencesSent: { $ne: true } }).toArray();
  for (const pet of deceasedPets) {
    const clinic = pet.clinicId ? clinicsMap.get(pet.clinicId) : null;
    if (clinic && !isAutomationEnabled(clinic, 'petCondolences')) { results.petCondolences.skipped++; continue; }
    const owner = await db.collection('users').findOne({ id: pet.ownerId });
    if (owner?.email) {
      try {
        await sendEmail({ to: owner.email, subject: `💔 Le nostre più sentite condoglianze per ${pet.name}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#5D6D7E,#34495E);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">💔 Con profondo affetto</h1></div><div style="padding:30px;background:#f9f9f9;"><p>Caro/a ${owner.name || ''},</p><p>Abbiamo appreso con grande tristezza della perdita di <strong>${pet.name}</strong>.</p><p>${pet.name} è stato fortunato/a ad avere un proprietario così amorevole.</p><p style="font-style:italic;color:#666;">"Non sei più al mio fianco, ma sei per sempre nel mio cuore."</p><p>Con affetto,<br>Il team di ${clinic?.clinicName || 'vetbuddy'}</p><p style="font-size:24px;text-align:center;">🌈🐾</p></div></div>` });
        await db.collection('pets').updateOne({ id: pet.id }, { $set: { condolencesSent: true } });
        results.petCondolences.sent++;
      } catch (err) { results.petCondolences.errors++; }
    }
  }

  return results;
}
