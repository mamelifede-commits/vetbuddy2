import { isAutomationEnabled, getContactButton, wrapEmail, logAutomation } from '../cron-helpers';

// Automazioni minori di cura: variazione peso, igiene dentale, programma referral, supporto lutto
export async function runMinorCareAutomations({ db, clinicsMap, allClinics, allPets, today, todayStr, results, sendEmail }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';

  // ============================================================
  // 48. ALERT VARIAZIONE PESO (weightAlert)
  // Variazione >= 10% tra le ultime due rilevazioni di peso -> email proprietario + log clinica
  // ============================================================
  for (const pet of allPets) {
    try {
      if (!Array.isArray(pet.weightHistory) || pet.weightHistory.length < 2) continue;
      const sorted = pet.weightHistory
        .filter(w => w && w.weight && w.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      if (sorted.length < 2) continue;
      const last = sorted[sorted.length - 1];
      const prev = sorted[sorted.length - 2];
      const lastW = parseFloat(last.weight);
      const prevW = parseFloat(prev.weight);
      if (!lastW || !prevW) continue;
      const change = (lastW - prevW) / prevW;
      if (Math.abs(change) < 0.1) continue; // soglia 10%
      if (pet.weightAlertFor === last.date) continue; // gi\u00e0 segnalato per questa rilevazione

      const clinic = clinicsMap.get(pet.clinicId);
      if (!isAutomationEnabled(clinic, 'weightAlert')) { results.weightAlert.skipped++; continue; }

      const pct = Math.round(Math.abs(change) * 100);
      const direction = change > 0 ? 'aumentato' : 'diminuito';
      const owner = await db.collection('users').findOne({ id: pet.ownerId });
      if (owner?.email && clinic) {
        await sendEmail({
          to: owner.email,
          subject: `\u2696\uFE0F Il peso di ${pet.name} \u00e8 ${direction} del ${pct}%`,
          html: wrapEmail(`<h2 style="color:#333;">\u2696\uFE0F Variazione di peso significativa</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">Dalle ultime rilevazioni il peso di <strong>${pet.name}</strong> \u00e8 <strong>${direction} del ${pct}%</strong>:</p><div style="background:#FFF7ED;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #F97316;"><p style="margin:5px 0;"><strong>\u{1F4C5} ${new Date(prev.date).toLocaleDateString('it-IT')}:</strong> ${prevW} kg</p><p style="margin:5px 0;"><strong>\u{1F4C5} ${new Date(last.date).toLocaleDateString('it-IT')}:</strong> ${lastW} kg</p></div><p style="color:#666;">Una variazione di peso rapida pu\u00f2 essere normale ma a volte segnala qualcosa che merita un controllo. Se hai dubbi, parlane con <strong>${clinic.clinicName || clinic.name}</strong>.</p><div style="text-align:center;margin:25px 0;">${getContactButton(clinic, baseUrl, 'Chiedi alla clinica', `Ciao, ho ricevuto l'avviso sulla variazione di peso di ${pet.name} e vorrei un parere...`)}</div>`)
        });
        results.weightAlert.sent++;
        await logAutomation(db, pet.clinicId, 'weightAlert', 'Variazione peso significativa', `${pet.name}: ${prevW}kg \u2192 ${lastW}kg (${direction} ${pct}%)`);
      }
      await db.collection('pets').updateOne({ id: pet.id }, { $set: { weightAlertFor: last.date, weightAlertSentAt: new Date().toISOString() } });
    } catch (err) { console.error('Weight alert error:', err); results.weightAlert.errors++; }
  }

  // ============================================================
  // 49. IGIENE DENTALE ANNUALE (dentalHygiene)
  // Pet >= 3 anni senza trattamento dentale negli ultimi 12 mesi -> promemoria (max 1 volta l'anno)
  // ============================================================
  const dentalKeywords = ['dental', 'dentale', 'detartrasi', 'igiene orale', 'odontoiatr', 'tartaro'];
  const oneYearAgo = new Date(Date.now() - 365 * 86400000);
  const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
  let dentalSentThisRun = 0;
  for (const pet of allPets) {
    try {
      if (dentalSentThisRun >= 30) break; // cap per esecuzione
      if (!pet.birthDate) continue;
      const ageYears = (Date.now() - new Date(pet.birthDate).getTime()) / (365.25 * 86400000);
      if (isNaN(ageYears) || ageYears < 3) continue;
      if (pet.dentalReminderSentAt && new Date(pet.dentalReminderSentAt) > oneYearAgo) continue;

      const clinic = clinicsMap.get(pet.clinicId);
      if (!isAutomationEnabled(clinic, 'dentalHygiene')) { results.dentalHygiene.skipped++; continue; }

      // Trattamento dentale completato negli ultimi 12 mesi?
      const recentDental = await db.collection('appointments').findOne({
        petId: pet.id,
        status: 'completed',
        date: { $gte: oneYearAgoStr },
        $or: dentalKeywords.map(k => ({ reason: { $regex: k, $options: 'i' } }))
      });
      if (recentDental) continue;

      const owner = await db.collection('users').findOne({ id: pet.ownerId });
      if (owner?.email && clinic) {
        await sendEmail({
          to: owner.email,
          subject: `\u{1F9B7} \u00c8 ora del controllo dentale di ${pet.name}`,
          html: wrapEmail(`<h2 style="color:#333;">\u{1F9B7} Sorriso in salute!</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">\u00c8 passato pi\u00f9 di un anno dall'ultimo controllo dentale di <strong>${pet.name}</strong>. Tartaro e gengiviti sono tra i problemi pi\u00f9 comuni (e silenziosi) negli animali adulti: una pulizia regolare previene dolore e problemi pi\u00f9 seri.</p><p style="color:#666;">Prenota un controllo da <strong>${clinic.clinicName || clinic.name}</strong>: bastano pochi minuti per valutare se serve una detartrasi.</p><div style="text-align:center;margin:25px 0;">${getContactButton(clinic, baseUrl, 'Prenota controllo dentale', `Ciao, vorrei prenotare un controllo dentale per ${pet.name}...`)}</div>`)
        });
        results.dentalHygiene.sent++;
        dentalSentThisRun++;
        await logAutomation(db, pet.clinicId, 'dentalHygiene', 'Promemoria igiene dentale', `${pet.name} (${Math.floor(ageYears)} anni): nessun trattamento dentale negli ultimi 12 mesi`);
      }
      await db.collection('pets').updateOne({ id: pet.id }, { $set: { dentalReminderSentAt: new Date().toISOString() } });
    } catch (err) { console.error('Dental hygiene error:', err); results.dentalHygiene.errors++; }
  }

  // ============================================================
  // 50. PROGRAMMA REFERRAL (referralProgram)
  // Clienti fedeli (>= 2 visite completate, cliente da 60+ giorni) -> invito 'porta un amico' (una tantum)
  // ============================================================
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000);
  const candidates = await db.collection('users').find({ role: 'owner', referralInviteSent: { $ne: true } }).limit(100).toArray();
  for (const owner of candidates) {
    try {
      if (!owner.email) continue;
      if (owner.createdAt && new Date(owner.createdAt) > sixtyDaysAgo) continue; // cliente troppo recente
      const completed = await db.collection('appointments').find({ ownerId: owner.id, status: 'completed' }).sort({ date: -1 }).limit(5).toArray();
      if (completed.length < 2) continue;
      const clinic = clinicsMap.get(completed[0].clinicId);
      if (!clinic) continue;
      if (!isAutomationEnabled(clinic, 'referralProgram')) { results.referralProgram.skipped++; continue; }

      await sendEmail({
        to: owner.email,
        subject: `\u{1F381} Porta un amico da ${clinic.clinicName || clinic.name}`,
        html: wrapEmail(`<h2 style="color:#333;">\u{1F381} Il passaparola che fa bene</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">Grazie per la fiducia che dimostri a <strong>${clinic.clinicName || clinic.name}</strong>! Conosci qualcuno che ha appena adottato un cucciolo o che cerca un veterinario di fiducia?</p><div style="background:#F0FDF4;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #22C55E;"><p style="margin:5px 0;color:#333;"><strong>\u{1F43E} Presenta un amico alla clinica:</strong> per lui una visita di benvenuto e per te un ringraziamento speciale al prossimo appuntamento.</p></div><p style="color:#666;">Basta fare il suo nome quando prenota la prima visita!</p><div style="text-align:center;margin:25px 0;">${getContactButton(clinic, baseUrl, 'Scrivi alla clinica', 'Ciao, vorrei presentarvi un amico per il programma referral...')}</div>`)
      });
      results.referralProgram.sent++;
      await db.collection('users').updateOne({ id: owner.id }, { $set: { referralInviteSent: true, referralInviteSentAt: new Date().toISOString() } });
      await logAutomation(db, clinic.id, 'referralProgram', 'Invito referral inviato', `${owner.name || owner.email}: cliente fedele invitato al passaparola`);
    } catch (err) { console.error('Referral program error:', err); results.referralProgram.errors++; }
  }

  // ============================================================
  // 51. SUPPORTO LUTTO (griefFollowup)
  // Messaggio di vicinanza ~1 mese dopo la perdita del pet (una tantum, nessun contenuto commerciale)
  // ============================================================
  const griefPets = await db.collection('pets').find({ status: 'deceased', deceasedAt: { $exists: true }, griefFollowupSent: { $ne: true } }).toArray();
  for (const pet of griefPets) {
    try {
      const days = (Date.now() - new Date(pet.deceasedAt).getTime()) / 86400000;
      if (isNaN(days) || days < 28) continue; // attende ~1 mese
      if (days > 60) {
        // troppo tardi: marca senza inviare per evitare messaggi fuori tempo
        await db.collection('pets').updateOne({ id: pet.id }, { $set: { griefFollowupSent: true } });
        continue;
      }
      const clinic = clinicsMap.get(pet.clinicId);
      if (!isAutomationEnabled(clinic, 'griefFollowup')) { results.griefFollowup.skipped++; continue; }
      const owner = await db.collection('users').findOne({ id: pet.ownerId });
      if (owner?.email && clinic) {
        await sendEmail({
          to: owner.email,
          subject: `Un pensiero per te da ${clinic.clinicName || clinic.name}`,
          html: wrapEmail(`<h2 style="color:#333;">\u{1F49B} Un pensiero per te</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">\u00c8 passato un mese da quando <strong>${pet.name}</strong> ci ha lasciati. Sappiamo quanto fosse importante per te e vogliamo solo dirti che ti siamo vicini.</p><p style="color:#666;">Il legame con un animale non si misura in anni, ma in momenti: ${pet.name} \u00e8 stato fortunato ad avere qualcuno che si \u00e8 preso cura di lui con tanto amore.</p><p style="color:#666;">Se ti va di parlare o se possiamo esserti utili in qualsiasi modo, la porta di <strong>${clinic.clinicName || clinic.name}</strong> \u00e8 sempre aperta.</p><p style="color:#999;font-size:13px;">Con affetto, il team della clinica</p>`)
        });
        results.griefFollowup.sent++;
        await logAutomation(db, pet.clinicId, 'griefFollowup', 'Messaggio di supporto lutto', `Inviato al proprietario di ${pet.name} (1 mese dalla perdita)`);
      }
      await db.collection('pets').updateOne({ id: pet.id }, { $set: { griefFollowupSent: true, griefFollowupSentAt: new Date().toISOString() } });
    } catch (err) { console.error('Grief followup error:', err); results.griefFollowup.errors++; }
  }

  return results;
}
