import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY && RESEND_API_KEY !== 're_your_api_key_here' ? new Resend(RESEND_API_KEY) : null;

export async function sendEmail({ to, subject, html, attachments }) {
  // MOCK mode if no API key
  if (!resend) {
    console.log('📧 [MOCK EMAIL] To:', to, 'Subject:', subject);
    return { success: true, mock: true, message: 'Email simulata (modalità MOCK)' };
  }

  try {
    const data = await resend.emails.send({
      from: 'VetBuddy <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
      attachments
    });
    return { success: true, data };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
}
