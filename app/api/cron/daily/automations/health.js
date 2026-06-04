import { isAutomationEnabled, getContactButton } from '../cron-helpers';

export async function runHealthAutomations({ db, clinicsMap, allClinics, allPets, today, todayStr, results, sendEmail }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';

  // 2. RICHIAMO VACCINI (30 giorni prima scadenza)
  const in30Days = new Date(); in30Days.setDate(in30Days.getDate() + 30);
  const in30DaysStr = in30Days.toISOString().split('T')[0];
  const vaccinesExpiring = await db.collection('vaccinations').find({ nextDueDate: { $lte: in30DaysStr }, reminderSent: { $ne: true }, status: 'active' }).toArray();

  for (const vaccine of vaccinesExpiring) {
    try {
      const pet = await db.collection('pets').findOne({ id: vaccine.petId });
      const clinic = pet?.clinicId ? clinicsMap.get(pet.clinicId) : null;
      if (clinic && !isAutomationEnabled(clinic, 'vaccineRecalls')) { results.richiamiVaccini.skipped++; continue; }
      const owner = pet ? await db.collection('users').findOne({ id: pet.ownerId }) : null;
      if (owner?.email && pet) {
        const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}`;
        await sendEmail({ to: owner.email, subject: `💉 Richiamo vaccino in scadenza per ${pet.name}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#FF6B6B,#FF8E53);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">🐾 vetbuddy</h1></div><div style="padding:30px;background:#f9f9f9;"><h2 style="color:#333;">⚠️ Richiamo Vaccino in Scadenza</h2><p style="color:#666;">Ciao ${owner.name || 'Proprietario'},</p><p style="color:#666;">Il vaccino <strong>${vaccine.name}</strong> di <strong>${pet.name}</strong> è in scadenza:</p><div style="background:white;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #FFA500;"><p style="margin:5px 0;"><strong>💉</strong> ${vaccine.name}</p><p style="margin:5px 0;"><strong>📅</strong> ${vaccine.nextDueDate}</p><p style="margin:5px 0;"><strong>🐾</strong> ${pet.name}</p></div><div style="text-align:center;margin:30px 0;"><a href="${bookUrl}" style="display:inline-block;background:#FF6B6B;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">📅 Prenota Appuntamento</a>${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, vorrei prenotare il richiamo vaccino ${vaccine.name} per ${pet.name}...`)}</div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2025 vetbuddy</p></div></div>` });
        await db.collection('vaccinations').updateOne({ id: vaccine.id }, { $set: { reminderSent: true, reminderSentAt: new Date() } });
        results.richiamiVaccini.sent++;
      }
    } catch (err) { console.error('Vaccine reminder error:', err); results.richiamiVaccini.errors++; }
  }

  // 10. ANTIPARASSITARI
  const antiparasiticDue = await db.collection('treatments').find({ type: 'antiparasitic', nextDueDate: { $lte: todayStr }, reminderSent: { $ne: true } }).toArray();
  for (const treatment of antiparasiticDue) {
    const pet = await db.collection('pets').findOne({ id: treatment.petId });
    const clinic = pet?.clinicId ? clinicsMap.get(pet.clinicId) : null;
    if (clinic && !isAutomationEnabled(clinic, 'antiparasiticReminder')) { results.antiparasitic.skipped++; continue; }
    const owner = pet ? await db.collection('users').findOne({ id: pet.ownerId }) : null;
    if (owner?.email) {
      const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Antiparassitario`;
      try {
        await sendEmail({ to: owner.email, subject: `🐜 Promemoria antiparassitario per ${pet.name}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#27AE60,#2ECC71);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">🛡️ Protezione Antiparassitaria</h1></div><div style="padding:30px;background:#f9f9f9;"><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">È tempo di rinnovare il trattamento antiparassitario di <strong>${pet.name}</strong>!</p><div style="text-align:center;margin:25px 0;"><a href="${bookUrl}" style="display:inline-block;background:#27AE60;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">💊 Prenota Trattamento</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2025 vetbuddy</p></div></div>` });
        await db.collection('treatments').updateOne({ id: treatment.id }, { $set: { reminderSent: true } });
        results.antiparasitic.sent++;
      } catch (err) { results.antiparasitic.errors++; }
    }
  }

  // 11. CONTROLLO ANNUALE
  const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
  const oneYearAgoEnd = new Date(oneYearAgo); oneYearAgoEnd.setDate(oneYearAgoEnd.getDate() + 7);
  const annualCheckupApts = await db.collection('appointments').find({ date: { $gte: oneYearAgoStr, $lte: oneYearAgoEnd.toISOString().split('T')[0] }, status: 'completed', annualReminderSent: { $ne: true } }).toArray();
  for (const apt of annualCheckupApts) {
    const clinic = clinicsMap.get(apt.clinicId);
    if (!isAutomationEnabled(clinic, 'annualCheckup')) { results.annualCheckup.skipped++; continue; }
    const owner = await db.collection('users').findOne({ id: apt.ownerId });
    const pet = await db.collection('pets').findOne({ id: apt.petId });
    if (owner?.email && pet) {
      const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Controllo%20Annuale`;
      try {
        await sendEmail({ to: owner.email, subject: `📅 È passato un anno! Controllo per ${pet.name}?`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#3498DB,#2980B9);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">📅 Controllo Annuale</h1></div><div style="padding:30px;background:#f9f9f9;"><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">È passato un anno dall'ultima visita di <strong>${pet.name}</strong>!</p><div style="text-align:center;margin:30px 0;"><a href="${bookUrl}" style="display:inline-block;background:#3498DB;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">📅 Prenota Controllo Annuale</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2025 vetbuddy</p></div></div>` });
        await db.collection('appointments').updateOne({ id: apt.id }, { $set: { annualReminderSent: true } });
        results.annualCheckup.sent++;
      } catch (err) { results.annualCheckup.errors++; }
    }
  }

  // 15. STERILIZZAZIONE (cuccioli 6-12 mesi)
  for (const pet of allPets) {
    if (!pet.birthDate || pet.isNeutered) continue;
    const birthDate = new Date(pet.birthDate);
    const ageMonths = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24 * 30));
    if (ageMonths >= 6 && ageMonths <= 12) {
      const clinic = pet.clinicId ? clinicsMap.get(pet.clinicId) : null;
      if (clinic && !isAutomationEnabled(clinic, 'sterilizationReminder')) { results.sterilization.skipped++; continue; }
      if (pet.sterilizationReminderSent) continue;
      const owner = await db.collection('users').findOne({ id: pet.ownerId });
      if (owner?.email) {
        const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Sterilizzazione`;
        try {
          await sendEmail({ to: owner.email, subject: `🐾 È il momento giusto per sterilizzare ${pet.name}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#9B59B6,#8E44AD);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">🐾 Consiglio Importante</h1></div><div style="padding:30px;background:#f9f9f9;"><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;"><strong>${pet.name}</strong> ha ${ageMonths} mesi - l'età ideale per la sterilizzazione!</p><div style="text-align:center;margin:25px 0;"><a href="${bookUrl}" style="display:inline-block;background:#9B59B6;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">🏥 Prenota Consulto</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2025 vetbuddy</p></div></div>` });
          await db.collection('pets').updateOne({ id: pet.id }, { $set: { sterilizationReminderSent: true } });
          results.sterilization.sent++;
        } catch (err) { results.sterilization.errors++; }
      }
    }
  }

  // 16. SENIOR PET CARE (7+ anni)
  for (const pet of allPets) {
    if (!pet.birthDate) continue;
    const birthDate = new Date(pet.birthDate);
    const ageYears = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24 * 365));
    if (ageYears >= 7) {
      const clinic = pet.clinicId ? clinicsMap.get(pet.clinicId) : null;
      if (clinic && !isAutomationEnabled(clinic, 'seniorPetCare')) { results.seniorPetCare.skipped++; continue; }
      const lastVisit = await db.collection('appointments').findOne({ petId: pet.id, status: 'completed' }, { sort: { date: -1 } });
      if (lastVisit) {
        const monthsSince = Math.floor((today - new Date(lastVisit.date)) / (1000 * 60 * 60 * 24 * 30));
        if (monthsSince >= 6 && !pet.seniorCheckupReminderSent) {
          const owner = await db.collection('users').findOne({ id: pet.ownerId });
          if (owner?.email) {
            const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Checkup%20Senior`;
            try {
              await sendEmail({ to: owner.email, subject: `👴 Checkup Senior per ${pet.name} (${ageYears} anni)`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#3498DB,#2980B9);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">👴 Checkup Senior</h1></div><div style="padding:30px;background:#f9f9f9;"><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;"><strong>${pet.name}</strong> ha ${ageYears} anni e merita cure speciali!</p><div style="text-align:center;margin:25px 0;"><a href="${bookUrl}" style="display:inline-block;background:#3498DB;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">🩺 Prenota Checkup Senior</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2025 vetbuddy</p></div></div>` });
              await db.collection('pets').updateOne({ id: pet.id }, { $set: { seniorCheckupReminderSent: true, seniorCheckupReminderSentAt: new Date() } });
              results.seniorPetCare.sent++;
            } catch (err) { results.seniorPetCare.errors++; }
          }
        }
      }
    }
  }

  // 17. MICROCHIP CHECK
  const microchipCheckDue = await db.collection('pets').find({ hasMicrochip: true, microchipLastVerified: { $lte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }, microchipReminderSent: { $ne: true } }).toArray();
  for (const pet of microchipCheckDue) {
    const clinic = pet.clinicId ? clinicsMap.get(pet.clinicId) : null;
    if (clinic && !isAutomationEnabled(clinic, 'microchipCheck')) { results.microchipCheck.skipped++; continue; }
    const owner = await db.collection('users').findOne({ id: pet.ownerId });
    if (owner?.email) {
      const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Verifica%20Microchip`;
      try {
        await sendEmail({ to: owner.email, subject: `📍 Verifica microchip di ${pet.name}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><div style="background:linear-gradient(135deg,#1ABC9C,#16A085);padding:20px;border-radius:10px 10px 0 0;"><h1 style="color:white;margin:0;">📍 Verifica Microchip</h1></div><div style="padding:30px;background:#f9f9f9;"><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">È passato un anno dall'ultima verifica del microchip di <strong>${pet.name}</strong>.</p><div style="text-align:center;margin:25px 0;"><a href="${bookUrl}" style="display:inline-block;background:#1ABC9C;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">📍 Prenota Verifica</a></div></div><div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;"><p style="color:#999;margin:0;font-size:12px;">© 2025 vetbuddy</p></div></div>` });
        await db.collection('pets').updateOne({ id: pet.id }, { $set: { microchipReminderSent: true } });
        results.microchipCheck.sent++;
      } catch (err) { results.microchipCheck.errors++; }
    }
  }

  return results;
}
