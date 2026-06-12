import { isAutomationEnabled, getContactButton, wrapEmail, logAutomation } from '../cron-helpers';

const SURGICAL_KEYWORDS = ['chirurg', 'steriliz', 'castraz', 'anestes', 'intervento', 'operaz', 'estrazion', 'detartrasi', 'odontoiatr', 'biopsia'];

function isSurgical(apt) {
  const text = `${apt.reason || ''} ${apt.serviceId || ''} ${apt.notes || ''}`.toLowerCase();
  return SURGICAL_KEYWORDS.some(k => text.includes(k));
}

// Automazioni Batch 3-4: post-operatorio, fine terapia, referto fermo, consensi mancanti, onboarding, percorso cucciolo
export async function runCareFollowupAutomations({ db, clinicsMap, allClinics, allPets, today, todayStr, results, sendEmail }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';

  // ============================================================
  // 40. POST-OPERATORIO (postSurgeryFollowup) — sequenza 24h / 3gg / 7gg
  // ============================================================
  const tenDaysAgoStr = new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0];
  const completedRecent = await db.collection('appointments').find({
    status: 'completed',
    date: { $gte: tenDaysAgoStr, $lt: todayStr },
    postOp7Sent: { $ne: true }
  }).toArray();

  for (const apt of completedRecent) {
    try {
      if (!isSurgical(apt)) continue;
      const clinic = clinicsMap.get(apt.clinicId);
      if (!isAutomationEnabled(clinic, 'postSurgeryFollowup')) { results.postSurgeryFollowup.skipped++; continue; }
      const owner = apt.ownerId ? await db.collection('users').findOne({ id: apt.ownerId }) : null;
      if (!owner?.email || !clinic) continue;

      const daysSince = Math.floor((today - new Date(apt.date)) / 86400000);
      let stage = null;
      if (daysSince >= 7 && !apt.postOp7Sent) stage = 7;
      else if (daysSince >= 3 && !apt.postOp3Sent) stage = 3;
      else if (daysSince >= 1 && !apt.postOp1Sent) stage = 1;
      if (!stage) continue;

      const petName = apt.petName || 'il tuo animale';
      const messages = {
        1: { subject: `🩹 Come sta ${petName} dopo l'intervento?`, body: `<p style="color:#666;">Ieri ${petName} ha affrontato una procedura presso <strong>${clinic.clinicName || clinic.name}</strong>. Nelle prime 24-48 ore è normale un po' di sonnolenza.</p><ul style="color:#666;"><li>✅ Controlla la ferita: deve restare pulita e asciutta</li><li>💊 Segui scrupolosamente i farmaci prescritti</li><li>🚫 Evita corse, salti e bagni</li></ul><p style="color:#666;"><strong>Se noti gonfiore, sanguinamento, vomito ripetuto o forte abbattimento, contatta subito la clinica.</strong></p>` },
        3: { subject: `🩹 ${petName}: controllo a 3 giorni dall'intervento`, body: `<p style="color:#666;">Sono passati 3 giorni dalla procedura di ${petName}. A questo punto dovrebbe essere più vivace e mangiare regolarmente.</p><ul style="color:#666;"><li>🔎 La ferita non deve essere arrossata o calda</li><li>💊 Continua la terapia fino alla fine, anche se sembra guarito</li></ul><p style="color:#666;">Hai dubbi o noti qualcosa di strano? Scrivici, siamo qui per questo.</p>` },
        7: { subject: `🩹 ${petName}: una settimana dall'intervento — tutto ok?`, body: `<p style="color:#666;">È passata una settimana dalla procedura di ${petName}. Se non è già programmata, ti consigliamo una <strong>visita di controllo</strong> per verificare la guarigione ed eventualmente rimuovere i punti.</p>` }
      };
      const msg = messages[stage];
      await sendEmail({
        to: owner.email,
        subject: msg.subject,
        html: wrapEmail(`<h2 style="color:#333;">🩹 Follow-up post-operatorio</h2><p style="color:#666;">Ciao ${owner.name || ''},</p>${msg.body}<div style="text-align:center;margin:25px 0;">${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, vi aggiorno su ${petName} dopo l'intervento...`)}${stage === 7 ? `<a href="${baseUrl}?action=book&clinicId=${clinic.id}&petId=${apt.petId || ''}" style="display:inline-block;background:#10B981;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;margin:5px;">📅 Prenota Controllo</a>` : ''}</div><p style="color:#999;font-size:12px;">Questi consigli sono generali e non sostituiscono il parere del veterinario.</p>`)
      });
      const flags = { [`postOp${stage}Sent`]: true, [`postOp${stage}SentAt`]: new Date() };
      if (stage === 7) { flags.postOp3Sent = true; flags.postOp1Sent = true; }
      if (stage === 3) { flags.postOp1Sent = true; }
      await db.collection('appointments').updateOne({ id: apt.id }, { $set: flags });
      results.postSurgeryFollowup.sent++;
    } catch (err) { console.error('Post-surgery followup error:', err); results.postSurgeryFollowup.errors++; }
  }

  // ============================================================
  // 41. FINE TERAPIA / RINNOVO PRESCRIZIONE (medicationRefill)
  // Prescrizioni emesse 25-35 giorni fa → promemoria rinnovo
  // ============================================================
  const days25Ago = new Date(Date.now() - 25 * 86400000).toISOString();
  const days35Ago = new Date(Date.now() - 35 * 86400000).toISOString();
  const refillCandidates = await db.collection('prescriptions').find({
    status: { $in: ['EMITTED', 'REGISTERED_MANUALLY'] },
    visibleToOwner: true,
    refillReminderSent: { $ne: true },
    issueDate: { $lte: days25Ago, $gte: days35Ago }
  }).toArray();

  for (const prescription of refillCandidates) {
    try {
      const clinic = clinicsMap.get(prescription.clinicId);
      if (!isAutomationEnabled(clinic, 'medicationRefill')) { results.medicationRefill.skipped++; continue; }
      const owner = prescription.ownerId ? await db.collection('users').findOne({ id: prescription.ownerId }) : null;
      if (owner?.email && clinic) {
        await sendEmail({
          to: owner.email,
          subject: `💊 La terapia di ${prescription.petName || 'il tuo animale'} è in esaurimento?`,
          html: wrapEmail(`<h2 style="color:#333;">💊 Promemoria rinnovo terapia</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">Circa un mese fa è stata prescritta una terapia per <strong>${prescription.petName || 'il tuo animale'}</strong>. Se si tratta di un farmaco continuativo o la terapia è in esaurimento, è il momento di richiedere il <strong>rinnovo della prescrizione</strong>.</p><p style="color:#666;">In alcuni casi il veterinario potrebbe consigliare un rapido controllo prima del rinnovo.</p><div style="text-align:center;margin:25px 0;">${getContactButton(clinic, baseUrl, 'Richiedi Rinnovo', `Ciao, vorrei richiedere il rinnovo della prescrizione di ${prescription.petName || 'il mio animale'}...`)}</div>`)
        });
        await db.collection('prescriptions').updateOne({ id: prescription.id }, { $set: { refillReminderSent: true, refillReminderSentAt: new Date() } });
        results.medicationRefill.sent++;
      } else {
        await db.collection('prescriptions').updateOne({ id: prescription.id }, { $set: { refillReminderSent: true } });
        results.medicationRefill.skipped++;
      }
    } catch (err) { console.error('Medication refill error:', err); results.medicationRefill.errors++; }
  }

  // ============================================================
  // 42. REFERTO FERMO (estende labDelayAlert)
  // Referto completato dal lab ma non consegnato/condiviso dopo 48h → reminder clinica
  // ============================================================
  const hours48Ago = new Date(Date.now() - 48 * 3600000).toISOString();
  const stuckReports = await db.collection('lab_requests').find({
    status: 'completed',
    updatedAt: { $lte: hours48Ago },
    stuckReportAlertSent: { $ne: true }
  }).toArray();

  const stuckByClinic = new Map();
  for (const req of stuckReports) {
    if (!stuckByClinic.has(req.clinicId)) stuckByClinic.set(req.clinicId, []);
    stuckByClinic.get(req.clinicId).push(req);
  }
  for (const [clinicId, reqs] of stuckByClinic) {
    try {
      const clinic = clinicsMap.get(clinicId);
      if (!isAutomationEnabled(clinic, 'labDelayAlert')) { results.labDelayAlert.skipped++; continue; }
      if (clinic?.email) {
        const rows = reqs.map(r => `<li><strong>${r.examName || r.examType || 'Analisi'}</strong> — ${r.petName || 'paziente'} (completato il ${new Date(r.updatedAt).toLocaleDateString('it-IT')})</li>`).join('');
        await sendEmail({
          to: clinic.email,
          subject: `📄 ${reqs.length} referti pronti da oltre 48h non ancora gestiti`,
          html: wrapEmail(`<h2 style="color:#333;">📄 Referti fermi</h2><p style="color:#666;">Questi referti sono stati completati dal laboratorio da più di 48 ore. Ricordati di revisionarli e comunicarli al proprietario:</p><ul style="color:#666;">${rows}</ul><p style="color:#999;font-size:13px;">💡 Un referto comunicato in fretta è il miglior biglietto da visita della clinica.</p>`)
        });
        await logAutomation(db, clinicId, 'labDelayAlert', 'Referti fermi', `${reqs.length} referti completati da +48h in attesa di revisione/invio`);
      }
      for (const r of reqs) {
        await db.collection('lab_requests').updateOne({ id: r.id }, { $set: { stuckReportAlertSent: true, stuckReportAlertSentAt: new Date() } });
      }
      results.labDelayAlert.stuckReports = (results.labDelayAlert.stuckReports || 0) + reqs.length;
    } catch (err) { console.error('Stuck report alert error:', err); results.labDelayAlert.errors++; }
  }

  // ============================================================
  // 43. CONSENSO MANCANTE (missingConsentCheck)
  // Appuntamenti chirurgici entro 2 giorni senza consenso firmato
  // ============================================================
  const in2DaysStr = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
  const upcomingSurgical = await db.collection('appointments').find({
    date: { $gte: todayStr, $lte: in2DaysStr },
    status: { $in: ['pending', 'confirmed'] },
    consentCheckDone: { $ne: true }
  }).toArray();

  const missingByClinic = new Map();
  for (const apt of upcomingSurgical) {
    try {
      if (!isSurgical(apt)) {
        await db.collection('appointments').updateOne({ id: apt.id }, { $set: { consentCheckDone: true } });
        continue;
      }
      const clinic = clinicsMap.get(apt.clinicId);
      if (!isAutomationEnabled(clinic, 'missingConsentCheck')) { results.missingConsentCheck.skipped++; continue; }

      // Cerca un consenso chirurgia/anestesia firmato per questo proprietario (e pet se indicato)
      const signedQuery = { clinicId: apt.clinicId, type: { $in: ['chirurgia', 'anestesia'] }, status: 'firmato' };
      if (apt.ownerId) signedQuery.ownerId = apt.ownerId;
      else signedQuery.ownerName = apt.ownerName;
      const signed = await db.collection('consents').findOne(signedQuery);

      if (!signed) {
        // C'è un consenso inviato ma non ancora firmato? → reminder al proprietario
        const pendingQuery = { ...signedQuery, status: { $in: ['inviato', 'visto'] } };
        const pending = await db.collection('consents').findOne(pendingQuery);
        if (pending && pending.ownerEmail) {
          const signUrl = `${baseUrl}/consent/${pending.id}?t=${pending.token}`;
          await sendEmail({
            to: pending.ownerEmail,
            subject: `✍️ Promemoria: firma il consenso prima della procedura di ${apt.petName || 'il tuo animale'}`,
            html: wrapEmail(`<h2 style="color:#333;">✍️ Manca la tua firma</h2><p style="color:#666;">Ciao ${apt.ownerName || ''},</p><p style="color:#666;">L'appuntamento di <strong>${apt.petName || 'il tuo animale'}</strong> del <strong>${apt.date}</strong> si avvicina e manca ancora la firma sul consenso richiesto da <strong>${clinic?.clinicName || 'la clinica'}</strong>.</p><p style="color:#666;">Firmarlo prima dell'appuntamento fa risparmiare tempo a tutti!</p><div style="text-align:center;margin:25px 0;"><a href="${signUrl}" style="display:inline-block;background:#3B82F6;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">✍️ Firma Ora</a></div>`)
          });
          results.missingConsentCheck.sent++;
        }
        if (!missingByClinic.has(apt.clinicId)) missingByClinic.set(apt.clinicId, []);
        missingByClinic.get(apt.clinicId).push({ apt, hasPending: !!pending });
      }
      await db.collection('appointments').updateOne({ id: apt.id }, { $set: { consentCheckDone: true } });
    } catch (err) { console.error('Missing consent check error:', err); results.missingConsentCheck.errors++; }
  }
  for (const [clinicId, list] of missingByClinic) {
    try {
      const clinic = clinicsMap.get(clinicId);
      if (!clinic?.email) continue;
      const rows = list.map(x => `<li><strong>${x.apt.petName || 'Paziente'}</strong> — ${x.apt.ownerName || 'Cliente'} (${x.apt.date}${x.apt.time ? ' ' + x.apt.time : ''}) — ${x.apt.reason || 'procedura'} ${x.hasPending ? '→ <em>consenso inviato, in attesa di firma (promemoria inviato)</em>' : '→ <strong style="color:#E74C3C;">nessun consenso creato</strong>'}</li>`).join('');
      await sendEmail({
        to: clinic.email,
        subject: `⚠️ ${list.length} procedure imminenti senza consenso firmato`,
        html: wrapEmail(`<h2 style="color:#333;">⚠️ Consensi mancanti</h2><p style="color:#666;">Questi appuntamenti con procedura nei prossimi 2 giorni non hanno un consenso chirurgico/anestesiologico firmato:</p><ul style="color:#666;">${rows}</ul><p style="color:#666;">Crea e invia i consensi mancanti dal modulo <strong>Consensi Digitali</strong>: il proprietario firma da smartphone in 1 minuto.</p>`)
      });
      await logAutomation(db, clinicId, 'missingConsentCheck', 'Consensi mancanti', `${list.length} procedure imminenti senza consenso firmato`);
      results.missingConsentCheck.clinicAlerts = (results.missingConsentCheck.clinicAlerts || 0) + 1;
    } catch (err) { console.error('Missing consent clinic alert error:', err); }
  }

  // ============================================================
  // 44. ONBOARDING CLIENTE NUOVO (sequenza, chiave welcomeNewPet)
  // Step 2 (giorno 5-7): completa il Passport — Step 3 (giorno 10-14): prenota la prima visita
  // ============================================================
  const day5 = new Date(Date.now() - 5 * 86400000);
  const day7 = new Date(Date.now() - 7 * 86400000);
  const day10 = new Date(Date.now() - 10 * 86400000);
  const day14 = new Date(Date.now() - 14 * 86400000);

  // Step 2: Passport
  const step2Owners = await db.collection('users').find({
    role: 'owner',
    createdAt: { $lte: day5, $gte: day7 },
    welcomeEmailSent: true,
    onboardingPassportSent: { $ne: true }
  }).toArray();
  for (const owner of step2Owners) {
    try {
      const clientLink = await db.collection('clinic_clients').findOne({ ownerId: owner.id });
      const clinic = clientLink ? clinicsMap.get(clientLink.clinicId) : null;
      if (clinic && !isAutomationEnabled(clinic, 'welcomeNewPet')) { results.welcomeNewPet.skipped++; continue; }
      if (owner.email) {
        await sendEmail({
          to: owner.email,
          subject: `🛡️ Hai già creato il Passport del tuo animale?`,
          html: wrapEmail(`<h2 style="color:#333;">🛡️ Il Passport: la carta d'identità sanitaria</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">Con il <strong>Passport VetBuddy</strong> hai sempre con te: vaccini, allergie, farmaci, microchip e contatto d'emergenza del tuo animale. In più puoi generare un <strong>QR di emergenza</strong>!</p><div style="text-align:center;margin:25px 0;"><a href="${baseUrl}" style="display:inline-block;background:#8B5CF6;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">🛡️ Completa il Passport</a></div>`)
        });
        await db.collection('users').updateOne({ id: owner.id }, { $set: { onboardingPassportSent: true } });
        results.welcomeNewPet.sent++;
      }
    } catch (err) { console.error('Onboarding step2 error:', err); results.welcomeNewPet.errors++; }
  }

  // Step 3: prenota la prima visita (solo se non ha mai prenotato)
  const step3Owners = await db.collection('users').find({
    role: 'owner',
    createdAt: { $lte: day10, $gte: day14 },
    onboardingBookSent: { $ne: true }
  }).toArray();
  for (const owner of step3Owners) {
    try {
      const hasAppointment = await db.collection('appointments').findOne({ ownerId: owner.id });
      if (hasAppointment) {
        await db.collection('users').updateOne({ id: owner.id }, { $set: { onboardingBookSent: true } });
        continue;
      }
      const clientLink = await db.collection('clinic_clients').findOne({ ownerId: owner.id });
      const clinic = clientLink ? clinicsMap.get(clientLink.clinicId) : null;
      if (clinic && !isAutomationEnabled(clinic, 'welcomeNewPet')) { results.welcomeNewPet.skipped++; continue; }
      if (owner.email) {
        const bookUrl = `${baseUrl}?action=book${clinic ? `&clinicId=${clinic.id}` : ''}`;
        await sendEmail({
          to: owner.email,
          subject: `📅 Prenota la prima visita: bastano 30 secondi`,
          html: wrapEmail(`<h2 style="color:#333;">📅 Non hai ancora prenotato!</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">Sei con noi da un paio di settimane ma non hai ancora prenotato la prima visita. Una visita di controllo è il modo migliore per iniziare a prenderti cura del tuo animale.</p><div style="text-align:center;margin:25px 0;"><a href="${bookUrl}" style="display:inline-block;background:#FF6B6B;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">📅 Prenota Ora Online</a></div>`)
        });
        await db.collection('users').updateOne({ id: owner.id }, { $set: { onboardingBookSent: true } });
        results.welcomeNewPet.sent++;
      }
    } catch (err) { console.error('Onboarding step3 error:', err); results.welcomeNewPet.errors++; }
  }

  // ============================================================
  // 45. PERCORSO CUCCIOLO (puppyProgram)
  // Pet sotto i 12 mesi → guida al percorso cucciolo (una tantum)
  // ============================================================
  const twelveMonthsAgo = new Date(); twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  const puppies = allPets.filter(p => {
    if (!p.birthDate || p.puppyPlanSent) return false;
    const bd = new Date(p.birthDate);
    return !isNaN(bd) && bd > twelveMonthsAgo;
  });

  const puppyCountByClinic = new Map();
  for (const pet of puppies) {
    try {
      const clinic = pet.clinicId ? clinicsMap.get(pet.clinicId) : null;
      if (clinic && !isAutomationEnabled(clinic, 'puppyProgram')) { results.puppyProgram.skipped++; continue; }
      const owner = pet.ownerId ? await db.collection('users').findOne({ id: pet.ownerId }) : null;
      if (!owner?.email) {
        await db.collection('pets').updateOne({ id: pet.id }, { $set: { puppyPlanSent: true } });
        continue;
      }
      const ageMonths = Math.max(0, Math.floor((Date.now() - new Date(pet.birthDate).getTime()) / (30.44 * 86400000)));
      await sendEmail({
        to: owner.email,
        subject: `🐶 ${pet.name} è un cucciolo: ecco il percorso consigliato!`,
        html: wrapEmail(`<h2 style="color:#333;">🐶 Benvenuto ${pet.name}!</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;"><strong>${pet.name}</strong> ha circa <strong>${ageMonths} ${ageMonths === 1 ? 'mese' : 'mesi'}</strong>: i primi 12 mesi sono fondamentali. Ecco il percorso che ${clinic ? `<strong>${clinic.clinicName || clinic.name}</strong>` : 'il tuo veterinario'} consiglia di seguire:</p><ul style="color:#666;"><li>💉 <strong>Ciclo vaccinale di base</strong> e richiami</li><li>🪱 <strong>Antiparassitari</strong> regolari (interni ed esterni)</li><li>📍 <strong>Microchip</strong> e iscrizione all'anagrafe</li><li>✂️ <strong>Sterilizzazione</strong>: tempi e benefici da valutare col veterinario</li><li>🦷 Prima <strong>valutazione dentale</strong> e abitudine alla pulizia</li><li>⚖️ Controlli <strong>crescita e peso</strong></li><li>🛡️ <strong>Passport</strong> sanitario sempre aggiornato</li></ul><p style="color:#666;">Chiedi alla clinica del <strong>Piano Salute Cucciolo</strong>: cure programmate e risparmio sulle visite del primo anno.</p><div style="text-align:center;margin:25px 0;">${clinic ? `<a href="${baseUrl}?action=book&clinicId=${clinic.id}&petId=${pet.id}" style="display:inline-block;background:#10B981;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;margin:5px;">📅 Prenota Visita Cucciolo</a>${getContactButton(clinic, baseUrl, 'Chiedi del Piano Cucciolo', `Ciao! ${pet.name} è un cucciolo, vorrei informazioni sul percorso/piano salute cucciolo...`)}` : ''}</div><p style="color:#999;font-size:12px;">Indicazioni generali: tempi e protocolli vengono sempre definiti dal veterinario.</p>`)
      });
      await db.collection('pets').updateOne({ id: pet.id }, { $set: { puppyPlanSent: true, puppyPlanSentAt: new Date() } });
      results.puppyProgram.sent++;
      if (pet.clinicId) puppyCountByClinic.set(pet.clinicId, (puppyCountByClinic.get(pet.clinicId) || 0) + 1);
    } catch (err) { console.error('Puppy program error:', err); results.puppyProgram.errors++; }
  }
  for (const [clinicId, count] of puppyCountByClinic) {
    await logAutomation(db, clinicId, 'puppyProgram', 'Percorso cucciolo', `${count} proprietari di cuccioli hanno ricevuto la guida al percorso`);
  }

  return results;
}
