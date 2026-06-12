import { isAutomationEnabled, getContactButton, wrapEmail } from '../cron-helpers';

// Automazioni Intelligenti: Gestione Lavoro, Finanza e Laboratorio
export async function runWorkManagementAutomations({ db, clinicsMap, allClinics, today, todayStr, results, sendEmail }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';

  // ============================================================
  // 24. PREVISIONE RISCHIO NO-SHOW
  // Analizza lo storico del cliente e segnala appuntamenti a rischio
  // ============================================================
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const tomorrowApts = await db.collection('appointments').find({
    date: tomorrowStr,
    status: { $in: ['pending', 'confirmed'] },
    riskAssessed: { $ne: true }
  }).toArray();

  const riskyByClinic = new Map();
  for (const apt of tomorrowApts) {
    try {
      const clinic = clinicsMap.get(apt.clinicId);
      if (!isAutomationEnabled(clinic, 'noShowRiskPrediction')) { results.noShowRiskPrediction.skipped++; continue; }

      // Storico cliente: visite completate vs no-show
      const history = await db.collection('appointments').find({
        ownerId: apt.ownerId,
        status: { $in: ['completed', 'no-show'] }
      }).toArray();
      const noShows = history.filter(a => a.status === 'no-show').length;
      const total = history.length;
      const riskRate = total > 0 ? noShows / total : 0;
      const isHighRisk = noShows >= 1 && riskRate >= 0.25;

      await db.collection('appointments').updateOne(
        { id: apt.id },
        { $set: { riskAssessed: true, noShowRisk: isHighRisk ? 'high' : 'low', noShowRiskRate: Math.round(riskRate * 100) } }
      );

      if (isHighRisk) {
        const owner = await db.collection('users').findOne({ id: apt.ownerId });
        const pet = await db.collection('pets').findOne({ id: apt.petId });
        if (owner?.email && clinic) {
          const cancelUrl = `${baseUrl}?action=cancel&appointmentId=${apt.id}`;
          await sendEmail({
            to: owner.email,
            subject: `🔔 Ci sarai domani? Conferma l'appuntamento di ${pet?.name || 'il tuo animale'}`,
            html: wrapEmail(`<h2 style="color:#333;">🔔 Confermi la tua presenza?</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">Domani <strong>${pet?.name || 'il tuo animale'}</strong> ha un appuntamento presso <strong>${clinic.clinicName || clinic.name}</strong>:</p><div style="background:#FFF7ED;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #F97316;"><p style="margin:5px 0;"><strong>📅 Data:</strong> ${apt.date}</p><p style="margin:5px 0;"><strong>🕐 Ora:</strong> ${apt.time}</p><p style="margin:5px 0;"><strong>📋 Motivo:</strong> ${apt.reason || 'Visita'}</p></div><p style="color:#666;">Per organizzare al meglio il lavoro della clinica ti chiediamo una rapida conferma. Se non puoi venire, disdici subito: lo slot verrà offerto ad un altro paziente.</p><div style="text-align:center;margin:25px 0;">${getContactButton(clinic, baseUrl, 'Confermo la presenza', `Confermo la mia presenza domani ${apt.date} alle ${apt.time} per ${pet?.name || 'il mio animale'}.`)}<a href="${cancelUrl}" style="display:inline-block;background:#E74C3C;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;margin:5px;">❌ Disdici</a></div>`)
          });
          await db.collection('appointments').updateOne({ id: apt.id }, { $set: { riskReminderSent: true, riskReminderSentAt: new Date() } });
          results.noShowRiskPrediction.sent++;
        }
        if (!riskyByClinic.has(apt.clinicId)) riskyByClinic.set(apt.clinicId, []);
        riskyByClinic.get(apt.clinicId).push({ apt, ownerName: (await db.collection('users').findOne({ id: apt.ownerId }))?.name || 'N/A', petName: pet?.name || 'N/A', riskRate: Math.round(riskRate * 100) });
      }
    } catch (err) { console.error('No-show risk prediction error:', err); results.noShowRiskPrediction.errors++; }
  }

  // Avvisa la clinica con la lista degli appuntamenti a rischio di domani
  for (const [clinicId, list] of riskyByClinic) {
    const clinic = clinicsMap.get(clinicId);
    if (clinic?.email && list.length > 0) {
      try {
        const rows = list.map(r => `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${r.apt.time}</td><td style="padding:8px;border-bottom:1px solid #eee;">${r.petName}</td><td style="padding:8px;border-bottom:1px solid #eee;">${r.ownerName}</td><td style="padding:8px;border-bottom:1px solid #eee;color:#E74C3C;font-weight:bold;">${r.riskRate}%</td></tr>`).join('');
        await sendEmail({
          to: clinic.email,
          subject: `⚠️ ${list.length} appuntamenti a rischio no-show domani`,
          html: wrapEmail(`<h2 style="color:#333;">⚠️ Appuntamenti a rischio domani</h2><p style="color:#666;">Questi clienti hanno uno storico di assenze. Abbiamo già inviato loro un promemoria extra, ma una <strong>telefonata di conferma</strong> può fare la differenza:</p><table style="width:100%;border-collapse:collapse;margin:15px 0;"><tr style="background:#F9F9F9;"><th style="padding:8px;text-align:left;">Ora</th><th style="padding:8px;text-align:left;">Paziente</th><th style="padding:8px;text-align:left;">Cliente</th><th style="padding:8px;text-align:left;">Rischio</th></tr>${rows}</table><p style="color:#999;font-size:13px;">💡 Suggerimento: tieni una lista d'attesa pronta per coprire eventuali assenze.</p>`)
        });
        results.noShowRiskPrediction.clinicAlerts++;
      } catch (err) { console.error('Risk clinic alert error:', err); }
    }
  }

  // ============================================================
  // 25. RECUPERO NO-SHOW
  // Invita automaticamente a riprenotare chi non si è presentato
  // ============================================================
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const noShowApts = await db.collection('appointments').find({ status: 'no-show', recoverySent: { $ne: true } }).toArray();
  for (const apt of noShowApts) {
    try {
      const clinic = clinicsMap.get(apt.clinicId);
      if (!isAutomationEnabled(clinic, 'noShowRecovery')) { results.noShowRecovery.skipped++; continue; }

      // Evita di contattare no-show troppo vecchi (oltre 7 giorni)
      if (apt.markedNoShowAt && new Date(apt.markedNoShowAt) < sevenDaysAgo) {
        await db.collection('appointments').updateOne({ id: apt.id }, { $set: { recoverySent: true, recoverySkippedOld: true } });
        results.noShowRecovery.skipped++; continue;
      }

      const owner = await db.collection('users').findOne({ id: apt.ownerId });
      const pet = await db.collection('pets').findOne({ id: apt.petId });
      if (owner?.email && clinic) {
        const bookUrl = `${baseUrl}?action=book&clinicId=${clinic.id}&petId=${apt.petId || ''}`;
        await sendEmail({
          to: owner.email,
          subject: `🐾 Ci sei mancato! Riprenotiamo la visita di ${pet?.name || 'il tuo animale'}?`,
          html: wrapEmail(`<h2 style="color:#333;">🐾 Non ti abbiamo visto!</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">L'appuntamento di <strong>${pet?.name || 'il tuo animale'}</strong> del <strong>${apt.date}</strong> presso <strong>${clinic.clinicName || clinic.name}</strong> è saltato. Capita a tutti!</p><p style="color:#666;">La salute di ${pet?.name || 'il tuo amico'} è importante: riprenota in pochi click.</p><div style="text-align:center;margin:25px 0;"><a href="${bookUrl}" style="display:inline-block;background:#F97066;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;margin:5px;">📅 Riprenota Ora</a>${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, vorrei riprenotare la visita di ${pet?.name || 'il mio animale'}...`)}</div>`)
        });
        await db.collection('appointments').updateOne({ id: apt.id }, { $set: { recoverySent: true, recoverySentAt: new Date() } });
        results.noShowRecovery.sent++;
      } else {
        await db.collection('appointments').updateOne({ id: apt.id }, { $set: { recoverySent: true } });
        results.noShowRecovery.skipped++;
      }
    } catch (err) { console.error('No-show recovery error:', err); results.noShowRecovery.errors++; }
  }

  // ============================================================
  // 26. RIEMPI-AGENDA INTELLIGENTE
  // Slot vuoti nei prossimi 3 giorni → invita clienti con richiami in sospeso
  // ============================================================
  const in3Days = new Date(today); in3Days.setDate(in3Days.getDate() + 3);
  const in3DaysStr = in3Days.toISOString().split('T')[0];
  const in14Days = new Date(today); in14Days.setDate(in14Days.getDate() + 14);
  const in14DaysStr = in14Days.toISOString().split('T')[0];

  for (const clinic of allClinics) {
    try {
      if (!isAutomationEnabled(clinic, 'smartAgendaFiller')) { results.smartAgendaFiller.skipped++; continue; }

      const upcomingCount = await db.collection('appointments').countDocuments({
        clinicId: clinic.id,
        date: { $gt: todayStr, $lte: in3DaysStr },
        status: { $in: ['pending', 'confirmed'] }
      });
      const dailyCapacity = clinic.dailyCapacity || 8;
      const occupancy = upcomingCount / (dailyCapacity * 3);
      if (occupancy >= 0.5) { results.smartAgendaFiller.skipped++; continue; }

      // Candidati: pet della clinica con vaccini scaduti o in scadenza entro 14 giorni
      const clinicPets = await db.collection('pets').find({ clinicId: clinic.id }).toArray();
      if (clinicPets.length === 0) { results.smartAgendaFiller.skipped++; continue; }
      const petIds = clinicPets.map(p => p.id);
      const dueVaccines = await db.collection('vaccinations').find({
        petId: { $in: petIds },
        nextDueDate: { $lte: in14DaysStr },
        gapFillerSent: { $ne: true }
      }).limit(5).toArray();

      for (const vaccine of dueVaccines) {
        const pet = clinicPets.find(p => p.id === vaccine.petId);
        const owner = pet ? await db.collection('users').findOne({ id: pet.ownerId }) : null;
        if (owner?.email && pet) {
          const bookUrl = `${baseUrl}?action=book&clinicId=${clinic.id}&petId=${pet.id}&reason=${encodeURIComponent('Richiamo ' + (vaccine.name || 'vaccino'))}`;
          await sendEmail({
            to: owner.email,
            subject: `📅 Posti liberi questa settimana: approfittane per ${pet.name}!`,
            html: wrapEmail(`<h2 style="color:#333;">📅 Abbiamo disponibilità nei prossimi giorni!</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;"><strong>${clinic.clinicName || clinic.name}</strong> ha posti liberi nei prossimi giorni e abbiamo notato che <strong>${pet.name}</strong> ha il vaccino <strong>${vaccine.name || ''}</strong> ${new Date(vaccine.nextDueDate) < today ? 'scaduto' : 'in scadenza il ' + vaccine.nextDueDate}.</p><p style="color:#666;">Approfittane per metterti in regola senza attese!</p><div style="text-align:center;margin:25px 0;"><a href="${bookUrl}" style="display:inline-block;background:#10B981;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">📅 Prenota Subito</a></div>`)
          });
          await db.collection('vaccinations').updateOne({ id: vaccine.id }, { $set: { gapFillerSent: true, gapFillerSentAt: new Date() } });
          results.smartAgendaFiller.sent++;
        } else {
          await db.collection('vaccinations').updateOne({ id: vaccine.id }, { $set: { gapFillerSent: true } });
        }
      }
    } catch (err) { console.error('Smart agenda filler error:', err); results.smartAgendaFiller.errors++; }
  }

  // ============================================================
  // 27. FOLLOW-UP PREVENTIVI (4 giorni senza risposta)
  // ============================================================
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
  const staleEstimates = await db.collection('estimates').find({ status: 'sent', followupSent: { $ne: true } }).toArray();
  const staleByClinic = new Map();

  for (const est of staleEstimates) {
    try {
      const sentDate = est.sentAt ? new Date(est.sentAt) : (est.createdAt ? new Date(est.createdAt) : null);
      if (!sentDate || sentDate > fourDaysAgo) continue; // non ancora 4 giorni

      const clinic = clinicsMap.get(est.clinicId);
      if (!isAutomationEnabled(clinic, 'estimateFollowup')) { results.estimateFollowup.skipped++; continue; }

      const owner = est.ownerId ? await db.collection('users').findOne({ id: est.ownerId }) : null;
      if (owner?.email && clinic) {
        await sendEmail({
          to: owner.email,
          subject: `💰 Il preventivo per ${est.petName || 'il tuo animale'} ti aspetta`,
          html: wrapEmail(`<h2 style="color:#333;">💰 Hai avuto modo di vedere il preventivo?</h2><p style="color:#666;">Ciao ${owner.name || est.ownerName || ''},</p><p style="color:#666;">Qualche giorno fa <strong>${clinic.clinicName || clinic.name}</strong> ti ha inviato un preventivo:</p><div style="background:#F0F9FF;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #3B82F6;"><p style="margin:5px 0;"><strong>📋</strong> ${est.title || 'Preventivo'}</p>${est.petName ? `<p style="margin:5px 0;"><strong>🐾</strong> ${est.petName}</p>` : ''}${est.totalAmount ? `<p style="margin:5px 0;"><strong>💶</strong> €${Number(est.totalAmount).toFixed(2)}</p>` : ''}</div><p style="color:#666;">Se hai domande o vuoi discutere le opzioni, siamo a disposizione!</p><div style="text-align:center;margin:25px 0;">${getContactButton(clinic, baseUrl, 'Parliamone', `Ciao, ho ricevuto il preventivo "${est.title || ''}" e vorrei avere informazioni...`)}</div>`)
        });
        await db.collection('estimates').updateOne({ id: est.id }, { $set: { followupSent: true, followupSentAt: new Date() } });
        results.estimateFollowup.sent++;
      } else {
        // Niente email cliente: raccogli e avvisa la clinica
        if (!staleByClinic.has(est.clinicId)) staleByClinic.set(est.clinicId, []);
        staleByClinic.get(est.clinicId).push(est);
        await db.collection('estimates').updateOne({ id: est.id }, { $set: { followupSent: true, followupSentAt: new Date(), followupViaClinic: true } });
      }
    } catch (err) { console.error('Estimate follow-up error:', err); results.estimateFollowup.errors++; }
  }

  for (const [clinicId, list] of staleByClinic) {
    const clinic = clinicsMap.get(clinicId);
    if (clinic?.email && list.length > 0) {
      try {
        const rows = list.map(e => `<li><strong>${e.title || 'Preventivo'}</strong> — ${e.ownerName || 'Cliente'} ${e.petName ? `(${e.petName})` : ''} ${e.totalAmount ? `— €${Number(e.totalAmount).toFixed(2)}` : ''}</li>`).join('');
        await sendEmail({
          to: clinic.email,
          subject: `💰 ${list.length} preventivi senza risposta da 4+ giorni`,
          html: wrapEmail(`<h2 style="color:#333;">💰 Preventivi da ricontattare</h2><p style="color:#666;">Questi preventivi sono stati inviati da più di 4 giorni e non hanno ancora ricevuto risposta. Un follow-up telefonico aumenta il tasso di accettazione fino al 35%:</p><ul style="color:#666;">${rows}</ul>`)
        });
        results.estimateFollowup.clinicAlerts++;
      } catch (err) { console.error('Estimate clinic alert error:', err); }
    }
  }

  // ============================================================
  // 28. ESCALATION SOLLECITI PAGAMENTO (14gg secondo sollecito, 30gg avviso finale)
  // ============================================================
  const fourteenDaysAgoStr = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 2° sollecito a 14 giorni
  const secondReminderInvoices = await db.collection('invoices').find({
    status: 'unpaid',
    createdAt: { $lte: fourteenDaysAgoStr },
    secondReminderSent: { $ne: true }
  }).toArray();

  for (const invoice of secondReminderInvoices) {
    try {
      const clinic = clinicsMap.get(invoice.clinicId);
      if (!isAutomationEnabled(clinic, 'paymentEscalation')) { results.paymentEscalation.skipped++; continue; }
      const owner = await db.collection('users').findOne({ id: invoice.ownerId });
      if (owner?.email && clinic) {
        const payUrl = `${baseUrl}?action=payment&invoiceId=${invoice.id}`;
        await sendEmail({
          to: owner.email,
          subject: `⚠️ Secondo promemoria: fattura in sospeso - ${clinic.clinicName || clinic.name}`,
          html: wrapEmail(`<h2 style="color:#333;">⚠️ Secondo Promemoria di Pagamento</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">Ti ricordiamo che risulta ancora in sospeso il pagamento di una fattura emessa da <strong>${clinic.clinicName || clinic.name}</strong> oltre 14 giorni fa:</p><div style="background:#FEF2F2;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #EF4444;"><p style="margin:5px 0;"><strong>💶 Importo:</strong> €${invoice.amount?.toFixed(2) || '0.00'}</p><p style="margin:5px 0;"><strong>📅 Data emissione:</strong> ${invoice.createdAt}</p></div><div style="text-align:center;margin:25px 0;"><a href="${payUrl}" style="display:inline-block;background:#27AE60;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">💳 Paga Ora</a>${getContactButton(clinic, baseUrl, 'Contatta la Clinica', 'Ciao, vi contatto riguardo la fattura in sospeso...')}</div><p style="color:#999;font-size:13px;">Se hai già provveduto al pagamento, ignora questa email.</p>`)
        });
        await db.collection('invoices').updateOne({ id: invoice.id }, { $set: { secondReminderSent: true, secondReminderSentAt: new Date() } });
        results.paymentEscalation.sent++;
      }
    } catch (err) { console.error('Payment escalation 14d error:', err); results.paymentEscalation.errors++; }
  }

  // Avviso finale a 30 giorni + alert alla clinica
  const finalNoticeInvoices = await db.collection('invoices').find({
    status: 'unpaid',
    createdAt: { $lte: thirtyDaysAgoStr },
    finalNoticeSent: { $ne: true }
  }).toArray();

  const overdueByClinic = new Map();
  for (const invoice of finalNoticeInvoices) {
    try {
      const clinic = clinicsMap.get(invoice.clinicId);
      if (!isAutomationEnabled(clinic, 'paymentEscalation')) { results.paymentEscalation.skipped++; continue; }
      const owner = await db.collection('users').findOne({ id: invoice.ownerId });
      if (owner?.email && clinic) {
        const payUrl = `${baseUrl}?action=payment&invoiceId=${invoice.id}`;
        await sendEmail({
          to: owner.email,
          subject: `🚨 Avviso finale: fattura non pagata da 30+ giorni - ${clinic.clinicName || clinic.name}`,
          html: wrapEmail(`<h2 style="color:#C0392B;">🚨 Avviso Finale</h2><p style="color:#666;">Gentile ${owner.name || 'Cliente'},</p><p style="color:#666;">Nonostante i precedenti promemoria, risulta non pagata la seguente fattura emessa da <strong>${clinic.clinicName || clinic.name}</strong> da oltre 30 giorni:</p><div style="background:#FEF2F2;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #C0392B;"><p style="margin:5px 0;"><strong>💶 Importo:</strong> €${invoice.amount?.toFixed(2) || '0.00'}</p><p style="margin:5px 0;"><strong>📅 Data emissione:</strong> ${invoice.createdAt}</p></div><p style="color:#666;">Ti invitiamo a regolarizzare il pagamento al più presto o a contattare la clinica per concordare una soluzione.</p><div style="text-align:center;margin:25px 0;"><a href="${payUrl}" style="display:inline-block;background:#27AE60;color:white;padding:14px 28px;border-radius:25px;text-decoration:none;font-weight:bold;">💳 Paga Ora</a>${getContactButton(clinic, baseUrl, 'Contatta la Clinica', 'Ciao, vi contatto riguardo la fattura in sospeso...')}</div>`)
        });
        await db.collection('invoices').updateOne({ id: invoice.id }, { $set: { finalNoticeSent: true, finalNoticeSentAt: new Date() } });
        results.paymentEscalation.sent++;
        if (!overdueByClinic.has(invoice.clinicId)) overdueByClinic.set(invoice.clinicId, []);
        overdueByClinic.get(invoice.clinicId).push({ invoice, ownerName: owner.name || 'N/A' });
      }
    } catch (err) { console.error('Payment escalation 30d error:', err); results.paymentEscalation.errors++; }
  }

  for (const [clinicId, list] of overdueByClinic) {
    const clinic = clinicsMap.get(clinicId);
    if (clinic?.email && list.length > 0) {
      try {
        const totalOverdue = list.reduce((sum, x) => sum + (x.invoice.amount || 0), 0);
        const rows = list.map(x => `<li><strong>${x.ownerName}</strong> — €${x.invoice.amount?.toFixed(2) || '0.00'} (emessa il ${x.invoice.createdAt})</li>`).join('');
        await sendEmail({
          to: clinic.email,
          subject: `🚨 ${list.length} fatture non pagate da oltre 30 giorni (€${totalOverdue.toFixed(2)})`,
          html: wrapEmail(`<h2 style="color:#C0392B;">🚨 Crediti in sofferenza</h2><p style="color:#666;">Queste fatture risultano non pagate da oltre 30 giorni nonostante i solleciti automatici. Valuta un contatto diretto:</p><ul style="color:#666;">${rows}</ul><p style="color:#333;font-weight:bold;">Totale da recuperare: €${totalOverdue.toFixed(2)}</p>`)
        });
        results.paymentEscalation.clinicAlerts++;
      } catch (err) { console.error('Overdue clinic alert error:', err); }
    }
  }

  // ============================================================
  // 29. ALERT REFERTI LAB IN RITARDO (in attesa da +72h)
  // ============================================================
  const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
  const delayedRequests = await db.collection('lab_requests').find({
    status: { $nin: ['completed', 'rejected', 'cancelled', 'delivered'] },
    createdAt: { $lte: seventyTwoHoursAgo },
    delayAlertSent: { $ne: true }
  }).toArray();

  for (const req of delayedRequests) {
    try {
      const clinic = clinicsMap.get(req.clinicId);
      if (!isAutomationEnabled(clinic, 'labDelayAlert')) { results.labDelayAlert.skipped++; continue; }

      const lab = await db.collection('users').findOne({ id: req.labId });
      const hoursWaiting = Math.round((Date.now() - new Date(req.createdAt).getTime()) / (60 * 60 * 1000));
      const isUrgent = req.priority === 'urgent';

      // Avvisa il laboratorio
      if (lab?.email) {
        await sendEmail({
          to: lab.email,
          subject: `⏰ ${isUrgent ? '[URGENTE] ' : ''}Richiesta analisi in attesa da ${hoursWaiting}h - ${req.petName || 'Paziente'}`,
          html: wrapEmail(`<h2 style="color:#333;">⏰ Richiesta in attesa da ${hoursWaiting} ore</h2><p style="color:#666;">La seguente richiesta di analisi è ancora in lavorazione:</p><div style="background:#FFF7ED;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid ${isUrgent ? '#EF4444' : '#F97316'};"><p style="margin:5px 0;"><strong>🔬 Esame:</strong> ${req.examName || req.examType || 'N/A'}</p><p style="margin:5px 0;"><strong>🐾 Paziente:</strong> ${req.petName || 'N/A'}</p><p style="margin:5px 0;"><strong>🏥 Clinica:</strong> ${clinic?.clinicName || 'N/A'}</p><p style="margin:5px 0;"><strong>📦 Codice campione:</strong> ${req.sampleCode || 'N/A'}</p><p style="margin:5px 0;"><strong>⚡ Priorità:</strong> ${isUrgent ? '🔴 URGENTE' : 'Normale'}</p><p style="margin:5px 0;"><strong>📅 Richiesta il:</strong> ${new Date(req.createdAt).toLocaleDateString('it-IT')}</p></div><p style="color:#666;">Ti invitiamo ad aggiornare lo stato della richiesta o caricare il referto su VetBuddy.</p>`)
        });
      }

      // Avvisa la clinica
      if (clinic?.email) {
        await sendEmail({
          to: clinic.email,
          subject: `⏰ Referto in ritardo: ${req.examName || req.examType || 'analisi'} per ${req.petName || 'paziente'}`,
          html: wrapEmail(`<h2 style="color:#333;">⏰ Referto in attesa da ${hoursWaiting} ore</h2><p style="color:#666;">La richiesta di analisi per <strong>${req.petName || 'il paziente'}</strong> (${req.examName || req.examType || 'N/A'}) è in attesa da più di 72 ore.</p><p style="color:#666;">Il laboratorio è stato sollecitato automaticamente. Se l'esame è urgente, valuta un contatto diretto.</p>`)
        });
      }

      await db.collection('lab_requests').updateOne({ id: req.id }, { $set: { delayAlertSent: true, delayAlertSentAt: new Date() } });
      results.labDelayAlert.sent++;
    } catch (err) { console.error('Lab delay alert error:', err); results.labDelayAlert.errors++; }
  }

  return results;
}
