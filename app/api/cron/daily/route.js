import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { DEFAULT_AUTOMATION_SETTINGS, isAutomationEnabled, getCurrentMonth, getContactButton, getPhoneButton, getCancellationPolicyText, wrapEmail } from './cron-helpers';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// Vercel Cron Job - Eseguito ogni giorno alle 8:00
// Configura in vercel.json

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
    petBirthday: { sent: 0, errors: 0, skipped: 0 },
    reviewRequest: { sent: 0, errors: 0, skipped: 0 },
    inactiveClients: { sent: 0, errors: 0, skipped: 0 },
    antiparasitic: { sent: 0, errors: 0, skipped: 0 },
    annualCheckup: { sent: 0, errors: 0, skipped: 0 },
    appointmentConfirmation: { sent: 0, errors: 0, skipped: 0 },
    paymentReminder: { sent: 0, errors: 0, skipped: 0 },
    seasonalAlerts: { sent: 0, skipped: 0 },
    // New automations results
    sterilization: { sent: 0, errors: 0, skipped: 0 },
    seniorPetCare: { sent: 0, errors: 0, skipped: 0 },
    microchipCheck: { sent: 0, errors: 0, skipped: 0 },
    welcomeNewPet: { sent: 0, errors: 0, skipped: 0 },
    loyaltyProgram: { sent: 0, errors: 0, skipped: 0 },
    referralProgram: { sent: 0, errors: 0, skipped: 0 },
    holidayClosures: { sent: 0, skipped: 0 },
    petCondolences: { sent: 0, errors: 0, skipped: 0 },
    dailySummary: { sent: 0, errors: 0, skipped: 0 },
    staffBirthday: { sent: 0, errors: 0, skipped: 0 }
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
          // Get clinic cancellation policy
          const cancellationPolicy = clinic.cancellationPolicy || {
            hoursNotice: 24,
            fee: 0,
            message: 'Ti preghiamo di avvisarci almeno 24 ore prima in caso di disdetta.'
          };
          
          // Build cancellation URL
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
          const cancelUrl = `${baseUrl}?action=cancel&appointmentId=${apt.id}`;
          
          await sendEmail({
            to: owner.email,
            subject: `⏰ Promemoria: Appuntamento domani per ${pet.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <h2 style="color: #333;">⏰ Promemoria Appuntamento</h2>
                  <p style="color: #666; font-size: 16px;">Ciao ${owner.name || 'Proprietario'},</p>
                  <p style="color: #666; font-size: 16px;">Ti ricordiamo che <strong>${pet.name}</strong> ha un appuntamento <strong>domani</strong>:</p>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
                    <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${apt.date}</p>
                    <p style="margin: 5px 0;"><strong>🕐 Ora:</strong> ${apt.time}</p>
                    <p style="margin: 5px 0;"><strong>🏥 Clinica:</strong> ${clinic.clinicName || clinic.name}</p>
                    <p style="margin: 5px 0;"><strong>📋 Motivo:</strong> ${apt.reason || 'Visita'}</p>
                    ${clinic.address ? `<p style="margin: 5px 0;"><strong>📍 Indirizzo:</strong> ${clinic.address}</p>` : ''}
                    ${phoneNumber ? `<p style="margin: 5px 0;"><strong>📞 Telefono:</strong> ${phoneNumber}</p>` : ''}
                  </div>
                  
                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 25px 0;">
                    ${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, ho una domanda sull'appuntamento di ${pet.name} del ${apt.date}...`)}
                    <a href="${cancelUrl}" style="display: inline-block; background: #E74C3C; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      ❌ Disdici Appuntamento
                    </a>
                  </div>
                  
                  <!-- Cancellation Policy -->
                  <div style="background: #FFF3CD; padding: 15px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #FFC107;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #856404;">📋 Politica di Cancellazione</p>
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                      ${getCancellationPolicyText(clinic)}
                    </p>
                    ${cancellationPolicy.fee > 0 ? `
                    <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
                      <strong>⚠️ Nota:</strong> La mancata disdetta comporta un addebito di €${cancellationPolicy.fee.toFixed(2)}.
                    </p>
                    ` : ''}
                  </div>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
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
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
          const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}`;
          
          await sendEmail({
            to: owner.email,
            subject: `💉 Richiamo vaccino in scadenza per ${pet.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
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
                  
                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${bookUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      📅 Prenota Appuntamento
                    </a>
                    ${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, vorrei prenotare il richiamo vaccino ${vaccine.name} per ${pet.name}...`)}
                  </div>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
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
          // Get URLs and buttons
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
          const reviewUrl = clinic.googlePlaceId ? `https://g.page/r/${clinic.googlePlaceId}/review` : `${baseUrl}?action=review&clinicId=${clinic.id}`;
          const contactButton = getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, ho una domanda riguardo la visita di ${pet.name}...`);
          
          await sendEmail({
            to: owner.email,
            subject: `💚 Come sta ${pet.name} dopo la visita?`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #4CAF50, #8BC34A); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <h2 style="color: #333;">Come sta ${pet.name}?</h2>
                  <p style="color: #666; font-size: 16px;">Ciao ${owner.name || 'Proprietario'},</p>
                  <p style="color: #666; font-size: 16px;">Sono passati un paio di giorni dalla visita di <strong>${pet.name}</strong> presso <strong>${clinic.clinicName || clinic.name}</strong>.</p>
                  
                  <p style="color: #666; font-size: 16px;">Volevamo sapere come sta! Se hai domande o dubbi, non esitare a contattarci.</p>
                  
                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 30px 0;">
                    ${contactButton}
                  </div>
                  
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${reviewUrl}" style="display: inline-block; background: #FFD700; color: #333; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      ⭐ Lascia una Recensione
                    </a>
                  </div>
                  
                  <p style="color: #999; font-size: 14px; text-align: center;">Grazie per aver scelto vetbuddy! 🐾</p>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
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
          subject: `📋 ${appointmentsWithoutDocs.length} documenti da caricare - vetbuddy`,
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
          subject: `📊 Report Settimanale - ${clinic.clinicName || 'vetbuddy'}`,
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
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
          const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Controllo%20Compleanno`;
          
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
                    <p style="color: #666; font-size: 16px;">Tanti auguri da tutto il team vetbuddy!</p>
                    <p style="font-size: 48px;">🎁🐾🎈</p>
                    <p style="color: #666; font-size: 14px;">Per festeggiare, perché non prenotare un controllo di salute?</p>
                    
                    <!-- Action Buttons -->
                    <div style="margin: 25px 0;">
                      <a href="${bookUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                        🎁 Prenota Checkup Regalo
                      </a>
                      ${getContactButton(clinic, baseUrl, 'Fai gli Auguri', `Ciao! Oggi ${pet.name} compie ${age} anni! 🎂`)}
                    </div>
                  </div>
                  <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
        const bookUrl = `${baseUrl}?action=book&clinicId=${clinic.id}`;
        const reviewUrl = clinic.googlePlaceId ? `https://g.page/r/${clinic.googlePlaceId}` : `${baseUrl}?action=review&clinicId=${clinic.id}`;
        
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
                  
                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${reviewUrl}" style="display: inline-block; background: #4285F4; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      ⭐ Lascia una Recensione
                    </a>
                    <a href="${bookUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      📅 Prenota Prossima Visita
                    </a>
                    ${getContactButton(clinic, baseUrl, 'Scrivi Feedback', `Ciao, volevo condividere il mio feedback sulla visita di ${pet?.name || 'oggi'}...`)}
                  </div>
                  
                  <p style="color: #999; font-size: 12px; text-align: center;">Grazie per il tuo feedback!</p>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
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

          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
          const bookUrl = `${baseUrl}?action=book&clinicId=${clinic.id}`;

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
                    
                    <!-- Action Buttons -->
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${bookUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                        📅 Prenota Ora
                      </a>
                      ${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, vorrei prenotare un controllo...`)}
                    </div>
                  </div>
                  <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
        const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Antiparassitario`;
        
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
                  <p style="color: #666; font-size: 16px;">Ciao ${owner.name || ''},</p>
                  <p style="color: #666; font-size: 16px;">È tempo di rinnovare il trattamento antiparassitario di <strong>${pet.name}</strong>!</p>
                  <p style="color: #666; font-size: 16px;">Gli antiparassitari proteggono il tuo animale da pulci, zecche e altri parassiti.</p>
                  
                  <div style="background: #E8F5E9; padding: 15px; border-radius: 10px; margin: 20px 0;">
                    <p style="margin: 0; color: #2E7D32;"><strong>💡 Consiglio:</strong> Il trattamento andrebbe ripetuto ogni 1-3 mesi a seconda del prodotto.</p>
                  </div>
                  
                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${bookUrl}" style="display: inline-block; background: #27AE60; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      💊 Prenota Trattamento
                    </a>
                    ${getContactButton(clinic, baseUrl, 'Chiedi Info', `Ciao, ho bisogno di info sull'antiparassitario per ${pet.name}...`)}
                  </div>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
        const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Controllo%20Annuale`;
        
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
                  <p style="color: #666; font-size: 16px;">Ciao ${owner.name || ''},</p>
                  <p style="color: #666; font-size: 16px;">È passato un anno dall'ultima visita di <strong>${pet.name}</strong>!</p>
                  <p style="color: #666; font-size: 16px;">Un controllo annuale è importante per:</p>
                  <ul style="color: #666;">
                    <li>Verificare lo stato di salute generale</li>
                    <li>Aggiornare le vaccinazioni</li>
                    <li>Prevenire problemi futuri</li>
                  </ul>
                  
                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${bookUrl}" style="display: inline-block; background: #3498DB; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      📅 Prenota Controllo Annuale
                    </a>
                    ${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, vorrei prenotare il controllo annuale per ${pet.name}...`)}
                  </div>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
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
          // Get clinic cancellation policy
          const cancellationPolicy = clinic.cancellationPolicy || {
            hoursNotice: 24,
            fee: 0,
            message: 'Ti preghiamo di avvisarci almeno 24 ore prima in caso di disdetta.'
          };
          
          // Build cancellation URL with appointment ID
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
          const cancelUrl = `${baseUrl}?action=cancel&appointmentId=${apt.id}`;
          
          await sendEmail({
            to: owner.email,
            subject: `✅ Conferma appuntamento per ${pet?.name || 'il tuo animale'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">✅ Conferma Appuntamento</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <p style="color: #666; font-size: 16px;">Ciao ${owner.name || ''},</p>
                  <p style="color: #666; font-size: 16px;">Ti ricordiamo l'appuntamento tra 2 giorni:</p>
                  
                  <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
                    <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${apt.date}</p>
                    <p style="margin: 5px 0;"><strong>🕐 Ora:</strong> ${apt.time}</p>
                    <p style="margin: 5px 0;"><strong>🐾 Paziente:</strong> ${pet?.name || 'N/A'}</p>
                    <p style="margin: 5px 0;"><strong>🏥 Clinica:</strong> ${clinic.clinicName}</p>
                    ${clinic.address ? `<p style="margin: 5px 0;"><strong>📍 Indirizzo:</strong> ${clinic.address}</p>` : ''}
                  </div>
                  
                  <p style="text-align: center; font-weight: bold; color: #333; margin: 25px 0 15px;">Puoi confermare la tua presenza?</p>
                  
                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 25px 0;">
                    ${getContactButton(clinic, baseUrl, 'Conferma Presenza', `Ciao! Confermo la mia presenza all'appuntamento del ${apt.date} alle ${apt.time} per ${pet?.name || 'il mio animale'}.`)}
                    <a href="${cancelUrl}" style="display: inline-block; background: #E74C3C; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      ❌ Disdici Appuntamento
                    </a>
                  </div>
                  
                  <!-- Cancellation Policy -->
                  <div style="background: #FFF3CD; padding: 15px; border-radius: 10px; margin-top: 25px; border-left: 4px solid #FFC107;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #856404;">📋 Politica di Cancellazione</p>
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                      ${getCancellationPolicyText(clinic)}
                    </p>
                    ${cancellationPolicy.fee > 0 ? `
                    <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
                      <strong>⚠️ Nota:</strong> La mancata disdetta entro ${cancellationPolicy.hoursNotice || 24} ore comporta un addebito di €${cancellationPolicy.fee.toFixed(2)}.
                    </p>
                    ` : ''}
                  </div>
                </div>
                
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
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
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
        const payUrl = `${baseUrl}?action=payment&invoiceId=${invoice.id}`;
        
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
                  
                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${payUrl}" style="display: inline-block; background: #27AE60; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      💳 Paga Ora
                    </a>
                    ${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, ho una domanda sulla fattura €${invoice.amount?.toFixed(2) || '0'}...`)}
                  </div>
                  
                  <p style="color: #999; font-size: 12px; text-align: center;">Per qualsiasi domanda, non esitare a contattarci.</p>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
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
        
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
        const bookUrl = `${baseUrl}?action=book&clinicId=${clinic.id}`;

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
                    <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
                  </div>
                  <div style="padding: 30px; background: #f9f9f9;">
                    ${seasonalContent}
                    
                    <!-- Action Buttons -->
                    <div style="text-align: center; margin: 25px 0;">
                      <a href="${bookUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                        📅 Prenota Visita
                      </a>
                      ${getContactButton(clinic, baseUrl, 'Chiedi Consiglio', 'Ciao, avrei bisogno di un consiglio...')}
                    </div>
                    
                    <p style="color: #999; margin-top: 30px;">Dalla tua clinica di fiducia: ${clinic.clinicName}</p>
                  </div>
                  <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
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

    // =====================================================
    // NUOVE AUTOMAZIONI AVANZATE
    // =====================================================

    // 15. STERILIZZAZIONE (cuccioli/gattini 6-12 mesi non sterilizzati)
    for (const pet of allPets) {
      if (!pet.birthDate || pet.isNeutered) continue;
      
      const birthDate = new Date(pet.birthDate);
      const ageMonths = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24 * 30));
      
      if (ageMonths >= 6 && ageMonths <= 12) {
        const clinic = pet.clinicId ? clinicsMap.get(pet.clinicId) : null;
        if (clinic && !isAutomationEnabled(clinic, 'sterilizationReminder')) {
          results.sterilization.skipped++;
          continue;
        }
        
        // Controlla se già inviato
        if (pet.sterilizationReminderSent) continue;
        
        const owner = await db.collection('users').findOne({ id: pet.ownerId });
        if (owner?.email) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
          const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Sterilizzazione`;
          
          try {
            await sendEmail({
              to: owner.email,
              subject: `🐾 È il momento giusto per sterilizzare ${pet.name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #9B59B6, #8E44AD); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🐾 Consiglio Importante</h1>
                  </div>
                  <div style="padding: 30px; background: #f9f9f9;">
                    <p style="color: #666; font-size: 16px;">Ciao ${owner.name || ''},</p>
                    <p style="color: #666; font-size: 16px;"><strong>${pet.name}</strong> ha ${ageMonths} mesi - l'età ideale per la sterilizzazione!</p>
                    <h3 style="color: #333;">Perché sterilizzare?</h3>
                    <ul style="color: #666;">
                      <li>✅ Previene tumori e malattie</li>
                      <li>✅ Comportamento più equilibrato</li>
                      <li>✅ Niente cucciolate indesiderate</li>
                      <li>✅ Vita più lunga e sana</li>
                    </ul>
                    
                    <!-- Action Buttons -->
                    <div style="text-align: center; margin: 25px 0;">
                      <a href="${bookUrl}" style="display: inline-block; background: #9B59B6; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                        🏥 Prenota Consulto Sterilizzazione
                      </a>
                      ${getContactButton(clinic, baseUrl, 'Chiedi Info', `Ciao, vorrei informazioni sulla sterilizzazione di ${pet.name}...`)}
                    </div>
                    
                    <p style="color: #999; font-size: 14px; text-align: center;">Parlane con il tuo veterinario alla prossima visita!</p>
                  </div>
                  <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
                  </div>
                </div>
              `
            });
            await db.collection('pets').updateOne({ id: pet.id }, { $set: { sterilizationReminderSent: true } });
            results.sterilization.sent++;
          } catch (err) {
            results.sterilization.errors++;
          }
        }
      }
    }

    // 16. SENIOR PET CARE (animali over 7 anni - controllo semestrale)
    for (const pet of allPets) {
      if (!pet.birthDate) continue;
      
      const birthDate = new Date(pet.birthDate);
      const ageYears = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24 * 365));
      
      if (ageYears >= 7) {
        const clinic = pet.clinicId ? clinicsMap.get(pet.clinicId) : null;
        if (clinic && !isAutomationEnabled(clinic, 'seniorPetCare')) {
          results.seniorPetCare.skipped++;
          continue;
        }
        
        // Controlla ultima visita
        const lastVisit = await db.collection('appointments').findOne({
          petId: pet.id,
          status: 'completed'
        }, { sort: { date: -1 } });
        
        if (lastVisit) {
          const lastVisitDate = new Date(lastVisit.date);
          const monthsSinceVisit = Math.floor((today - lastVisitDate) / (1000 * 60 * 60 * 24 * 30));
          
          // Se sono passati 6+ mesi, invia reminder
          if (monthsSinceVisit >= 6 && !pet.seniorCheckupReminderSent) {
            const owner = await db.collection('users').findOne({ id: pet.ownerId });
            if (owner?.email) {
              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
              const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Checkup%20Senior`;
              
              try {
                await sendEmail({
                  to: owner.email,
                  subject: `👴 Checkup Senior per ${pet.name} (${ageYears} anni)`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <div style="background: linear-gradient(135deg, #3498DB, #2980B9); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">👴 Checkup Senior</h1>
                      </div>
                      <div style="padding: 30px; background: #f9f9f9;">
                        <p style="color: #666; font-size: 16px;">Ciao ${owner.name || ''},</p>
                        <p style="color: #666; font-size: 16px;"><strong>${pet.name}</strong> ha ${ageYears} anni e merita cure speciali!</p>
                        <p style="color: #666; font-size: 16px;">Per gli animali senior consigliamo:</p>
                        <ul style="color: #666;">
                          <li>🩺 Controlli ogni 6 mesi</li>
                          <li>🧪 Esami del sangue annuali</li>
                          <li>🦴 Controllo articolazioni</li>
                          <li>❤️ Monitoraggio cardiaco</li>
                        </ul>
                        
                        <!-- Action Buttons -->
                        <div style="text-align: center; margin: 25px 0;">
                          <a href="${bookUrl}" style="display: inline-block; background: #3498DB; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                            🩺 Prenota Checkup Senior
                          </a>
                          ${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, vorrei prenotare un checkup senior per ${pet.name}...`)}
                        </div>
                      </div>
                      <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                        <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
                      </div>
                    </div>
                  `
                });
                await db.collection('pets').updateOne({ id: pet.id }, { $set: { seniorCheckupReminderSent: true, seniorCheckupReminderSentAt: new Date() } });
                results.seniorPetCare.sent++;
              } catch (err) {
                results.seniorPetCare.errors++;
              }
            }
          }
        }
      }
    }

    // 17. MICROCHIP CHECK (verifica annuale)
    const microchipCheckDue = await db.collection('pets').find({
      hasMicrochip: true,
      microchipLastVerified: { $lte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      microchipReminderSent: { $ne: true }
    }).toArray();

    for (const pet of microchipCheckDue) {
      const clinic = pet.clinicId ? clinicsMap.get(pet.clinicId) : null;
      if (clinic && !isAutomationEnabled(clinic, 'microchipCheck')) {
        results.microchipCheck.skipped++;
        continue;
      }
      
      const owner = await db.collection('users').findOne({ id: pet.ownerId });
      if (owner?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
        const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&petId=${pet.id}&reason=Verifica%20Microchip`;
        const updateUrl = `${baseUrl}?action=updateMicrochip&petId=${pet.id}`;
        
        try {
          await sendEmail({
            to: owner.email,
            subject: `📍 Verifica microchip di ${pet.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1ABC9C, #16A085); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">📍 Verifica Microchip</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <p style="color: #666; font-size: 16px;">Ciao ${owner.name || ''},</p>
                  <p style="color: #666; font-size: 16px;">È passato un anno dall'ultima verifica del microchip di <strong>${pet.name}</strong>.</p>
                  <p style="color: #666; font-size: 16px;"><strong>Perché è importante?</strong></p>
                  <ul style="color: #666;">
                    <li>📞 I tuoi dati di contatto sono ancora corretti?</li>
                    <li>📍 L'indirizzo è aggiornato?</li>
                    <li>✅ Il chip funziona correttamente?</li>
                  </ul>
                  <p style="color: #666; font-size: 16px;">Una verifica rapida può fare la differenza se ${pet.name} si perde!</p>
                  
                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${bookUrl}" style="display: inline-block; background: #1ABC9C; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      📍 Prenota Verifica Microchip
                    </a>
                    <a href="${updateUrl}" style="display: inline-block; background: #3498DB; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      ✏️ Aggiorna Dati Online
                    </a>
                  </div>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
                </div>
              </div>
            `
          });
          await db.collection('pets').updateOne({ id: pet.id }, { $set: { microchipReminderSent: true } });
          results.microchipCheck.sent++;
        } catch (err) {
          results.microchipCheck.errors++;
        }
      }
    }

    // 18. WELCOME NEW PET (nuovi clienti registrati negli ultimi 3 giorni)
    const threeDaysAgoWelcome = new Date();
    threeDaysAgoWelcome.setDate(threeDaysAgoWelcome.getDate() - 3);
    
    const newClients = await db.collection('users').find({
      role: 'owner',
      createdAt: { $gte: threeDaysAgoWelcome, $lte: today },
      welcomeEmailSent: { $ne: true }
    }).toArray();

    for (const client of newClients) {
      // Find associated clinic
      const clientClinic = await db.collection('clinic_clients').findOne({ ownerId: client.id });
      const clinic = clientClinic ? clinicsMap.get(clientClinic.clinicId) : null;
      
      if (clinic && !isAutomationEnabled(clinic, 'welcomeNewPet')) {
        results.welcomeNewPet.skipped++;
        continue;
      }
      
      if (client.email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
        const bookUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}`;
        const exploreUrl = baseUrl;
        
        try {
          await sendEmail({
            to: client.email,
            subject: `🎉 Benvenuto in ${clinic?.clinicName || 'vetbuddy'}!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">🎉 Benvenuto!</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <p style="color: #666; font-size: 16px;">Ciao ${client.name || ''},</p>
                  <p style="color: #666; font-size: 16px;">Siamo felicissimi di averti con noi! 🐾</p>
                  <h3 style="color: #333;">Cosa puoi fare con vetbuddy:</h3>
                  <ul style="color: #666;">
                    <li>📅 Prenotare appuntamenti online</li>
                    <li>📄 Ricevere documenti e referti</li>
                    <li>💬 Chattare con la clinica</li>
                    <li>🔔 Ricevere promemoria automatici</li>
                    <li>🎁 Ricevere premi fedeltà</li>
                  </ul>
                  
                  <!-- Action Buttons -->
                  <div style="text-align: center; margin: 25px 0;">
                    <a href="${bookUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      📅 Prenota Prima Visita
                    </a>
                    <a href="${exploreUrl}" style="display: inline-block; background: #3498DB; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                      🔍 Esplora vetbuddy
                    </a>
                  </div>
                  
                  <p style="font-size: 24px; text-align: center;">🐕 🐈 🐰</p>
                </div>
                <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
                </div>
              </div>
            `
          });
          await db.collection('users').updateOne({ id: client.id }, { $set: { welcomeEmailSent: true } });
          results.welcomeNewPet.sent++;
        } catch (err) {
          results.welcomeNewPet.errors++;
        }
      }
    }

    // 19. PROGRAMMA FEDELTÀ (dopo 5 visite completate)
    for (const clinic of allClinics) {
      if (!isAutomationEnabled(clinic, 'loyaltyProgram')) {
        results.loyaltyProgram.skipped++;
        continue;
      }

      const clientVisitCounts = await db.collection('appointments').aggregate([
        { $match: { clinicId: clinic.id, status: 'completed' } },
        { $group: { _id: '$ownerId', visitCount: { $sum: 1 } } },
        { $match: { visitCount: { $in: [5, 10, 20] } } }
      ]).toArray();

      for (const clientStats of clientVisitCounts) {
        const owner = await db.collection('users').findOne({ 
          id: clientStats._id, 
          [`loyaltyMilestone${clientStats.visitCount}Sent`]: { $ne: true }
        });
        
        if (owner?.email) {
          const discount = clientStats.visitCount === 5 ? '10%' : clientStats.visitCount === 10 ? '15%' : '20%';
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
          const rewardsUrl = `${baseUrl}?action=rewards`;
          
          try {
            await sendEmail({
              to: owner.email,
              subject: `🏆 Hai raggiunto ${clientStats.visitCount} visite! Ecco il tuo premio`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #F39C12, #E74C3C); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🏆 Traguardo Raggiunto!</h1>
                  </div>
                  <div style="padding: 30px; background: #f9f9f9; text-align: center;">
                    <p style="font-size: 48px; margin: 0;">🎉</p>
                    <h2 style="color: #333;">${clientStats.visitCount} visite con noi!</h2>
                    <p style="color: #666;">Per ringraziarti della tua fedeltà, ecco un regalo:</p>
                    <div style="background: #27AE60; color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                      <p style="font-size: 32px; font-weight: bold; margin: 0;">${discount} DI SCONTO</p>
                      <p style="margin: 5px 0;">sulla prossima visita</p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div style="margin: 25px 0;">
                      <a href="${rewardsUrl}" style="display: inline-block; background: #F39C12; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                        🎁 Vedi i Miei Premi
                      </a>
                      ${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao! Ho raggiunto ${clientStats.visitCount} visite e vorrei usare il mio sconto!`)}
                    </div>
                    
                    <p style="color: #999; font-size: 12px;">Mostra questa email alla prossima visita!</p>
                  </div>
                  <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
                  </div>
                </div>
              `
            });
            await db.collection('users').updateOne(
              { id: clientStats._id }, 
              { $set: { [`loyaltyMilestone${clientStats.visitCount}Sent`]: true } }
            );
            results.loyaltyProgram.sent++;
          } catch (err) {
            results.loyaltyProgram.errors++;
          }
        }
      }
    }

    // 20. CHIUSURE FESTIVE (7 giorni prima di Natale, Pasqua, Ferragosto)
    const upcomingHolidays = [];
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() + 7);
    const checkMonth = checkDate.getMonth() + 1;
    const checkDay = checkDate.getDate();

    // Natale
    if (checkMonth === 12 && checkDay >= 24 && checkDay <= 26) {
      upcomingHolidays.push({ name: 'Natale', dates: '24-26 Dicembre' });
    }
    // Ferragosto
    if (checkMonth === 8 && checkDay >= 14 && checkDay <= 16) {
      upcomingHolidays.push({ name: 'Ferragosto', dates: '14-16 Agosto' });
    }

    if (upcomingHolidays.length > 0) {
      for (const clinic of allClinics) {
        if (!isAutomationEnabled(clinic, 'holidayClosures')) {
          results.holidayClosures.skipped++;
          continue;
        }

        const clinicClients = await db.collection('clinic_clients').find({ clinicId: clinic.id }).toArray();
        for (const cc of clinicClients) {
          const owner = await db.collection('users').findOne({ id: cc.ownerId });
          if (owner?.email) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
            const bookUrl = `${baseUrl}?action=book&clinicId=${clinic.id}`;
            
            await sendEmail({
              to: owner.email,
              subject: `🏖️ Chiusura ${upcomingHolidays[0].name} - ${clinic.clinicName}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #E74C3C, #C0392B); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">🏖️ Avviso Chiusura</h1>
                  </div>
                  <div style="padding: 30px; background: #f9f9f9;">
                    <p>Ciao ${owner.name || ''},</p>
                    <p>Ti informiamo che <strong>${clinic.clinicName}</strong> sarà chiusa per <strong>${upcomingHolidays[0].name}</strong>.</p>
                    <p><strong>Date:</strong> ${upcomingHolidays[0].dates}</p>
                    <p>Per emergenze durante la chiusura, contatta il pronto soccorso veterinario più vicino.</p>
                    
                    <!-- Action Buttons -->
                    <div style="text-align: center; margin: 25px 0;">
                      <a href="${bookUrl}" style="display: inline-block; background: #27AE60; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                        📅 Prenota Prima/Dopo
                      </a>
                      ${getContactButton(clinic, baseUrl, 'Scrivi alla Clinica', `Ciao, ho bisogno di info sulle chiusure festive...`)}
                      ${getPhoneButton(clinic, true)}
                    </div>
                    
                    <p>Ti auguriamo buone feste! 🎉</p>
                  </div>
                  <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy - La piattaforma per la salute dei tuoi animali</p>
                  </div>
                </div>
              `
            });
            results.holidayClosures.sent++;
          }
        }
      }
    }

    // 21. CONDOGLIANZE PET (se un pet viene segnato come deceduto)
    const deceasedPets = await db.collection('pets').find({
      status: 'deceased',
      deceasedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      condolencesSent: { $ne: true }
    }).toArray();

    for (const pet of deceasedPets) {
      const clinic = pet.clinicId ? clinicsMap.get(pet.clinicId) : null;
      if (clinic && !isAutomationEnabled(clinic, 'petCondolences')) {
        results.petCondolences.skipped++;
        continue;
      }

      const owner = await db.collection('users').findOne({ id: pet.ownerId });
      if (owner?.email) {
        try {
          await sendEmail({
            to: owner.email,
            subject: `💔 Le nostre più sentite condoglianze per ${pet.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #5D6D7E, #34495E); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">💔 Con profondo affetto</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <p>Caro/a ${owner.name || ''},</p>
                  <p>Abbiamo appreso con grande tristezza della perdita di <strong>${pet.name}</strong>.</p>
                  <p>Sappiamo quanto fosse speciale per te e quanto dolore stai provando in questo momento.</p>
                  <p>${pet.name} è stato fortunato/a ad avere un proprietario così amorevole, e i momenti che avete condiviso rimarranno per sempre nel tuo cuore.</p>
                  <p>Ti siamo vicini in questo momento difficile.</p>
                  <p style="font-style: italic; color: #666;">"Non sei più al mio fianco, ma sei per sempre nel mio cuore."</p>
                  <p>Con affetto,<br>Il team di ${clinic?.clinicName || 'vetbuddy'}</p>
                  <p style="font-size: 24px; text-align: center;">🌈🐾</p>
                </div>
              </div>
            `
          });
          await db.collection('pets').updateOne({ id: pet.id }, { $set: { condolencesSent: true } });
          results.petCondolences.sent++;
        } catch (err) {
          results.petCondolences.errors++;
        }
      }
    }

    // 22. DAILY SUMMARY (riepilogo serale per la clinica - solo se è sera)
    const currentHour = today.getHours();
    if (currentHour >= 18 && currentHour <= 20) {
      for (const clinic of allClinics) {
        if (!isAutomationEnabled(clinic, 'dailySummary') || !clinic.email) {
          results.dailySummary.skipped++;
          continue;
        }

        // Calcola statistiche del giorno
        const todayApts = await db.collection('appointments').find({
          clinicId: clinic.id,
          date: todayStr
        }).toArray();

        const todayMessages = await db.collection('messages').countDocuments({
          clinicId: clinic.id,
          createdAt: { $gte: new Date(todayStr) }
        });

        const stats = {
          totalApts: todayApts.length,
          completed: todayApts.filter(a => a.status === 'completed').length,
          noShow: todayApts.filter(a => a.status === 'no-show').length,
          messages: todayMessages
        };

        try {
          await sendEmail({
            to: clinic.email,
            subject: `📊 Riepilogo di oggi - ${todayStr}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">📊 Riepilogo Giornaliero</h1>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                  <h2>${todayStr}</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 15px; background: white; text-align: center; border-radius: 10px;">
                        <strong style="font-size: 28px; color: #3498DB;">${stats.totalApts}</strong><br>Appuntamenti
                      </td>
                      <td style="padding: 15px; background: white; text-align: center; border-radius: 10px;">
                        <strong style="font-size: 28px; color: #27AE60;">${stats.completed}</strong><br>Completati
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px; background: white; text-align: center; border-radius: 10px;">
                        <strong style="font-size: 28px; color: #E74C3C;">${stats.noShow}</strong><br>No-show
                      </td>
                      <td style="padding: 15px; background: white; text-align: center; border-radius: 10px;">
                        <strong style="font-size: 28px; color: #9B59B6;">${stats.messages}</strong><br>Messaggi
                      </td>
                    </tr>
                  </table>
                  <p style="text-align: center; margin-top: 20px; color: #666;">Buon riposo! A domani 💪</p>
                </div>
              </div>
            `
          });
          results.dailySummary.sent++;
        } catch (err) {
          results.dailySummary.errors++;
        }
      }
    }

    // 23. STAFF BIRTHDAY (compleanni del team)
    for (const clinic of allClinics) {
      if (!isAutomationEnabled(clinic, 'staffBirthday')) {
        results.staffBirthday.skipped++;
        continue;
      }

      const staff = await db.collection('staff').find({ clinicId: clinic.id }).toArray();
      for (const member of staff) {
        if (!member.birthDate) continue;
        
        const birthDate = new Date(member.birthDate);
        if (birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay) {
          // Invia email a tutta la clinica
          if (clinic.email) {
            try {
              await sendEmail({
                to: clinic.email,
                subject: `🎂 Oggi è il compleanno di ${member.name}!`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #FF6B6B, #FFE66D); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                      <h1 style="color: white; margin: 0;">🎂 Buon Compleanno!</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9; text-align: center;">
                      <h2>${member.name}</h2>
                      <p style="font-size: 48px;">🎉🎁🎈</p>
                      <p>Ricordati di fargli/le gli auguri oggi!</p>
                    </div>
                  </div>
                `
              });
              results.staffBirthday.sent++;
            } catch (err) {
              results.staffBirthday.errors++;
            }
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
