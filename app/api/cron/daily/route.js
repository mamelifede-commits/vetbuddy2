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
  weeklyReport: true
};

// Helper: Check if automation is enabled for a clinic
function isAutomationEnabled(clinic, automationKey) {
  const settings = clinic?.automationSettings || DEFAULT_AUTOMATION_SETTINGS;
  return settings[automationKey] !== false; // Default to true if not set
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
    weeklyReports: { sent: 0, skipped: 0 }
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

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
        // Trova il proprietario e l'animale
        const owner = await db.collection('users').findOne({ id: apt.ownerId });
        const pet = await db.collection('pets').findOne({ id: apt.petId });
        const clinic = await db.collection('users').findOne({ id: apt.clinicId });

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
        const owner = await db.collection('users').findOne({ id: apt.ownerId });
        const pet = await db.collection('pets').findOne({ id: apt.petId });
        const clinic = await db.collection('users').findOne({ id: apt.clinicId });

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
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const noShowResult = await db.collection('appointments').updateMany(
      {
        date: { $lt: yesterdayStr },
        status: { $in: ['pending', 'confirmed'] }
      },
      {
        $set: { status: 'no-show', markedNoShowAt: new Date() }
      }
    );
    results.noShow.marked = noShowResult.modifiedCount;

    // 5. REMINDER DOCUMENTI MANCANTI (per ogni clinica)
    const clinics = await db.collection('users').find({ role: 'clinic' }).toArray();
    results.documentReminders = { sent: 0 };
    
    for (const clinic of clinics) {
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
    results.weeklyReports = { sent: 0 };
    
    if (dayOfWeek === 1) { // Lunedì
      for (const clinic of clinics) {
        if (!clinic.email) continue;
        
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
