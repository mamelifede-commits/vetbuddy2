// Test script - email WITHOUT QR code
import { Resend } from 'resend';
import { readFileSync } from 'fs';

const envContent = readFileSync('/app/.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const resend = new Resend(envVars.RESEND_API_KEY);

async function sendTestRewardEmail() {
  const testEmail = 'info@vetbuddy.it';
  const redeemCode = 'SCONTO15';
  const baseUrl = envVars.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
  
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
        
        <!-- Codice Univoco - BIG AND CLEAR -->
        <div style="background: #333; padding: 25px; border-radius: 15px; margin: 25px 0; text-align: center;">
          <p style="color: #FFD93D; margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 3px;">🎟️ Il tuo codice premio</p>
          <p style="color: white; margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 10px; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${redeemCode}</p>
          <p style="color: #aaa; margin: 15px 0 0 0; font-size: 12px;">Comunica questo codice in clinica</p>
        </div>
        
        <p style="color: #888; font-size: 14px; text-align: center; margin-top: 20px;">
          <strong>Motivo:</strong> Grazie per la tua fedeltà!
        </p>
        <p style="color: #E74C3C; font-size: 14px; text-align: center; background: #FFF5F5; padding: 10px; border-radius: 8px;">⚠️ <strong>Scade il:</strong> 31/12/2025</p>
        
        <!-- Istruzioni Riscatto - SIMPLIFIED -->
        <div style="background: #E8F5E9; padding: 20px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #27AE60; margin: 0 0 15px 0; font-size: 16px;">📋 Come usare il premio:</h3>
          <ol style="color: #666; margin: 0; padding-left: 20px; line-height: 2;">
            <li><strong>In clinica:</strong> Comunica il codice <strong style="background: #333; color: #FFD93D; padding: 2px 8px; border-radius: 4px; font-family: monospace;">${redeemCode}</strong> al momento del pagamento</li>
            <li><strong>Online:</strong> Clicca "Riscatta Online" qui sotto per prenotare l'utilizzo</li>
          </ol>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}?action=rewards" style="display: inline-block; background: #FF6B6B; color: white; padding: 16px 40px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(255,107,107,0.4);">
            🎁 Riscatta Online
          </a>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
          Il premio verrà applicato quando lo comunichi in clinica. Grazie per la tua fedeltà! 🐾
        </p>
      </div>
      <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: #999; margin: 0; font-size: 12px;">© 2025 VetBuddy - La piattaforma per la salute dei tuoi animali</p>
      </div>
    </div>
  `;

  try {
    console.log('📧 Invio email di test (SENZA QR CODE) a:', testEmail);
    
    const result = await resend.emails.send({
      from: 'VetBuddy <noreply@vetbuddy.it>',
      to: testEmail,
      subject: '🎁 [TEST v3] Premio SENZA QR - Solo codice testuale',
      html: html
    });
    
    console.log('✅ Email inviata con successo!');
    console.log('📬 ID:', result.data?.id);
    return result;
  } catch (error) {
    console.error('❌ Errore:', error.message);
    throw error;
  }
}

sendTestRewardEmail()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
