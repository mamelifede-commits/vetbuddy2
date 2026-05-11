import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY && RESEND_API_KEY !== 're_your_api_key_here' ? new Resend(RESEND_API_KEY) : null;

// Use custom domain if available, otherwise use Resend default
const FROM_EMAIL = process.env.EMAIL_FROM || 'VetBuddy <onboarding@resend.dev>';

export async function sendEmail({ to, subject, html, attachments }) {
  // MOCK mode if no API key
  if (!resend) {
    console.log('📧 [MOCK EMAIL] To:', to, 'Subject:', subject);
    return { success: true, mock: true, message: 'Email simulata (modalità MOCK)' };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      attachments
    });
    console.log('📧 Email sent to:', to, 'Subject:', subject, 'Response:', JSON.stringify(data));
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email error:', error.message, 'Full error:', JSON.stringify(error));
    return { success: false, error: error.message };
  }
}

// Test email function
export async function sendTestEmail(to) {
  const html = `
    <!DOCTYPE html>
    <html lang="it">
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
      <div style="padding:24px 16px;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <div style="background:linear-gradient(135deg,#f97066 0%,#fb923c 100%);padding:32px 24px;text-align:center;">
            <div style="font-size:36px;">🐾</div>
            <h1 style="color:#fff;font-size:24px;margin:12px 0 0;font-weight:700;">VetBuddy</h1>
          </div>
          <div style="padding:32px 24px;">
            <h2 style="color:#111827;font-size:20px;margin:0 0 16px;">✅ Email di test VetBuddy</h2>
            <p style="color:#4b5563;font-size:15px;line-height:1.6;">Questa è un'email di test per verificare che il sistema di notifiche funzioni correttamente.</p>
            <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;">
              <table width="100%" cellpadding="4" cellspacing="0">
                <tr><td style="color:#6b7280;font-size:14px;">Servizio</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">Resend</td></tr>
                <tr><td style="color:#6b7280;font-size:14px;">Mittente</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${FROM_EMAIL}</td></tr>
                <tr><td style="color:#6b7280;font-size:14px;">Data</td><td style="color:#111827;font-weight:600;font-size:14px;text-align:right;">${new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
              </table>
            </div>
            <p style="color:#4b5563;font-size:15px;">Se ricevi questa email, il sistema è configurato correttamente! 🎉</p>
          </div>
          <div style="background:#f9fafb;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:4px 0;">VetBuddy — Il copilota operativo per la tua clinica veterinaria</p>
            <p style="color:#9ca3af;font-size:12px;margin:4px 0;">vetbuddy.it • info@vetbuddy.it</p>
          </div>
        </div>
      </div>
    </body>
    </html>`;

  return sendEmail({
    to,
    subject: '✅ VetBuddy — Test sistema notifiche',
    html,
  });
}
