import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';

// Vercel Cron Job - Eseguito ogni giorno alle 8:00
// Configura in vercel.json

// Default settings for clinics without custom configuration
const DEFAULT_AUTOMATION_SETTINGS = {
  appointmentReminders: true,
  vaccineRecalls: true,
  postVisitFollowup: true,
  noShowDetection: true,
  documentReminders: true,
  weeklyReport: true,
  petBirthday: true,
  reviewRequest: true,
  inactiveClientReactivation: true,
  antiparasiticReminder: true,
  annualCheckup: true,
  medicationRefill: true,
  weightAlert: true,
  dentalHygiene: true,
  appointmentConfirmation: true,
  labResultsReady: true,
  paymentReminder: true,
  postSurgeryFollowup: true,
  summerHeatAlert: true,
  tickSeasonAlert: true,
  newYearFireworksAlert: true
};

// Helper: Check if automation is enabled for a clinic
function isAutomationEnabled(clinic, automationKey) {
  const settings = clinic?.automationSettings || DEFAULT_AUTOMATION_SETTINGS;
  return settings[automationKey] !== false; // Default to true if not set
}

// Helper: Get current month (1-12)
function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

export async function GET(request) {
  // Verifica che sia una richiesta cron autorizzata
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development, permetti senza auth
    if (process.env.NODE_ENV === 'production' && !process.env.CRON_SECRET) {
      console.log('Cron job running without auth (CRON_SECRET not set)');
    }
  }

  const results = {
    promemoria: { sent: 0, errors: 0, skipped: 0 },
    richiamiVaccini: { sent: 0, errors: 0, skipped: 0 },
    followUp: { sent: 0, errors: 0, skipped: 0 },
    noShow: { marked: 0, skipped: 0 },
    documentReminders: { sent: 0, skipped: 0 },
    weeklyReports: { sent: 0, skipped: 0 },
    // New automations
    petBirthday: { sent: 0, errors: 0, skipped: 0 },
    reviewRequest: { sent: 0, errors: 0, skipped: 0 },
    inactiveClients: { sent: 0, errors: 0, skipped: 0 },
    antiparasitic: { sent: 0, errors: 0, skipped: 0 },
    annualCheckup: { sent: 0, errors: 0, skipped: 0 },
    appointmentConfirmation: { sent: 0, errors: 0, skipped: 0 },
    paymentReminder: { sent: 0, errors: 0, skipped: 0 },
    seasonalAlerts: { sent: 0, skipped: 0 }
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentMonth = getCurrentMonth();

  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
    // Pre-load all clinics for settings lookup
    const allClinics = await db.collection('users').find({ role: 'clinic' }).toArray();
    const clinicsMap = new Map(allClinics.map(c => [c.id, c]));

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
        // Check if clinic has this automation enabled
        const clinic = clinicsMap.get(apt.clinicId);
        if (!isAutomationEnabled(clinic, 'appointmentReminders')) {
          results.promemoria.skipped++;
          continue;
        }

        // Trova il proprietario e l'animale
        const owner = await db.collection('users').findOne({ id: apt.ownerId });
        const pet = await db.collection('pets').findOne({ id: apt.petId });

        if (owner?.email && pet && clinic) {
          await sendEmail({
            to: owner.email,
            subject: `⏰ Promemoria: Appuntamento domani per ${pet.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">🐾 VetBuddy</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <h2 style="color: #333;">Promemoria Appuntamento</h2>
                  <p style="color: #666; font-size: 16px;">Ciao ${owner.name || 'Proprietario'},</p>
                  <p style="color: #666; font-size: 16px;">Ti ricordiamo che <strong>${pet.name}</strong> ha un appuntamento domani:</p>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
                    <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${apt.date}</p>
                    <p style="margin: 5px 0;"><strong>🕐 Ora:</strong> ${apt.time}</p>
                    <p style="margin: 5px 0;"><strong>🏥 Clinica:</strong> ${clinic.clinicName || clinic.name}</p>
                    <p style="margin: 5px 0;"><strong>📋 Motivo:</strong> ${apt.reason || 'Visita'}</p>
                  </div>
                  
                  <p style="color: #666; font-size: 14px;">Se non puoi presentarti, ti preghiamo di avvisare la clinica il prima possibile.</p>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 VetBuddy - La piattaforma per la salute dei tuoi animali</p>
                </div>
              </div>
            `
          });

          // Segna come inviato
          await db.collection('appointments').updateOne(
            { id: apt.id },
            { $set: { reminderSent: true, reminderSentAt: new Date() } }
          );
          results.promemoria.sent++;
        }
      } catch (err) {
        console.error('Error sending reminder:', err);
        results.promemoria.errors++;
      }
    }

    // 2. RICHIAMO VACCINI (30 giorni prima della scadenza)
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    const in30DaysStr = in30Days.toISOString().split('T')[0];

    const vaccinesExpiring = await db.collection('vaccinations').find({
      nextDueDate: { $lte: in30DaysStr },
      reminderSent: { $ne: true },
      status: 'active'
    }).toArray();

    for (const vaccine of vaccinesExpiring) {
      try {
        const pet = await db.collection('pets').findOne({ id: vaccine.petId });
        
        // Check if clinic has this automation enabled
        const clinic = pet?.clinicId ? clinicsMap.get(pet.clinicId) : null;
        if (clinic && !isAutomationEnabled(clinic, 'vaccineRecalls')) {
          results.richiamiVaccini.skipped++;
          continue;
        }
        
        const owner = pet ? await db.collection('users').findOne({ id: pet.ownerId }) : null;

        if (owner?.email && pet) {
          await sendEmail({
            to: owner.email,
            subject: `💉 Richiamo vaccino in scadenza per ${pet.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">🐾 VetBuddy</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <h2 style="color: #333;">⚠️ Richiamo Vaccino in Scadenza</h2>
                  <p style="color: #666; font-size: 16px;">Ciao ${owner.name || 'Proprietario'},</p>
                  <p style="color: #666; font-size: 16px;">Il vaccino <strong>${vaccine.name}</strong> di <strong>${pet.name}</strong> è in scadenza:</p>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FFA500;">
                    <p style="margin: 5px 0;"><strong>💉 Vaccino:</strong> ${vaccine.name}</p>
                    <p style="margin: 5px 0;"><strong>📅 Scadenza:</strong> ${vaccine.nextDueDate}</p>
                    <p style="margin: 5px 0;"><strong>🐾 Animale:</strong> ${pet.name}</p>
                  </div>
                  
                  <p style="color: #666; font-size: 16px;">Ti consigliamo di prenotare un appuntamento per il richiamo.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://vetbuddy.it" style="background: #FF6B6B; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">Prenota Appuntamento</a>
                  </div>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 VetBuddy - La piattaforma per la salute dei tuoi animali</p>
                </div>
              </div>
            `
          });

          await db.collection('vaccinations').updateOne(
            { id: vaccine.id },
            { $set: { reminderSent: true, reminderSentAt: new Date() } }
          );
          results.richiamiVaccini.sent++;
        }
      } catch (err) {
        console.error('Error sending vaccine reminder:', err);
        results.richiamiVaccini.errors++;
      }
    }

    // 3. FOLLOW-UP POST VISITA (48h dopo)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    const completedAppointments = await db.collection('appointments').find({
      date: twoDaysAgoStr,
      status: 'completed',
      followUpSent: { $ne: true }
    }).toArray();

    for (const apt of completedAppointments) {
      try {
        // Check if clinic has this automation enabled
        const clinic = clinicsMap.get(apt.clinicId);
        if (!isAutomationEnabled(clinic, 'postVisitFollowup')) {
          results.followUp.skipped++;
          continue;
        }

        const owner = await db.collection('users').findOne({ id: apt.ownerId });
        const pet = await db.collection('pets').findOne({ id: apt.petId });

        if (owner?.email && pet && clinic) {
          await sendEmail({
            to: owner.email,
            subject: `💚 Come sta ${pet.name} dopo la visita?`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #4CAF50, #8BC34A); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">🐾 VetBuddy</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <h2 style="color: #333;">Come sta ${pet.name}?</h2>
                  <p style="color: #666; font-size: 16px;">Ciao ${owner.name || 'Proprietario'},</p>
                  <p style="color: #666; font-size: 16px;">Sono passati un paio di giorni dalla visita di <strong>${pet.name}</strong> presso <strong>${clinic.clinicName || clinic.name}</strong>.</p>
                  
                  <p style="color: #666; font-size: 16px;">Volevamo sapere come sta! Se hai domande o dubbi, non esitare a contattare la clinica.</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://vetbuddy.it" style="background: #4CAF50; color: white; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">Contatta la Clinica</a>
                  </div>
                  
                  <p style="color: #999; font-size: 14px; text-align: center;">Grazie per aver scelto VetBuddy! 🐾</p>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 VetBuddy - La piattaforma per la salute dei tuoi animali</p>
                </div>
              </div>
            `
          });

          await db.collection('appointments').updateOne(
            { id: apt.id },
            { $set: { followUpSent: true, followUpSentAt: new Date() } }
          );
          results.followUp.sent++;
        }
      } catch (err) {
        console.error('Error sending follow-up:', err);
        results.followUp.errors++;
      }
    }

    // 4. NO-SHOW DETECTION (appuntamenti passati non completati)
    // Process per clinic to respect individual settings
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let totalNoShowMarked = 0;
    let totalNoShowSkipped = 0;

    for (const clinic of allClinics) {
      if (!isAutomationEnabled(clinic, 'noShowDetection')) {
        totalNoShowSkipped++;
        continue;
      }

      const noShowResult = await db.collection('appointments').updateMany(
        {
          clinicId: clinic.id,
          date: { $lt: yesterdayStr },
          status: { $in: ['pending', 'confirmed'] }
        },
        {
          $set: { status: 'no-show', markedNoShowAt: new Date() }
        }
      );
      totalNoShowMarked += noShowResult.modifiedCount;
    }
    results.noShow.marked = totalNoShowMarked;
    results.noShow.skipped = totalNoShowSkipped;

    // 5. REMINDER DOCUMENTI MANCANTI (per ogni clinica)
    
    for (const clinic of allClinics) {
      // Check if this automation is enabled for the clinic
      if (!isAutomationEnabled(clinic, 'documentReminders')) {
        results.documentReminders.skipped++;
        continue;
      }

      const appointmentsWithoutDocs = await db.collection('appointments').find({
        clinicId: clinic.id,
        status: 'completed',
        hasDocuments: { $ne: true },
        documentReminderSent: { $ne: true },
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
      }).toArray();

      if (appointmentsWithoutDocs.length > 0 && clinic.email) {
        // Invia reminder
        const reminderList = await Promise.all(appointmentsWithoutDocs.map(async (apt) => {
          const pet = await db.collection('pets').findOne({ id: apt.petId });
          return `${pet?.name || 'Paziente'} - ${apt.reason || 'Visita'} (${apt.date})`;
        }));

        await sendEmail({
          to: clinic.email,
          subject: `📋 ${appointmentsWithoutDocs.length} documenti da caricare - VetBuddy`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #FF9800, #FFB74D); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">📋 Documenti Mancanti</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <p>Ciao ${clinic.clinicName || 'Team'},</p>
                <p>Ci sono <strong>${appointmentsWithoutDocs.length} visite completate</strong> senza documenti:</p>
                <ul>${reminderList.map(r => `<li>${r}</li>`).join('')}</ul>
                <p>Ricordati di caricare referti e prescrizioni.</p>
              </div>
            </div>
          `
        });

        // Segna come inviati
        for (const apt of appointmentsWithoutDocs) {
          await db.collection('appointments').updateOne(
            { id: apt.id },
            { $set: { documentReminderSent: true } }
          );
        }
        results.documentReminders.sent++;
      }
    }

    // 6. REPORT SETTIMANALE (ogni lunedì)
    const dayOfWeek = today.getDay();
    
    if (dayOfWeek === 1) { // Lunedì
      for (const clinic of allClinics) {
        if (!clinic.email) continue;
        
        // Check if this automation is enabled for the clinic
        if (!isAutomationEnabled(clinic, 'weeklyReport')) {
          results.weeklyReports.skipped++;
          continue;
        }
        
        // Calcola statistiche settimanali
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        
        const weeklyApts = await db.collection('appointments').find({
          clinicId: clinic.id,
          date: { $gte: weekAgoStr, $lte: todayStr }
        }).toArray();

        const stats = {
          total: weeklyApts.length,
          completed: weeklyApts.filter(a => a.status === 'completed').length,
          noShow: weeklyApts.filter(a => a.status === 'no-show').length
        };

        const noShowRate = stats.total > 0 ? Math.round((stats.noShow / stats.total) * 100) : 0;

        await sendEmail({
          to: clinic.email,
          subject: `📊 Report Settimanale - ${clinic.clinicName || 'VetBuddy'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">📊 Report Settimanale</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2>Ciao ${clinic.clinicName || 'Team'}!</h2>
                <p>Ecco il riepilogo della settimana:</p>
                <table style="width: 100%; margin: 20px 0;">
                  <tr>
                    <td style="padding: 15px; background: white; text-align: center; border-radius: 10px;">
                      <strong style="font-size: 28px;">${stats.total}</strong><br>Appuntamenti
                    </td>
                    <td style="padding: 15px; background: white; text-align: center; border-radius: 10px;">
                      <strong style="font-size: 28px; color: #4CAF50;">${stats.completed}</strong><br>Completati
                    </td>
                    <td style="padding: 15px; background: white; text-align: center; border-radius: 10px;">
                      <strong style="font-size: 28px; color: ${noShowRate > 20 ? '#f44336' : '#666'};">${noShowRate}%</strong><br>No-show
                    </td>
                  </tr>
                </table>
                ${noShowRate > 20 ? '<p style="color: #f44336;">⚠️ Il tasso di no-show è alto. Valuta promemoria aggiuntivi.</p>' : '<p style="color: #4CAF50;">✅ Ottimo lavoro questa settimana!</p>'}
              </div>
            </div>
          `
        });
        results.weeklyReports.sent++;
      }
    }

    // =====================================================
    // NUOVE AUTOMAZIONI
    // =====================================================

    // 7. COMPLEANNO PET (auguri il giorno del compleanno)
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    
    const allPets = await db.collection('pets').find({}).toArray();
    
    for (const pet of allPets) {
      if (!pet.birthDate) continue;
      
      const birthDate = new Date(pet.birthDate);
      if (birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay) {
        const clinic = pet.clinicId ? clinicsMap.get(pet.clinicId) : null;
        if (clinic && !isAutomationEnabled(clinic, 'petBirthday')) {
          results.petBirthday.skipped++;
          continue;
        }
        
        const owner = await db.collection('users').findOne({ id: pet.ownerId });
        if (owner?.email) {
          const age = today.getFullYear() - birthDate.getFullYear();
          try {
            await sendEmail({
              to: owner.email,
              subject: `🎂 Buon compleanno ${pet.name}! 🐾`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #FF6B6B, #FFE66D); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 32px;">🎂 Buon Compleanno! 🎉</h1>
                  </div>
                  <div style="padding: 30px; background: #f9f9f9; text-align: center;">
                    <h2 style="color: #333;">${pet.name} compie ${age} anni oggi!</h2>
                    <p style="color: #666; font-size: 16px;">Tanti auguri da tutto il team VetBuddy!</p>
                    <p style="font-size: 48px;">🎁🐾🎈</p>
                    <p style="color: #999; font-size: 14px;">Per festeggiare, perché non prenotare un controllo di salute?</p>
                  </div>
                </div>
              `
            });
            results.petBirthday.sent++;
          } catch (err) {
            results.petBirthday.errors++;
          }
        }
      }
    }

    // 8. RICHIESTA RECENSIONE (3 giorni dopo visita completata positiva)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];

    const recentCompletedApts = await db.collection('appointments').find({
      date: threeDaysAgoStr,
      status: 'completed',
      reviewRequestSent: { $ne: true }
    }).toArray();

    for (const apt of recentCompletedApts) {
      const clinic = clinicsMap.get(apt.clinicId);
      if (!isAutomationEnabled(clinic, 'reviewRequest')) {
        results.reviewRequest.skipped++;
        continue;
      }

      const owner = await db.collection('users').findOne({ id: apt.ownerId });
      const pet = await db.collection('pets').findOne({ id: apt.petId });
      
      if (owner?.email && clinic) {
        try {
          await sendEmail({
            to: owner.email,
            subject: `⭐ Come è andata la visita di ${pet?.name || 'il tuo animale'}?`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">⭐ La tua opinione conta!</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <p style="color: #666;">Ciao ${owner.name || ''},</p>
                  <p style="color: #666;">Come è andata la visita di <strong>${pet?.name || 'il tuo animale'}</strong> presso <strong>${clinic.clinicName}</strong>?</p>
                  <p style="color: #666;">Se ti sei trovato bene, lasciaci una recensione! Aiuterà altri proprietari a trovare una clinica di fiducia.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://g.page/r/${clinic.googlePlaceId || 'review'}" style="background: #4285F4; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; display: inline-block;">⭐ Lascia una recensione</a>
                  </div>
                  <p style="color: #999; font-size: 12px; text-align: center;">Grazie per il tuo feedback!</p>
                </div>
              </div>
            `
          });
          await db.collection('appointments').updateOne({ id: apt.id }, { $set: { reviewRequestSent: true } });
          results.reviewRequest.sent++;
        } catch (err) {
          results.reviewRequest.errors++;
        }
      }
    }

    // 9. RIATTIVAZIONE CLIENTI INATTIVI (non visitano da 6+ mesi)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

    // Esegui solo il 1° del mese per non spammare
    if (today.getDate() === 1) {
      for (const clinic of allClinics) {
        if (!isAutomationEnabled(clinic, 'inactiveClientReactivation')) {
          results.inactiveClients.skipped++;
          continue;
        }

        // Trova clienti che non hanno appuntamenti negli ultimi 6 mesi
        const recentApts = await db.collection('appointments').find({
          clinicId: clinic.id,
          date: { $gte: sixMonthsAgoStr }
        }).toArray();
        const activeOwnerIds = new Set(recentApts.map(a => a.ownerId));

        const allClinicApts = await db.collection('appointments').find({ clinicId: clinic.id }).toArray();
        const allOwnerIds = new Set(allClinicApts.map(a => a.ownerId));
        
        for (const ownerId of allOwnerIds) {
          if (activeOwnerIds.has(ownerId)) continue;
          
          const owner = await db.collection('users').findOne({ id: ownerId, reactivationSent: { $ne: true } });
          if (!owner?.email) continue;

          try {
            await sendEmail({
              to: owner.email,
              subject: `🐾 Ci manchi! È tempo di un controllo?`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #9B59B6, #E74C3C); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🐾 Ci manchi!</h1>
                  </div>
                  <div style="padding: 30px; background: #f9f9f9;">
                    <p>Ciao ${owner.name || ''},</p>
                    <p>È passato un po' di tempo dalla tua ultima visita presso <strong>${clinic.clinicName}</strong>.</p>
                    <p>I controlli regolari sono importanti per la salute del tuo animale. Prenota una visita!</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://vetbuddy.it" style="background: #FF6B6B; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">Prenota Ora</a>
                    </div>
                  </div>
                </div>
              `
            });
            await db.collection('users').updateOne({ id: ownerId }, { $set: { reactivationSent: true, reactivationSentAt: new Date() } });
            results.inactiveClients.sent++;
          } catch (err) {
            results.inactiveClients.errors++;
          }
        }
      }
    }

    // 10. ANTIPARASSITARI (ogni 3 mesi dalla data dell'ultimo trattamento)
    const antiparasiticDue = await db.collection('treatments').find({
      type: 'antiparasitic',
      nextDueDate: { $lte: todayStr },
      reminderSent: { $ne: true }
    }).toArray();

    for (const treatment of antiparasiticDue) {
      const pet = await db.collection('pets').findOne({ id: treatment.petId });
      const clinic = pet?.clinicId ? clinicsMap.get(pet.clinicId) : null;
      
      if (clinic && !isAutomationEnabled(clinic, 'antiparasiticReminder')) {
        results.antiparasitic.skipped++;
        continue;
      }

      const owner = pet ? await db.collection('users').findOne({ id: pet.ownerId }) : null;
      if (owner?.email) {
        try {
          await sendEmail({
            to: owner.email,
            subject: `🐜 Promemoria antiparassitario per ${pet.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #27AE60, #2ECC71); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">🛡️ Protezione Antiparassitaria</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <p>Ciao ${owner.name || ''},</p>
                  <p>È tempo di rinnovare il trattamento antiparassitario di <strong>${pet.name}</strong>!</p>
                  <p>Gli antiparassitari proteggono il tuo animale da pulci, zecche e altri parassiti.</p>
                  <div style="background: #E8F5E9; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>💡 Consiglio:</strong> Il trattamento andrebbe ripetuto ogni 1-3 mesi a seconda del prodotto.</p>
                  </div>
                </div>
              </div>
            `
          });
          await db.collection('treatments').updateOne({ id: treatment.id }, { $set: { reminderSent: true } });
          results.antiparasitic.sent++;
        } catch (err) {
          results.antiparasitic.errors++;
        }
      }
    }

    // 11. CONTROLLO ANNUALE (1 anno dall'ultima visita)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];
    const oneYearAgoEnd = new Date(oneYearAgo);
    oneYearAgoEnd.setDate(oneYearAgoEnd.getDate() + 7); // Finestra di 7 giorni

    const annualCheckupApts = await db.collection('appointments').find({
      date: { $gte: oneYearAgoStr, $lte: oneYearAgoEnd.toISOString().split('T')[0] },
      status: 'completed',
      annualReminderSent: { $ne: true }
    }).toArray();

    for (const apt of annualCheckupApts) {
      const clinic = clinicsMap.get(apt.clinicId);
      if (!isAutomationEnabled(clinic, 'annualCheckup')) {
        results.annualCheckup.skipped++;
        continue;
      }

      const owner = await db.collection('users').findOne({ id: apt.ownerId });
      const pet = await db.collection('pets').findOne({ id: apt.petId });

      if (owner?.email && pet) {
        try {
          await sendEmail({
            to: owner.email,
            subject: `📅 È passato un anno! Controllo per ${pet.name}?`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #3498DB, #2980B9); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">📅 Controllo Annuale</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <p>Ciao ${owner.name || ''},</p>
                  <p>È passato un anno dall'ultima visita di <strong>${pet.name}</strong>!</p>
                  <p>Un controllo annuale è importante per:</p>
                  <ul>
                    <li>Verificare lo stato di salute generale</li>
                    <li>Aggiornare le vaccinazioni</li>
                    <li>Prevenire problemi futuri</li>
                  </ul>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://vetbuddy.it" style="background: #3498DB; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">Prenota Controllo</a>
                  </div>
                </div>
              </div>
            `
          });
          await db.collection('appointments').updateOne({ id: apt.id }, { $set: { annualReminderSent: true } });
          results.annualCheckup.sent++;
        } catch (err) {
          results.annualCheckup.errors++;
        }
      }
    }

    // 12. CONFERMA APPUNTAMENTO (48h prima)
    const in2Days = new Date();
    in2Days.setDate(in2Days.getDate() + 2);
    const in2DaysStr = in2Days.toISOString().split('T')[0];

    const appointmentsToConfirm = await db.collection('appointments').find({
      date: in2DaysStr,
      status: 'pending',
      confirmationRequestSent: { $ne: true }
    }).toArray();

    for (const apt of appointmentsToConfirm) {
      const clinic = clinicsMap.get(apt.clinicId);
      if (!isAutomationEnabled(clinic, 'appointmentConfirmation')) {
        results.appointmentConfirmation.skipped++;
        continue;
      }

      const owner = await db.collection('users').findOne({ id: apt.ownerId });
      const pet = await db.collection('pets').findOne({ id: apt.petId });

      if (owner?.email && clinic) {
        try {
          await sendEmail({
            to: owner.email,
            subject: `✅ Conferma appuntamento per ${pet?.name || 'il tuo animale'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">✅ Conferma Appuntamento</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <p>Ciao ${owner.name || ''},</p>
                  <p>Ti ricordiamo l'appuntamento tra 2 giorni:</p>
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
                    <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${apt.date}</p>
                    <p style="margin: 5px 0;"><strong>🕐 Ora:</strong> ${apt.time}</p>
                    <p style="margin: 5px 0;"><strong>🐾 Paziente:</strong> ${pet?.name || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>🏥 Clinica:</strong> ${clinic.clinicName}</p>
                  </div>
                  <p style="text-align: center; font-weight: bold;">Puoi confermare la tua presenza?</p>
                  <p style="color: #999; font-size: 12px; text-align: center;">Se non puoi venire, contatta la clinica per disdire.</p>
                </div>
              </div>
            `
          });
          await db.collection('appointments').updateOne({ id: apt.id }, { $set: { confirmationRequestSent: true } });
          results.appointmentConfirmation.sent++;
        } catch (err) {
          results.appointmentConfirmation.errors++;
        }
      }
    }

    // 13. REMINDER PAGAMENTO (fatture non pagate dopo 7 giorni)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const unpaidInvoices = await db.collection('invoices').find({
      status: 'unpaid',
      createdAt: { $lte: sevenDaysAgoStr },
      paymentReminderSent: { $ne: true }
    }).toArray();

    for (const invoice of unpaidInvoices) {
      const clinic = clinicsMap.get(invoice.clinicId);
      if (!isAutomationEnabled(clinic, 'paymentReminder')) {
        results.paymentReminder.skipped++;
        continue;
      }

      const owner = await db.collection('users').findOne({ id: invoice.ownerId });
      if (owner?.email && clinic) {
        try {
          await sendEmail({
            to: owner.email,
            subject: `💳 Promemoria pagamento - ${clinic.clinicName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #E74C3C, #C0392B); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">💳 Promemoria Pagamento</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <p>Ciao ${owner.name || ''},</p>
                  <p>Ti ricordiamo che hai una fattura in sospeso:</p>
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p><strong>Importo:</strong> €${invoice.amount?.toFixed(2) || '0.00'}</p>
                    <p><strong>Data:</strong> ${invoice.createdAt}</p>
                    <p><strong>Clinica:</strong> ${clinic.clinicName}</p>
                  </div>
                  <p>Per qualsiasi domanda, contatta la clinica.</p>
                </div>
              </div>
            `
          });
          await db.collection('invoices').updateOne({ id: invoice.id }, { $set: { paymentReminderSent: true } });
          results.paymentReminder.sent++;
        } catch (err) {
          results.paymentReminder.errors++;
        }
      }
    }

    // 14. ALERT STAGIONALI
    // Caldo estivo: Giugno-Agosto
    // Zecche: Marzo-Maggio  
    // Capodanno: Ultima settimana di Dicembre

    let seasonalType = null;
    let seasonalSubject = '';
    let seasonalContent = '';

    if (currentMonth >= 6 && currentMonth <= 8 && today.getDate() === 1) {
      seasonalType = 'summerHeatAlert';
      seasonalSubject = '☀️ Consigli per proteggere il tuo animale dal caldo';
      seasonalContent = `
        <h2>☀️ Estate: Proteggi il tuo animale dal caldo!</h2>
        <ul>
          <li>🚗 Non lasciare MAI il tuo animale in auto</li>
          <li>💧 Acqua fresca sempre disponibile</li>
          <li>🕐 Passeggiate nelle ore più fresche</li>
          <li>🏠 Zone d'ombra durante il giorno</li>
          <li>🐾 Attenzione all'asfalto bollente sulle zampe</li>
        </ul>
      `;
    } else if (currentMonth >= 3 && currentMonth <= 5 && today.getDate() === 1) {
      seasonalType = 'tickSeasonAlert';
      seasonalSubject = '🦟 Stagione zecche: Proteggi il tuo animale!';
      seasonalContent = `
        <h2>🦟 È iniziata la stagione delle zecche!</h2>
        <p>Con l'arrivo della primavera, le zecche tornano attive. Ecco cosa fare:</p>
        <ul>
          <li>💊 Applica regolarmente l'antiparassitario</li>
          <li>🔍 Controlla il pelo dopo ogni passeggiata</li>
          <li>🌿 Evita erba alta e zone boschive</li>
          <li>⚠️ Rimuovi le zecche con pinzette apposite</li>
        </ul>
      `;
    } else if (currentMonth === 12 && today.getDate() >= 27) {
      seasonalType = 'newYearFireworksAlert';
      seasonalSubject = '🎆 Capodanno: Come gestire lo stress da botti';
      seasonalContent = `
        <h2>🎆 Capodanno in arrivo: Prepara il tuo animale!</h2>
        <p>I fuochi d'artificio possono spaventare molto gli animali. Ecco come aiutarli:</p>
        <ul>
          <li>🏠 Crea un rifugio sicuro e tranquillo in casa</li>
          <li>🔇 Chiudi finestre e tapparelle</li>
          <li>🎵 Musica o TV per mascherare i rumori</li>
          <li>🤗 Resta calmo, il tuo stress si trasmette</li>
          <li>💊 Chiedi al veterinario per ansiolitici naturali</li>
          <li>📍 Assicurati che il microchip sia aggiornato</li>
        </ul>
      `;
    }

    if (seasonalType) {
      for (const clinic of allClinics) {
        if (!isAutomationEnabled(clinic, seasonalType)) {
          results.seasonalAlerts.skipped++;
          continue;
        }

        // Trova tutti i proprietari della clinica
        const clinicApts = await db.collection('appointments').find({ clinicId: clinic.id }).toArray();
        const ownerIds = [...new Set(clinicApts.map(a => a.ownerId))];

        for (const ownerId of ownerIds) {
          const owner = await db.collection('users').findOne({ id: ownerId });
          if (!owner?.email) continue;

          try {
            await sendEmail({
              to: owner.email,
              subject: seasonalSubject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🐾 VetBuddy</h1>
                  </div>
                  <div style="padding: 30px; background: #f9f9f9;">
                    ${seasonalContent}
                    <p style="color: #999; margin-top: 30px;">Dalla tua clinica di fiducia: ${clinic.clinicName}</p>
                  </div>
                </div>
              `
            });
            results.seasonalAlerts.sent++;
          } catch (err) {
            // Ignora errori singoli per alert massivi
          }
        }
      }
    }

    console.log('Daily cron completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Daily automation completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
