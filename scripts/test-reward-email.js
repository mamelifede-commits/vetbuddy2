// Test script to send a reward email
const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestRewardEmail() {
  const testEmail = 'info@vetbuddy.it';
  const redeemCode = 'TEST42';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
  
  // QR Code URL
  const qrData = encodeURIComponent(`VETBUDDY-REWARD:${redeemCode}`);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}&bgcolor=ffffff&color=FF6B6B`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B6B, #FFD93D); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎁 Hai un Premio!</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p style="color: #666; font-size: 16px;">Ciao <strong>Mario Rossi</strong>,</p>
        <p style="color: #666; font-size: 16px;"><strong>Clinica Veterinaria Milano</strong> ti ha assegnato un premio fedeltà!</p>
        
        <!-- Premio Card -->
        <div style="background: white; padding: 25px; border-radius: 15px; margin: 25px 0; text-align: center; border: 2px dashed #FFD93D; box-shadow: 0 4px 15px rgba(255,107,107,0.1);">
          <p style="font-size: 28px; margin: 0 0 10px 0;">🎁</p>
          <h2 style="color: #FF6B6B; margin: 0 0 10px 0; font-size: 24px;">Sconto Prima Visita</h2>
          <p style="color: #666; margin: 0; font-size: 14px;">Valido per la prima visita di controllo</p>
          <p style="font-size: 32px; color: #27AE60; font-weight: bold; margin: 15px 0 0 0;">-15%</p>
        </div>
        
        <!-- Codice Univoco -->
        <div style="background: #333; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
          <p style="color: #FFD93D; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Il tuo codice premio</p>
          <p style="color: white; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">${redeemCode}</p>
        </div>
        
        <!-- QR Code -->
        <div style="text-align: center; margin: 25px 0;">
          <p style="color: #888; font-size: 12px; margin-bottom: 10px;">Oppure mostra questo QR Code in clinica:</p>
          <img src="${qrCodeUrl}" alt="QR Code Premio" style="width: 150px; height: 150px; border-radius: 10px; border: 3px solid #FFD93D;" />
        </div>
        
        <p style="color: #888; font-size: 14px; text-align: center; margin-top: 20px;">
          <strong>Motivo:</strong> Grazie per la tua fedeltà!
        </p>
        <p style="color: #E74C3C; font-size: 14px; text-align: center; background: #FFF5F5; padding: 10px; border-radius: 8px;">⚠️ <strong>Scade il:</strong> 31/12/2025</p>
        
        <!-- Istruzioni Riscatto -->
        <div style="background: #E8F5E9; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #27AE60; margin: 0 0 15px 0; font-size: 16px;">📋 Come riscattare il premio:</h3>
          <ol style="color: #666; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>In clinica:</strong> Mostra il codice <strong>${redeemCode}</strong> o il QR Code al momento del pagamento</li>
            <li><strong>Online:</strong> Accedi a VetBuddy, vai su "I Miei Premi" e clicca "Riscatta" per prenotare l'utilizzo</li>
          </ol>
        </div>
        
        <!-- CTA Buttons -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}?action=rewards" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 35px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
            🎁 Riscatta Online
          </a>
          <a href="${baseUrl}?action=book" style="display: inline-block; background: #27AE60; color: white; padding: 14px 35px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
            📅 Prenota Visita
          </a>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
          Il premio verrà applicato automaticamente quando lo riscatti. Grazie per la tua fedeltà! 🐾
        </p>
      </div>
      <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: #999; margin: 0; font-size: 12px;">© 2025 VetBuddy - La piattaforma per la salute dei tuoi animali</p>
      </div>
    </div>
  `;

  try {
    console.log('📧 Invio email di test a:', testEmail);
    console.log('🔑 API Key presente:', !!process.env.RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: 'VetBuddy <noreply@vetbuddy.it>',
      to: testEmail,
      subject: '🎁 [TEST] Hai ricevuto un premio da Clinica Veterinaria Milano!',
      html: html
    });
    
    console.log('✅ Email inviata con successo!');
    console.log('📬 ID:', result.data?.id || result.id);
    return result;
  } catch (error) {
    console.error('❌ Errore invio email:', error.message);
    throw error;
  }
}

sendTestRewardEmail()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
