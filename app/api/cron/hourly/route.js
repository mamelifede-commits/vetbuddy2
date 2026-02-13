import { NextResponse } from 'next/server';
import { getCollection } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// Resend API for sending emails
async function sendEmail({ to, subject, html }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VetBuddy <noreply@vetbuddy.it>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// Generate reminder email HTML
function generateReminderEmail(appointment, clinic, timeUntil) {
  const formattedDate = new Date(appointment.date).toLocaleDateString('it-IT', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const isVideoConsult = appointment.type === 'online' || appointment.type === 'videoconsulto' || appointment.videoLink;
  const reminderType = timeUntil === '24h' ? '24 ore' : '1 ora';
  const urgencyColor = timeUntil === '1h' ? '#ef4444' : '#f59e0b';
  
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, ${urgencyColor}, ${timeUntil === '1h' ? '#dc2626' : '#d97706'}); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Promemoria Appuntamento</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 18px;">Tra ${reminderType}!</p>
      </div>
      
      <div style="padding: 32px;">
        <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #64748b; font-size: 14px;">🐕 Paziente</span><br/>
                <strong style="font-size: 18px; color: #1e293b;">${appointment.petName}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #64748b; font-size: 14px;">🏥 Clinica</span><br/>
                <strong style="font-size: 16px; color: #1e293b;">${clinic?.clinicName || 'Clinica Veterinaria'}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #64748b; font-size: 14px;">📅 Data e ora</span><br/>
                <strong style="font-size: 18px; color: #10B981;">${formattedDate}</strong><br/>
                <strong style="font-size: 28px; color: #1e293b;">🕐 ${appointment.time}</strong>
              </td>
            </tr>
          </table>
        </div>

        ${isVideoConsult && appointment.videoLink ? `
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
          <h3 style="color: white; margin: 0 0 12px; font-size: 18px;">🎥 Video Consulto</h3>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 16px;">
            ${timeUntil === '1h' ? 'Il tuo appuntamento inizia tra poco!' : 'Preparati per il tuo video consulto di domani'}
          </p>
          <a href="${appointment.videoLink}" target="_blank" style="display: inline-block; background: white; color: #6366f1; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">
            📹 Entra nel Video Consulto
          </a>
          ${timeUntil === '1h' ? `
          <p style="color: rgba(255,255,255,0.9); font-size: 12px; margin: 16px 0 0;">
            💡 Assicurati di avere una buona connessione internet e un ambiente tranquillo
          </p>
          ` : ''}
        </div>
        ` : `
        <div style="background: #f0fdf4; border-left: 4px solid #10B981; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-size: 14px; color: #166534;">
            <strong>📍 Dove:</strong> ${clinic?.address || clinic?.clinicName || 'Presso la clinica'}
            ${clinic?.phone ? `<br/><strong>📞 Tel:</strong> ${clinic.phone}` : ''}
          </p>
        </div>
        `}

        ${timeUntil === '1h' ? `
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>⚠️ Importante:</strong> L'appuntamento inizia tra ${reminderType}. Non dimenticare!
          </p>
        </div>
        ` : ''}
        
        <p style="color: #64748b; font-size: 14px; text-align: center;">
          Per modifiche o cancellazioni, contatta la clinica il prima possibile.
        </p>
      </div>
      
      <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          Email inviata automaticamente da VetBuddy<br/>
          <a href="https://vetbuddy.it" style="color: #FF6B6B;">vetbuddy.it</a>
        </p>
      </div>
    </div>
  `;
}

export async function GET(request) {
  // Verify cron secret for security (optional but recommended)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow in development or if no secret is set
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const results = {
    timestamp: new Date().toISOString(),
    reminders24h: { sent: 0, failed: 0, skipped: 0 },
    reminders1h: { sent: 0, failed: 0, skipped: 0 },
    errors: []
  };

  try {
    const appointments = await getCollection('appointments');
    const users = await getCollection('users');
    
    const now = new Date();
    
    // Calculate time windows
    const in24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // 23 hours from now
    const in24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);   // 25 hours from now
    const in1hStart = new Date(now.getTime() + 45 * 60 * 1000);       // 45 minutes from now
    const in1hEnd = new Date(now.getTime() + 75 * 60 * 1000);         // 75 minutes from now

    // Get all confirmed appointments
    const allAppointments = await appointments.find({
      status: { $in: ['confirmed', 'pending'] }
    }).toArray();

    console.log(`[CRON Hourly] Found ${allAppointments.length} appointments to check`);

    for (const appt of allAppointments) {
      try {
        // Parse appointment date and time
        const [hours, minutes] = (appt.time || '09:00').split(':').map(Number);
        const apptDateTime = new Date(appt.date);
        apptDateTime.setHours(hours, minutes, 0, 0);

        // Get clinic settings
        const clinic = await users.findOne({ id: appt.clinicId });
        const videoSettings = clinic?.videoConsultSettings || {};
        
        // Get owner for email
        const owner = await users.findOne({ id: appt.ownerId });
        if (!owner?.email) {
          results.errors.push(`No email for owner ${appt.ownerId}`);
          continue;
        }

        // Check for 24h reminder
        if (apptDateTime >= in24hStart && apptDateTime <= in24hEnd) {
          // Check if already sent
          if (appt.reminder24hSent) {
            results.reminders24h.skipped++;
            continue;
          }
          
          // Check if clinic has 24h reminders enabled
          if (videoSettings.reminderEmail24h === false) {
            results.reminders24h.skipped++;
            continue;
          }

          // Send 24h reminder
          const emailHtml = generateReminderEmail(appt, clinic, '24h');
          const sent = await sendEmail({
            to: owner.email,
            subject: `⏰ Promemoria: Appuntamento domani per ${appt.petName}`,
            html: emailHtml
          });

          if (sent) {
            // Mark as sent
            await appointments.updateOne(
              { id: appt.id },
              { $set: { reminder24hSent: true, reminder24hSentAt: new Date().toISOString() } }
            );
            results.reminders24h.sent++;
            console.log(`[CRON] 24h reminder sent to ${owner.email} for appt ${appt.id}`);
          } else {
            results.reminders24h.failed++;
          }
        }

        // Check for 1h reminder
        if (apptDateTime >= in1hStart && apptDateTime <= in1hEnd) {
          // Check if already sent
          if (appt.reminder1hSent) {
            results.reminders1h.skipped++;
            continue;
          }
          
          // Check if clinic has 1h reminders enabled
          if (videoSettings.reminderEmail1h === false) {
            results.reminders1h.skipped++;
            continue;
          }

          // Send 1h reminder
          const emailHtml = generateReminderEmail(appt, clinic, '1h');
          const sent = await sendEmail({
            to: owner.email,
            subject: `🚨 Tra 1 ora: Appuntamento per ${appt.petName}!`,
            html: emailHtml
          });

          if (sent) {
            // Mark as sent
            await appointments.updateOne(
              { id: appt.id },
              { $set: { reminder1hSent: true, reminder1hSentAt: new Date().toISOString() } }
            );
            results.reminders1h.sent++;
            console.log(`[CRON] 1h reminder sent to ${owner.email} for appt ${appt.id}`);
          } else {
            results.reminders1h.failed++;
          }
        }

      } catch (apptError) {
        results.errors.push(`Error processing appt ${appt.id}: ${apptError.message}`);
      }
    }

    console.log('[CRON Hourly] Results:', JSON.stringify(results));
    return NextResponse.json({ success: true, results });

  } catch (error) {
    console.error('[CRON Hourly] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      results 
    }, { status: 500 });
  }
}
