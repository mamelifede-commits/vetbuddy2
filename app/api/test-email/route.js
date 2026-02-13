import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function sendEmail({ to, subject, html }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY not configured' };
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

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data };
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function POST(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { to, petName, clinicName, date, time, videoLink } = body;

    if (!to) {
      return NextResponse.json({ error: 'Email "to" is required' }, { status: 400, headers: corsHeaders });
    }

    const formattedDate = new Date(date).toLocaleDateString('it-IT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🐾 Prenotazione Confermata!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 16px;">${clinicName || 'Clinica Veterinaria'}</p>
        </div>
        
        <div style="padding: 32px;">
          <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0;">
                  <span style="color: #64748b; font-size: 14px;">🐕 Paziente</span><br/>
                  <strong style="font-size: 18px; color: #1e293b;">${petName || 'Il tuo animale'}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <span style="color: #64748b; font-size: 14px;">📋 Tipo</span><br/>
                  <strong style="font-size: 16px; color: #1e293b;">Video Consulto</strong>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <span style="color: #64748b; font-size: 14px;">📅 Data e ora</span><br/>
                  <strong style="font-size: 18px; color: #10B981;">${formattedDate}</strong><br/>
                  <strong style="font-size: 24px; color: #1e293b;">🕐 ${time || '10:00'}</strong>
                </td>
              </tr>
            </table>
          </div>

          ${videoLink ? `
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
            <h3 style="color: white; margin: 0 0 12px; font-size: 18px;">🎥 Video Consulto</h3>
            <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 16px;">
              Il giorno dell'appuntamento, clicca il pulsante qui sotto per avviare la videochiamata.
            </p>
            <a href="${videoLink}" target="_blank" style="display: inline-block; background: white; color: #6366f1; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              📹 Entra nel Video Consulto
            </a>
            <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 12px 0 0;">
              Riceverai un promemoria 24h e 1h prima dell'appuntamento
            </p>
          </div>
          ` : ''}
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>⚠️ Importante:</strong> Il video consulto è una consulenza a distanza e non sostituisce una visita clinica in presenza quando è necessario un esame fisico.
            </p>
          </div>
          
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            Riceverai un promemoria 24h prima dell'appuntamento.<br/>
            Per modifiche o cancellazioni, contatta la clinica.
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            🧪 <strong>EMAIL DI TEST</strong> - Verifica funzionamento sistema<br/>
            Inviata automaticamente da VetBuddy<br/>
            <a href="https://vetbuddy.it" style="color: #FF6B6B;">vetbuddy.it</a>
          </p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to,
      subject: `🧪 TEST - ✅ Prenotazione Confermata - ${petName || 'Luna'} | ${clinicName || 'VetBuddy'}`,
      html: emailHtml
    });

    if (result.success) {
      console.log(`✅ Test email sent to: ${to}`);
      return NextResponse.json({ 
        success: true, 
        message: `Email inviata a ${to}`,
        resendId: result.data?.id 
      }, { headers: corsHeaders });
    } else {
      console.error(`❌ Test email failed:`, result.error);
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500, headers: corsHeaders });
    }

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
