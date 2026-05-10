import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'VetBuddy <noreply@vetbuddy.it>';

// ============================================================
// TEMPLATE BASE HTML
// ============================================================
function baseTemplate(content, footerText = '') {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f97066 0%, #fb923c 100%); padding: 32px 24px; text-align: center; }
    .header img { width: 48px; height: 48px; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 12px 0 0; font-weight: 700; }
    .body { padding: 32px 24px; }
    .body h2 { color: #111827; font-size: 20px; margin: 0 0 16px; }
    .body p { color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 12px; }
    .info-box { background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #6b7280; font-weight: 500; }
    .info-value { color: #111827; font-weight: 600; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #f97066 0%, #fb923c 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 4px 0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-blue { background: #dbeafe; color: #1d4ed8; }
    .badge-green { background: #d1fae5; color: #059669; }
    .badge-purple { background: #ede9fe; color: #7c3aed; }
    .badge-orange { background: #ffedd5; color: #ea580c; }
  </style>
</head>
<body>
  <div style="padding: 24px 16px;">
    <div class="container">
      <div class="header">
        <div style="font-size: 36px;">🐾</div>
        <h1>VetBuddy</h1>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>VetBuddy — Il copilota operativo per la tua clinica veterinaria</p>
        <p>vetbuddy.it • info@vetbuddy.it</p>
        ${footerText ? `<p style="margin-top:8px;">${footerText}</p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

// 1. TEST EMAIL
export function testEmailTemplate() {
  return baseTemplate(`
    <h2>✅ Email di test VetBuddy</h2>
    <p>Questa è un'email di test per verificare che il sistema di notifiche VetBuddy funzioni correttamente.</p>
    <div class="info-box">
      <table width="100%" cellpadding="4" cellspacing="0">
        <tr><td style="color:#6b7280;font-size:14px;">Servizio</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">Resend</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Mittente</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">noreply@vetbuddy.it</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Data</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
      </table>
    </div>
    <p>Se ricevi questa email, il sistema è configurato correttamente! 🎉</p>
  `);
}

// 2. NUOVA RICHIESTA ANALISI → al laboratorio
export function newLabRequestTemplate({ clinicName, petName, petSpecies, examType, sampleCode, urgency, notes }) {
  return baseTemplate(`
    <h2>🧪 Nuova richiesta di analisi</h2>
    <p>La clinica <strong>${clinicName}</strong> ha inviato una nuova richiesta di analisi.</p>
    <div class="info-box">
      <table width="100%" cellpadding="4" cellspacing="0">
        <tr><td style="color:#6b7280;font-size:14px;">Animale</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${petName} (${petSpecies || 'N/D'})</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Tipo esame</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${examType}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Codice campione</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${sampleCode || 'N/D'}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Urgenza</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${urgency || 'Normale'}</td></tr>
        ${notes ? `<tr><td style="color:#6b7280;font-size:14px;">Note</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${notes}</td></tr>` : ''}
      </table>
    </div>
    <p>Accedi al tuo pannello VetBuddy per gestire la richiesta.</p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it'}" class="cta-button">Vai al Pannello →</a>
  `);
}

// 3. REFERTO CARICATO → alla clinica
export function reportUploadedTemplate({ labName, petName, examType, sampleCode }) {
  return baseTemplate(`
    <h2>📋 Nuovo referto disponibile</h2>
    <p>Il laboratorio <strong>${labName}</strong> ha caricato un referto.</p>
    <div class="info-box">
      <table width="100%" cellpadding="4" cellspacing="0">
        <tr><td style="color:#6b7280;font-size:14px;">Animale</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${petName}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Tipo esame</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${examType}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Codice campione</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${sampleCode || 'N/D'}</td></tr>
      </table>
    </div>
    <p>Rivedi il referto, aggiungi le tue note cliniche e decidi se renderlo visibile al proprietario.</p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it'}" class="cta-button">Rivedi il referto →</a>
  `, 'Il referto non sarà visibile al proprietario fino alla tua approvazione.');
}

// 4. REFERTO PUBBLICATO → al proprietario
export function reportPublishedTemplate({ clinicName, petName, examType, clinicalNotes }) {
  return baseTemplate(`
    <h2>📄 Nuovo referto per ${petName}</h2>
    <p>La clinica <strong>${clinicName}</strong> ha reso disponibile un nuovo referto per il tuo animale.</p>
    <div class="info-box">
      <table width="100%" cellpadding="4" cellspacing="0">
        <tr><td style="color:#6b7280;font-size:14px;">Animale</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${petName}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Tipo esame</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${examType}</td></tr>
        ${clinicalNotes ? `<tr><td colspan="2" style="color:#6b7280;font-size:14px;padding-top:12px;"><strong>Note del veterinario:</strong><br/><span style="color:#111827;">${clinicalNotes}</span></td></tr>` : ''}
      </table>
    </div>
    <p>Accedi alla tua area riservata per visualizzare il referto completo.</p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it'}" class="cta-button">Visualizza il referto →</a>
  `);
}

// 5. CONFERMA PRENOTAZIONE → al proprietario
export function appointmentConfirmedTemplate({ clinicName, petName, date, time, service }) {
  return baseTemplate(`
    <h2>✅ Prenotazione confermata</h2>
    <p>La clinica <strong>${clinicName}</strong> ha confermato il tuo appuntamento.</p>
    <div class="info-box">
      <table width="100%" cellpadding="4" cellspacing="0">
        <tr><td style="color:#6b7280;font-size:14px;">Animale</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${petName}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Data</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${date}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Ora</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${time}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Servizio</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${service || 'Visita'}</td></tr>
      </table>
    </div>
    <p>Ti invieremo un promemoria 24 ore e 1 ora prima dell'appuntamento.</p>
  `);
}

// 6. PROMEMORIA APPUNTAMENTO → al proprietario
export function appointmentReminderTemplate({ clinicName, petName, date, time, service, hoursUntil }) {
  return baseTemplate(`
    <h2>⏰ Promemoria: appuntamento tra ${hoursUntil}</h2>
    <p>Ti ricordiamo il prossimo appuntamento presso <strong>${clinicName}</strong>.</p>
    <div class="info-box">
      <table width="100%" cellpadding="4" cellspacing="0">
        <tr><td style="color:#6b7280;font-size:14px;">Animale</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${petName}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Data</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${date}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Ora</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${time}</td></tr>
        <tr><td style="color:#6b7280;font-size:14px;">Servizio</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${service || 'Visita'}</td></tr>
      </table>
    </div>
    <p>In caso di impedimento, avvisa la clinica il prima possibile.</p>
  `);
}

// 7. NUOVO MESSAGGIO → al destinatario
export function newMessageTemplate({ senderName, senderRole, subject, preview }) {
  const roleLabel = senderRole === 'clinic' ? 'Clinica' : senderRole === 'lab' ? 'Laboratorio' : 'Proprietario';
  return baseTemplate(`
    <h2>💬 Nuovo messaggio</h2>
    <p>Hai ricevuto un nuovo messaggio da <strong>${senderName}</strong> <span class="badge badge-blue">${roleLabel}</span></p>
    <div class="info-box">
      <table width="100%" cellpadding="4" cellspacing="0">
        ${subject ? `<tr><td style="color:#6b7280;font-size:14px;">Oggetto</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${subject}</td></tr>` : ''}
        <tr><td colspan="2" style="color:#4b5563;font-size:14px;padding-top:8px;font-style:italic;">"${preview ? preview.substring(0, 200) : '...'}"</td></tr>
      </table>
    </div>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it'}" class="cta-button">Leggi il messaggio →</a>
  `);
}

// ============================================================
// SEND EMAIL FUNCTION
// ============================================================
export async function sendEmail({ to, subject, html }) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    console.log(`[EMAIL] Inviata a ${to}: "${subject}" — ID: ${result.data?.id || 'N/A'}`);
    return { success: true, id: result.data?.id, error: null };
  } catch (error) {
    console.error(`[EMAIL] Errore invio a ${to}: "${subject}"`, error);
    return { success: false, id: null, error: error.message };
  }
}

// ============================================================
// CONVENIENCE FUNCTIONS
// ============================================================
export async function sendTestEmail(to) {
  return sendEmail({
    to,
    subject: '✅ VetBuddy — Test sistema notifiche',
    html: testEmailTemplate(),
  });
}

export async function sendNewLabRequestEmail(labEmail, data) {
  return sendEmail({
    to: labEmail,
    subject: `🧪 Nuova richiesta di analisi — ${data.petName} (${data.examType})`,
    html: newLabRequestTemplate(data),
  });
}

export async function sendReportUploadedEmail(clinicEmail, data) {
  return sendEmail({
    to: clinicEmail,
    subject: `📋 Referto disponibile — ${data.petName} (${data.examType})`,
    html: reportUploadedTemplate(data),
  });
}

export async function sendReportPublishedEmail(ownerEmail, data) {
  return sendEmail({
    to: ownerEmail,
    subject: `📄 Nuovo referto per ${data.petName} — ${data.clinicName}`,
    html: reportPublishedTemplate(data),
  });
}

export async function sendAppointmentConfirmedEmail(ownerEmail, data) {
  return sendEmail({
    to: ownerEmail,
    subject: `✅ Prenotazione confermata — ${data.petName} il ${data.date}`,
    html: appointmentConfirmedTemplate(data),
  });
}

export async function sendAppointmentReminderEmail(ownerEmail, data) {
  return sendEmail({
    to: ownerEmail,
    subject: `⏰ Promemoria: ${data.petName} — appuntamento ${data.date} alle ${data.time}`,
    html: appointmentReminderTemplate(data),
  });
}

export async function sendNewMessageEmail(recipientEmail, data) {
  return sendEmail({
    to: recipientEmail,
    subject: `💬 Nuovo messaggio da ${data.senderName}`,
    html: newMessageTemplate(data),
  });
}
