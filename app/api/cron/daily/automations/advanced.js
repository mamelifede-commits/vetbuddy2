import { isAutomationEnabled, getContactButton, wrapEmail } from '../cron-helpers';

// Automazioni Avanzate: Briefing, Anti-Spreco, Piani Salute, Fidelizzazione, Terapie, Report Lab
export async function runAdvancedAutomations({ db, clinicsMap, allClinics, allPets, today, todayStr, results, sendEmail }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';

  // Helper per idempotenza giornaliera/periodica
  async function flagExists(ownerId, type, period) {
    return await db.collection('automation_daily_flags').findOne({ ownerId, type, period });
  }
  async function setFlag(ownerId, type, period) {
    await db.collection('automation_daily_flags').updateOne(
      { ownerId, type, period },
      { $set: { ownerId, type, period, createdAt: new Date() } },
      { upsert: true }
    );
  }

  // ============================================================
  // 30. BRIEFING MATTUTINO
  // Email alla clinica con agenda del giorno e priorità operative
  // ============================================================
  for (const clinic of allClinics) {
    try {
      if (!isAutomationEnabled(clinic, 'morningBriefing') || !clinic.email) { results.morningBriefing.skipped++; continue; }
      if (await flagExists(clinic.id, 'morningBriefing', todayStr)) { results.morningBriefing.skipped++; continue; }

      const todayApts = await db.collection('appointments')
        .find({ clinicId: clinic.id, date: todayStr, status: { $in: ['pending', 'confirmed'] } })
        .sort({ time: 1 }).toArray();
      const riskyToday = todayApts.filter(a => a.noShowRisk === 'high');

      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
      const staleEstimates = (await db.collection('estimates').find({ clinicId: clinic.id, status: 'sent' }).toArray())
        .filter(e => { const d = e.sentAt ? new Date(e.sentAt) : (e.createdAt ? new Date(e.createdAt) : null); return d && d <= fourDaysAgo; });

      const unpaidInvoices = await db.collection('invoices').find({ clinicId: clinic.id, status: 'unpaid' }).toArray();
      const unpaidTotal = unpaidInvoices.reduce((s, i) => s + (i.amount || 0), 0);

      const clinicPetIds = allPets.filter(p => p.clinicId === clinic.id).map(p => p.id);
      const in7Days = new Date(today); in7Days.setDate(in7Days.getDate() + 7);
      const in7DaysStr = in7Days.toISOString().split('T')[0];
      const vaccinesDue = clinicPetIds.length > 0
        ? await db.collection('vaccinations').countDocuments({ petId: { $in: clinicPetIds }, nextDueDate: { $lte: in7DaysStr } })
        : 0;

      // Invia solo se c'è qualcosa di rilevante
      if (todayApts.length === 0 && staleEstimates.length === 0 && unpaidInvoices.length === 0 && vaccinesDue === 0) {
        results.morningBriefing.skipped++; continue;
      }

      const aptRows = todayApts.slice(0, 12).map(a => `<tr><td style="padding:6px;border-bottom:1px solid #eee;"><strong>${a.time || '--'}</strong></td><td style="padding:6px;border-bottom:1px solid #eee;">${a.petName || 'Paziente'}</td><td style="padding:6px;border-bottom:1px solid #eee;">${a.reason || 'Visita'}</td><td style="padding:6px;border-bottom:1px solid #eee;">${a.noShowRisk === 'high' ? '⚠️ Rischio no-show' : '✅'}</td></tr>`).join('');

      await sendEmail({
        to: clinic.email,
        subject: `☀️ Briefing del giorno: ${todayApts.length} appuntamenti${riskyToday.length > 0 ? `, ${riskyToday.length} a rischio` : ''}`,
        html: wrapEmail(`<h2 style="color:#333;">☀️ Buongiorno ${clinic.clinicName || 'Team'}!</h2><p style="color:#666;">Ecco la tua giornata in 30 secondi:</p>${todayApts.length > 0 ? `<h3 style="color:#333;">📅 Appuntamenti di oggi (${todayApts.length})</h3><table style="width:100%;border-collapse:collapse;margin:10px 0;">${aptRows}</table>${todayApts.length > 12 ? `<p style="color:#999;font-size:13px;">...e altri ${todayApts.length - 12}</p>` : ''}` : '<p style="color:#666;">📅 Nessun appuntamento oggi: ottima giornata per i richiami!</p>'}<h3 style="color:#333;">📌 Priorità</h3><ul style="color:#666;">${riskyToday.length > 0 ? `<li>⚠️ <strong>${riskyToday.length} appuntamenti a rischio no-show</strong>: valuta una chiamata di conferma</li>` : ''}${staleEstimates.length > 0 ? `<li>💰 <strong>${staleEstimates.length} preventivi</strong> senza risposta da 4+ giorni</li>` : ''}${unpaidInvoices.length > 0 ? `<li>💳 <strong>${unpaidInvoices.length} fatture non pagate</strong> (€${unpaidTotal.toFixed(2)})</li>` : ''}${vaccinesDue > 0 ? `<li>💉 <strong>${vaccinesDue} vaccini in scadenza</strong> entro 7 giorni tra i tuoi pazienti</li>` : ''}${riskyToday.length === 0 && staleEstimates.length === 0 && unpaidInvoices.length === 0 && vaccinesDue === 0 ? '<li>✅ Nessuna priorità critica. Buon lavoro!</li>' : ''}</ul>`)
      });
      await setFlag(clinic.id, 'morningBriefing', todayStr);
      results.morningBriefing.sent++;
    } catch (err) { console.error('Morning briefing error:', err); results.morningBriefing.errors++; }
  }

  // ============================================================
  // 31. ALERT CALO PRENOTAZIONI (lunedì)
  // Confronta la settimana appena chiusa con la media delle 4 precedenti
  // ============================================================
  if (today.getDay() === 1) {
    const last7 = new Date(today); last7.setDate(last7.getDate() - 7);
    const last7Str = last7.toISOString().split('T')[0];
    const prev28 = new Date(today); prev28.setDate(prev28.getDate() - 35);
    const prev28Str = prev28.toISOString().split('T')[0];

    for (const clinic of allClinics) {
      try {
        if (!isAutomationEnabled(clinic, 'bookingDropAlert') || !clinic.email) { results.bookingDropAlert.skipped++; continue; }
        if (await flagExists(clinic.id, 'bookingDropAlert', todayStr)) { results.bookingDropAlert.skipped++; continue; }

        const currentWeek = await db.collection('appointments').countDocuments({ clinicId: clinic.id, date: { $gte: last7Str, $lt: todayStr } });
        const prev4Weeks = await db.collection('appointments').countDocuments({ clinicId: clinic.id, date: { $gte: prev28Str, $lt: last7Str } });
        const avgWeek = prev4Weeks / 4;

        if (avgWeek >= 3 && currentWeek < avgWeek * 0.7) {
          const dropPct = Math.round((1 - currentWeek / avgWeek) * 100);
          await sendEmail({
            to: clinic.email,
            subject: `📉 Prenotazioni in calo del ${dropPct}% la scorsa settimana`,
            html: wrapEmail(`<h2 style="color:#C0392B;">📉 Calo prenotazioni rilevato</h2><p style="color:#666;">La scorsa settimana hai avuto <strong>${currentWeek} appuntamenti</strong>, contro una media di <strong>${avgWeek.toFixed(1)}/settimana</strong> nelle 4 settimane precedenti (<strong>-${dropPct}%</strong>).</p><h3 style="color:#333;">💡 Azioni consigliate</h3><ul style="color:#666;"><li>✅ Verifica che il <strong>Riempi-Agenda Intelligente</strong> sia attivo (invita automaticamente i clienti con richiami in sospeso)</li><li>📲 Lancia una campagna di riattivazione clienti dormienti dall'Autopilot Settimanale</li><li>⭐ Chiedi recensioni ai clienti recenti per aumentare la visibilità</li></ul>`)
          });
          await setFlag(clinic.id, 'bookingDropAlert', todayStr);
          results.bookingDropAlert.sent++;
        } else {
          results.bookingDropAlert.skipped++;
        }
      } catch (err) { console.error('Booking drop alert error:', err); results.bookingDropAlert.errors++; }
    }
  } else {
    results.bookingDropAlert.skipped += allClinics.length;
  }

  // ============================================================
  // 32. ALERT SCADENZE MAGAZZINO (anti-spreco)
  // Prodotti in scadenza entro 60 giorni → usali prima o promuovili
  // ============================================================
  const in60Days = new Date(today); in60Days.setDate(in60Days.getDate() + 60);
  const in60DaysISO = in60Days.toISOString();
  const todayISO = today.toISOString();
  const expiringItems = await db.collection('inventory').find({
    expiryDate: { $lte: in60DaysISO, $gte: todayISO },
    quantity: { $gt: 0 },
    expiryAlertSent: { $ne: true }
  }).toArray();

  const expiringByClinic = new Map();
  for (const item of expiringItems) {
    if (!expiringByClinic.has(item.clinicId)) expiringByClinic.set(item.clinicId, []);
    expiringByClinic.get(item.clinicId).push(item);
  }
  for (const [clinicId, items] of expiringByClinic) {
    try {
      const clinic = clinicsMap.get(clinicId);
      if (!isAutomationEnabled(clinic, 'expiryStockAlert') || !clinic?.email) { results.expiryStockAlert.skipped++; continue; }
      const totalValue = items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);
      const rows = items.map(i => {
        const days = Math.ceil((new Date(i.expiryDate) - today) / (24 * 60 * 60 * 1000));
        return `<tr><td style="padding:6px;border-bottom:1px solid #eee;">${i.name}</td><td style="padding:6px;border-bottom:1px solid #eee;">${i.quantity} pz</td><td style="padding:6px;border-bottom:1px solid #eee;color:${days <= 30 ? '#E74C3C' : '#F39C12'};font-weight:bold;">${days} giorni</td><td style="padding:6px;border-bottom:1px solid #eee;">${i.lot || i.lotNumber || '-'}</td></tr>`;
      }).join('');
      await sendEmail({
        to: clinic.email,
        subject: `♻️ ${items.length} prodotti in scadenza entro 60 giorni (€${totalValue.toFixed(2)} a rischio)`,
        html: wrapEmail(`<h2 style="color:#333;">♻️ Anti-Spreco: prodotti in scadenza</h2><p style="color:#666;">Questi articoli del magazzino scadono entro 60 giorni. Usali in via prioritaria o crea una promozione mirata per non sprecarli:</p><table style="width:100%;border-collapse:collapse;margin:15px 0;"><tr style="background:#F9F9F9;"><th style="padding:6px;text-align:left;">Prodotto</th><th style="padding:6px;text-align:left;">Quantità</th><th style="padding:6px;text-align:left;">Scade tra</th><th style="padding:6px;text-align:left;">Lotto</th></tr>${rows}</table><p style="color:#333;font-weight:bold;">Valore a rischio: €${totalValue.toFixed(2)}</p><p style="color:#999;font-size:13px;">💡 Suggerimento: abbina i vaccini in scadenza ai pazienti con richiami dovuti tramite il Riempi-Agenda Intelligente.</p>`)
      });
      for (const item of items) {
        await db.collection('inventory').updateOne({ id: item.id }, { $set: { expiryAlertSent: true, expiryAlertSentAt: new Date() } });
      }
      results.expiryStockAlert.sent++;
    } catch (err) { console.error('Expiry stock alert error:', err); results.expiryStockAlert.errors++; }
  }

  // ============================================================
  // 33. RINNOVO PIANI SALUTE (30 giorni prima della scadenza)
  // ============================================================
  const in30Days = new Date(today); in30Days.setDate(in30Days.getDate() + 30);
  const activeAssignments = await db.collection('health_plan_assignments').find({
    status: 'active',
    renewalReminderSent: { $ne: true }
  }).toArray();

  for (const assignment of activeAssignments) {
    try {
      const clinic = clinicsMap.get(assignment.clinicId);
      if (!isAutomationEnabled(clinic, 'healthPlanRenewal')) { results.healthPlanRenewal.skipped++; continue; }

      const plan = await db.collection('health_plans').findOne({ id: assignment.planId });
      const duration = plan?.durationMonths || 12;
      const expiry = new Date(assignment.startDate);
      expiry.setMonth(expiry.getMonth() + duration);

      if (expiry < today || expiry > in30Days) continue; // non in finestra di rinnovo

      const owner = await db.collection('users').findOne({ id: assignment.ownerId });
      const pet = await db.collection('pets').findOne({ id: assignment.petId });
      if (owner?.email && clinic) {
        const expiryStr = expiry.toLocaleDateString('it-IT');
        await sendEmail({
          to: owner.email,
          subject: `🛡️ Il piano salute di ${pet?.name || 'il tuo animale'} scade il ${expiryStr}`,
          html: wrapEmail(`<h2 style="color:#333;">🛡️ Piano Salute in scadenza</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">Il piano salute <strong>${plan?.name || ''}</strong> di <strong>${pet?.name || 'il tuo animale'}</strong> presso <strong>${clinic.clinicName || clinic.name}</strong> scadrà il <strong>${expiryStr}</strong>.</p><p style="color:#666;">Rinnovandolo continuerai a garantire cure programmate e risparmio sulle visite. Contatta la clinica per il rinnovo!</p><div style="text-align:center;margin:25px 0;">${getContactButton(clinic, baseUrl, 'Rinnova il Piano', `Ciao, vorrei rinnovare il piano salute "${plan?.name || ''}" di ${pet?.name || 'il mio animale'}...`)}</div>`)
        });
        await db.collection('health_plan_assignments').updateOne({ id: assignment.id }, { $set: { renewalReminderSent: true, renewalReminderSentAt: new Date() } });
        results.healthPlanRenewal.sent++;
      }
    } catch (err) { console.error('Health plan renewal error:', err); results.healthPlanRenewal.errors++; }
  }

  // ============================================================
  // 34. COMPLEANNO PROPRIETARIO
  // ============================================================
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  const currentYear = today.getFullYear();
  const ownersWithBirthday = await db.collection('users').find({
    role: 'owner',
    birthDate: { $exists: true, $nin: [null, ''] }
  }).toArray();

  for (const owner of ownersWithBirthday) {
    try {
      const bd = new Date(owner.birthDate);
      if (bd.getMonth() + 1 !== todayMonth || bd.getDate() !== todayDay) continue;
      if (owner.lastBirthdayEmailYear === currentYear) { results.ownerBirthday.skipped++; continue; }

      const clientLink = await db.collection('clinic_clients').findOne({ ownerId: owner.id });
      const clinic = clientLink ? clinicsMap.get(clientLink.clinicId) : null;
      if (clinic && !isAutomationEnabled(clinic, 'ownerBirthday')) { results.ownerBirthday.skipped++; continue; }

      if (owner.email) {
        await sendEmail({
          to: owner.email,
          subject: `🎉 Tanti auguri ${owner.name || ''}! 🐾`,
          html: wrapEmail(`<div style="text-align:center;"><h2 style="color:#333;">🎉 Buon Compleanno!</h2><p style="color:#666;">Caro/a ${owner.name || 'amico/a degli animali'},</p><p style="color:#666;">Tanti auguri di buon compleanno da ${clinic ? `tutto il team di <strong>${clinic.clinicName || clinic.name}</strong>` : 'tutto il team VetBuddy'}! 🎂</p><p style="font-size:42px;margin:15px 0;">🎁🐾🎈</p><p style="color:#666;">Grazie per la cura e l'amore che dedichi ogni giorno ai tuoi animali.</p></div>`)
        });
        await db.collection('users').updateOne({ id: owner.id }, { $set: { lastBirthdayEmailYear: currentYear } });
        results.ownerBirthday.sent++;
      }
    } catch (err) { console.error('Owner birthday error:', err); results.ownerBirthday.errors++; }
  }

  // ============================================================
  // 35. PROMEMORIA TERAPIE ATTIVE (2 giorni dopo l'emissione)
  // ============================================================
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const activePrescriptions = await db.collection('prescriptions').find({
    status: { $in: ['EMITTED', 'REGISTERED_MANUALLY'] },
    visibleToOwner: true,
    therapyReminderSent: { $ne: true },
    issueDate: { $lte: twoDaysAgo, $gte: thirtyDaysAgo }
  }).toArray();

  for (const prescription of activePrescriptions) {
    try {
      const clinic = clinicsMap.get(prescription.clinicId);
      if (!isAutomationEnabled(clinic, 'therapyReminder')) { results.therapyReminder.skipped++; continue; }
      const owner = prescription.ownerId ? await db.collection('users').findOne({ id: prescription.ownerId }) : null;
      if (owner?.email) {
        const items = await db.collection('prescription_items').find({ prescriptionId: prescription.id }).toArray();
        const medsList = items.length > 0
          ? `<ul style="color:#666;">${items.map(i => `<li><strong>${i.medicationName || i.name || 'Farmaco'}</strong>${i.dosage ? ` — ${i.dosage}` : ''}${i.frequency ? ` (${i.frequency})` : ''}</li>`).join('')}</ul>`
          : '';
        await sendEmail({
          to: owner.email,
          subject: `💊 Come procede la terapia di ${prescription.petName || 'il tuo animale'}?`,
          html: wrapEmail(`<h2 style="color:#333;">💊 Promemoria Terapia</h2><p style="color:#666;">Ciao ${owner.name || ''},</p><p style="color:#666;">Qualche giorno fa è stata prescritta una terapia per <strong>${prescription.petName || 'il tuo animale'}</strong>. Ricordati di seguire le somministrazioni indicate:</p>${medsList}<p style="color:#666;">Seguire la terapia con costanza è fondamentale per la guarigione. Se noti effetti indesiderati o hai dubbi, contatta subito la clinica.</p>${clinic ? `<div style="text-align:center;margin:25px 0;">${getContactButton(clinic, baseUrl, 'Ho una domanda', `Ciao, ho una domanda sulla terapia di ${prescription.petName || 'il mio animale'}...`)}</div>` : ''}`)
        });
        await db.collection('prescriptions').updateOne({ id: prescription.id }, { $set: { therapyReminderSent: true, therapyReminderSentAt: new Date() } });
        results.therapyReminder.sent++;
      } else {
        await db.collection('prescriptions').updateOne({ id: prescription.id }, { $set: { therapyReminderSent: true } });
        results.therapyReminder.skipped++;
      }
    } catch (err) { console.error('Therapy reminder error:', err); results.therapyReminder.errors++; }
  }

  // ============================================================
  // 36. REPORT MENSILE LABORATORI (1° del mese)
  // ============================================================
  if (today.getDate() === 1) {
    const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
    const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);
    const periodKey = `${prevMonthStart.getFullYear()}-${String(prevMonthStart.getMonth() + 1).padStart(2, '0')}`;
    const monthName = prevMonthStart.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

    const allLabs = await db.collection('users').find({ role: 'lab' }).toArray();
    for (const lab of allLabs) {
      try {
        if (!isAutomationEnabled(lab, 'labMonthlyReport') || !lab.email) { results.labMonthlyReport.skipped++; continue; }
        if (await flagExists(lab.id, 'labMonthlyReport', periodKey)) { results.labMonthlyReport.skipped++; continue; }

        const monthRequests = await db.collection('lab_requests').find({
          labId: lab.id,
          createdAt: { $gte: prevMonthStart.toISOString(), $lte: prevMonthEnd.toISOString() }
        }).toArray();
        if (monthRequests.length === 0) { results.labMonthlyReport.skipped++; continue; }

        const completed = monthRequests.filter(r => r.status === 'completed' || r.status === 'delivered');
        const urgent = monthRequests.filter(r => r.priority === 'urgent').length;
        const avgHours = completed.length > 0
          ? Math.round(completed.reduce((s, r) => s + (new Date(r.updatedAt) - new Date(r.createdAt)), 0) / completed.length / (60 * 60 * 1000))
          : 0;

        const byClinic = new Map();
        for (const r of monthRequests) { byClinic.set(r.clinicId, (byClinic.get(r.clinicId) || 0) + 1); }
        const topClinics = [...byClinic.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
          .map(([cId, count]) => `<li><strong>${clinicsMap.get(cId)?.clinicName || 'Clinica'}</strong>: ${count} richieste</li>`).join('');

        await sendEmail({
          to: lab.email,
          subject: `📊 Report mensile ${monthName}: ${monthRequests.length} richieste gestite`,
          html: wrapEmail(`<h2 style="color:#333;">📊 Il tuo mese in numeri — ${monthName}</h2><table style="width:100%;border-collapse:separate;border-spacing:8px;margin:15px 0;"><tr><td style="padding:15px;background:#F0F9FF;text-align:center;border-radius:10px;"><strong style="font-size:26px;color:#3498DB;">${monthRequests.length}</strong><br/>Richieste ricevute</td><td style="padding:15px;background:#F0FDF4;text-align:center;border-radius:10px;"><strong style="font-size:26px;color:#27AE60;">${completed.length}</strong><br/>Completate</td></tr><tr><td style="padding:15px;background:#FFF7ED;text-align:center;border-radius:10px;"><strong style="font-size:26px;color:#F39C12;">${avgHours}h</strong><br/>Tempo medio risposta</td><td style="padding:15px;background:#FEF2F2;text-align:center;border-radius:10px;"><strong style="font-size:26px;color:#E74C3C;">${urgent}</strong><br/>Urgenze</td></tr></table>${topClinics ? `<h3 style="color:#333;">🏥 Cliniche più attive</h3><ol style="color:#666;">${topClinics}</ol>` : ''}<p style="color:#999;font-size:13px;">💡 Tempi di risposta rapidi aumentano le richieste dalle cliniche collegate.</p>`)
        });
        await setFlag(lab.id, 'labMonthlyReport', periodKey);
        results.labMonthlyReport.sent++;
      } catch (err) { console.error('Lab monthly report error:', err); results.labMonthlyReport.errors++; }
    }
  } else {
    results.labMonthlyReport.skipped++;
  }

  return results;
}
