import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper: Generate contact buttons - WhatsApp + In-App Messaging
function getContactButtons(clinic, baseUrl, subject = '') {
  const whatsappNumber = clinic?.whatsappNumber;
  const clinicId = clinic?.id || '';
  
  // Always include in-app message button
  const inAppMessageUrl = `${baseUrl}?action=messages&clinicId=${clinicId}&newMessage=true`;
  const inAppButton = `<a href="${inAppMessageUrl}" style="display: inline-block; background: #3B82F6; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
    💬 Scrivi in App
  </a>`;
  
  // WhatsApp button if available
  let whatsappButton = '';
  if (whatsappNumber) {
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}${subject ? `?text=${encodeURIComponent(subject)}` : ''}`;
    whatsappButton = `<a href="${whatsappUrl}" style="display: inline-block; background: #25D366; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
      📱 WhatsApp
    </a>`;
  }
  
  return whatsappButton + inAppButton;
}

// Helper: Generate booking button for specific service
function getBookServiceButton(baseUrl, clinic, serviceType, serviceName) {
  const bookingUrl = `${baseUrl}?action=book&clinicId=${clinic?.id || ''}&serviceType=${serviceType}`;
  return `<a href="${bookingUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
    📅 Prenota ${serviceName}
  </a>`;
}

// Helper: Generate payment button
function getPaymentButton(baseUrl, appointmentId, amount) {
  const payUrl = `${baseUrl}?action=pay&appointmentId=${appointmentId}&amount=${amount}`;
  return `<a href="${payUrl}" style="display: inline-block; background: #EF4444; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
    💳 Paga Ora ${amount ? `€${amount}` : ''}
  </a>`;
}

// Helper: Generate document view button
function getDocumentButton(baseUrl, documentId) {
  const docUrl = `${baseUrl}?action=documents${documentId ? `&docId=${documentId}` : ''}`;
  return `<a href="${docUrl}" style="display: inline-block; background: #06B6D4; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
    📋 Visualizza Documento
  </a>`;
}

// Helper: Generate rewards button
function getRewardsButton(baseUrl, rewardId, action = 'view') {
  const rewardUrl = `${baseUrl}?action=rewards${rewardId ? `&rewardId=${rewardId}&use=${action === 'use'}` : ''}`;
  const buttonText = action === 'use' ? '🎁 Usa il Premio' : '🎁 Vedi i miei Premi';
  return `<a href="${rewardUrl}" style="display: inline-block; background: #8B5CF6; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
    ${buttonText}
  </a>`;
}

// Helper: Get cancellation policy text
function getCancellationPolicyText(clinic) {
  return clinic?.cancellationPolicyText || 
         clinic?.cancellationPolicy?.message || 
         'Ti preghiamo di avvisarci almeno 24 ore prima in caso di disdetta.';
}

// List of all automation types
const AUTOMATION_TYPES = {
  appointmentReminder: { name: 'Promemoria Appuntamento', description: 'Inviato 24h prima', plan: 'starter' },
  appointmentConfirmation: { name: 'Conferma Appuntamento', description: 'Inviato alla conferma', plan: 'starter' },
  welcomeNewPet: { name: 'Benvenuto Nuovo Pet', description: 'Inviato alla registrazione pet', plan: 'starter' },
  petBirthday: { name: 'Compleanno Pet', description: 'Auguri automatici', plan: 'starter' },
  vaccineRecall: { name: 'Richiamo Vaccino', description: 'Promemoria vaccini', plan: 'pro' },
  postVisitFollowup: { name: 'Follow-up Post Visita', description: 'Inviato 48h dopo visita', plan: 'pro' },
  reviewRequest: { name: 'Richiesta Recensione', description: 'Invita a recensire', plan: 'pro' },
  paymentReminder: { name: 'Promemoria Pagamento', description: 'Fatture non pagate', plan: 'pro' },
  loyaltyReward: { name: 'Premio Fedeltà', description: 'Notifica premio assegnato', plan: 'pro' },
  documentReady: { name: 'Documento Pronto', description: 'Referto disponibile', plan: 'pro' }
};

// Email templates generator
function generateEmailTemplate(type, data) {
  const { owner, pet, clinic, appointment, document, reward, baseUrl } = data;
  const ownerName = owner?.name || 'Proprietario';
  const petName = pet?.name || 'Il tuo pet';
  const clinicName = clinic?.clinicName || clinic?.name || 'La tua Clinica';
  const clinicId = clinic?.id || '';
  
  const contactButtons = getContactButtons(clinic, baseUrl);
  const cancellationPolicy = getCancellationPolicyText(clinic);
  
  const templates = {
    appointmentReminder: {
      subject: `⏰ Promemoria: Appuntamento domani per ${petName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">⏰ Promemoria Appuntamento</h2>
            <p style="color: #666; font-size: 16px;">Ciao ${ownerName},</p>
            <p style="color: #666; font-size: 16px;">Ti ricordiamo che <strong>${petName}</strong> ha un appuntamento <strong>domani</strong>:</p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
              <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${appointment?.date || 'Domani'}</p>
              <p style="margin: 5px 0;"><strong>🕐 Ora:</strong> ${appointment?.time || '10:00'}</p>
              <p style="margin: 5px 0;"><strong>🏥 Clinica:</strong> ${clinicName}</p>
              <p style="margin: 5px 0;"><strong>📋 Motivo:</strong> ${appointment?.reason || 'Visita di controllo'}</p>
            </div>
            <div style="text-align: center; margin: 25px 0;">
              ${contactButtons}
              <a href="${baseUrl}?action=cancel&appointmentId=${appointment?.id || 'test'}" style="display: inline-block; background: #E74C3C; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                ❌ Disdici Appuntamento
              </a>
            </div>
            <div style="background: #FFF3CD; padding: 15px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #FFC107;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #856404;">📋 Politica di Cancellazione</p>
              <p style="margin: 0; color: #856404; font-size: 14px;">${cancellationPolicy}</p>
            </div>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
          </div>
        </div>
      `
    },
    
    appointmentConfirmation: {
      subject: `✅ Appuntamento Confermato - ${petName} | ${clinicName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">✅ Appuntamento Confermato!</h2>
            <p style="color: #666; font-size: 16px;">Ciao ${ownerName},</p>
            <p style="color: #666; font-size: 16px;">La tua prenotazione per <strong>${petName}</strong> è stata confermata.</p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10B981;">
              <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${appointment?.date || '15 Febbraio 2025'}</p>
              <p style="margin: 5px 0;"><strong>🕐 Ora:</strong> ${appointment?.time || '10:00'}</p>
              <p style="margin: 5px 0;"><strong>🏥 Clinica:</strong> ${clinicName}</p>
              <p style="margin: 5px 0;"><strong>📋 Servizio:</strong> ${appointment?.reason || 'Visita di controllo'}</p>
            </div>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${baseUrl}?action=appointments" style="display: inline-block; background: #10B981; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                📅 Vedi i miei Appuntamenti
              </a>
              ${contactButtons}
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">Riceverai un promemoria 24h prima.</p>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
          </div>
        </div>
      `
    },
    
    welcomeNewPet: {
      subject: `🎉 Benvenuto ${petName} nella famiglia vetbuddy!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B5CF6, #EC4899); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">🎉 Benvenuto ${petName}!</h2>
            <p style="color: #666; font-size: 16px;">Ciao ${ownerName},</p>
            <p style="color: #666; font-size: 16px;">Siamo felici di dare il benvenuto a <strong>${petName}</strong> nella famiglia vetbuddy!</p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #8B5CF6;">
              <p style="margin: 5px 0;"><strong>🐾 Nome:</strong> ${petName}</p>
              <p style="margin: 5px 0;"><strong>🏥 Clinica di riferimento:</strong> ${clinicName}</p>
            </div>
            <p style="color: #666; font-size: 16px;">Ora puoi:</p>
            <ul style="color: #666; font-size: 16px;">
              <li>📅 Prenotare visite online</li>
              <li>📋 Gestire la cartella clinica</li>
              <li>💉 Ricevere promemoria vaccini</li>
              <li>🎁 Accumulare premi fedeltà</li>
            </ul>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${baseUrl}?action=pets" style="display: inline-block; background: #8B5CF6; color: white; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                ✏️ Completa il Profilo di ${petName}
              </a>
              ${getBookServiceButton(baseUrl, clinic, 'checkup', 'Prima Visita')}
            </div>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
          </div>
        </div>
      `
    },
    
    petBirthday: {
      subject: `🎂 Buon Compleanno ${petName}! 🎁`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; text-align: center;">🎂 Buon Compleanno ${petName}! 🎉</h2>
            <div style="background: linear-gradient(135deg, #FFF7ED, #FFEDD5); padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center;">
              <p style="font-size: 60px; margin: 0;">🎂🎈🎁</p>
              <h3 style="color: #EA580C; margin: 15px 0;">Tanti auguri a ${petName}!</h3>
              <p style="color: #9A3412; font-size: 14px;">Da parte di tutto lo staff di ${clinicName}</p>
            </div>
            <div style="text-align: center; margin: 25px 0;">
              ${contactButtons}
              ${getRewardsButton(baseUrl)}
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">Passa in clinica per ritirare un piccolo regalo! 🎁</p>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
          </div>
        </div>
      `
    },
    
    vaccineRecall: {
      subject: `💉 Richiamo vaccino in scadenza per ${petName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">⚠️ Richiamo Vaccino in Scadenza</h2>
            <p style="color: #666; font-size: 16px;">Ciao ${ownerName},</p>
            <p style="color: #666; font-size: 16px;">Il vaccino di <strong>${petName}</strong> è in scadenza:</p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #FFA500;">
              <p style="margin: 5px 0;"><strong>💉 Vaccino:</strong> Polivalente</p>
              <p style="margin: 5px 0;"><strong>📅 Scadenza:</strong> 28 Febbraio 2025</p>
              <p style="margin: 5px 0;"><strong>🐾 Animale:</strong> ${petName}</p>
            </div>
            <p style="color: #666; font-size: 16px;">Ti consigliamo di prenotare un appuntamento per il richiamo.</p>
            <div style="text-align: center; margin: 30px 0;">
              ${getBookServiceButton(baseUrl, clinic, 'vaccine', 'Richiamo Vaccino')}
              ${contactButtons}
            </div>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
          </div>
        </div>
      `
    },
    
    postVisitFollowup: {
      subject: `💚 Come sta ${petName} dopo la visita?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4CAF50, #8BC34A); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Come sta ${petName}?</h2>
            <p style="color: #666; font-size: 16px;">Ciao ${ownerName},</p>
            <p style="color: #666; font-size: 16px;">Sono passati un paio di giorni dalla visita di <strong>${petName}</strong> presso <strong>${clinicName}</strong>.</p>
            <p style="color: #666; font-size: 16px;">Volevamo sapere come sta! Se hai domande o dubbi, non esitare a contattarci.</p>
            <div style="text-align: center; margin: 30px 0;">
              ${contactButtons}
            </div>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${baseUrl}?action=review&clinicId=${clinicId}" style="display: inline-block; background: #FFD700; color: #333; padding: 14px 28px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 5px;">
                ⭐ Lascia una Recensione
              </a>
            </div>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
          </div>
        </div>
      `
    },
    
    reviewRequest: {
      subject: `⭐ Ti è piaciuta l'esperienza con ${clinicName}?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #333; margin: 0;">🐾 vetbuddy</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; text-align: center;">⭐ La tua opinione conta!</h2>
            <p style="color: #666; font-size: 16px;">Ciao ${ownerName},</p>
            <p style="color: #666; font-size: 16px;">Ci farebbe piacere sapere come è andata la tua esperienza con <strong>${clinicName}</strong>!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}?action=review&clinicId=${clinicId}" style="display: inline-block; background: #FFD700; color: #333; padding: 18px 36px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 18px;">
                ⭐⭐⭐⭐⭐ Lascia una Recensione
              </a>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center;">Bastano 2 minuti! Grazie mille 🙏</p>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
          </div>
        </div>
      `
    },
    
    paymentReminder: {
      subject: `💳 Promemoria pagamento - ${clinicName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #EF4444, #DC2626); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">💳 Promemoria Pagamento</h2>
            <p style="color: #666; font-size: 16px;">Ciao ${ownerName},</p>
            <p style="color: #666; font-size: 16px;">Ti ricordiamo che hai una fattura in sospeso per la visita di <strong>${petName}</strong>:</p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #EF4444;">
              <p style="margin: 5px 0;"><strong>📋 Servizio:</strong> ${appointment?.reason || 'Visita di controllo'}</p>
              <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${appointment?.date || '10 Febbraio 2025'}</p>
              <p style="margin: 5px 0;"><strong>💰 Importo:</strong> €${appointment?.amount || '65.00'}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              ${getPaymentButton(baseUrl, appointment?.id || 'test', appointment?.amount || '65.00')}
              ${contactButtons}
            </div>
            <p style="color: #666; font-size: 14px;">Per qualsiasi domanda, non esitare a contattarci.</p>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
          </div>
        </div>
      `
    },
    
    loyaltyReward: {
      subject: `🎁 Hai ricevuto un Premio Fedeltà da ${clinicName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B5CF6, #A855F7); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; text-align: center;">🎁 Hai un nuovo Premio!</h2>
            <p style="color: #666; font-size: 16px;">Ciao ${ownerName},</p>
            <p style="color: #666; font-size: 16px;"><strong>${clinicName}</strong> ti ha assegnato un premio fedeltà per ringraziarti della tua fiducia!</p>
            <div style="background: linear-gradient(135deg, #F3E8FF, #E9D5FF); padding: 25px; border-radius: 15px; margin: 20px 0; text-align: center; border: 2px solid #A855F7;">
              <p style="font-size: 50px; margin: 0;">🎁</p>
              <h3 style="color: #7C3AED; margin: 15px 0;">${reward?.name || 'Sconto 10% sulla prossima visita'}</h3>
              <p style="color: #6B21A8; font-size: 14px;">${reward?.description || 'Valido per 30 giorni'}</p>
            </div>
            <div style="background: #FFF7ED; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #F59E0B;">
              <p style="margin: 0; font-weight: bold; color: #92400E;">📝 Come usare il premio:</p>
              <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #78350F;">
                <li>Vai nella sezione "I miei premi" della dashboard</li>
                <li>Seleziona il premio che vuoi usare</li>
                <li>Clicca "Usa Premio" e mostra il codice al momento del pagamento</li>
              </ol>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              ${getRewardsButton(baseUrl, reward?.id, 'use')}
              ${getBookServiceButton(baseUrl, clinic, 'checkup', 'Prenota e Usa il Premio')}
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">Grazie per essere parte della famiglia vetbuddy! 💜</p>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
          </div>
        </div>
      `
    },
    
    documentReady: {
      subject: `📋 Documento pronto per ${petName} - ${clinicName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #06B6D4, #0891B2); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">🐾 vetbuddy</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">📋 Documento Disponibile</h2>
            <p style="color: #666; font-size: 16px;">Ciao ${ownerName},</p>
            <p style="color: #666; font-size: 16px;">È disponibile un nuovo documento per <strong>${petName}</strong>:</p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #06B6D4;">
              <p style="margin: 5px 0;"><strong>📄 Tipo:</strong> ${document?.type || 'Referto Esami'}</p>
              <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${document?.date || new Date().toLocaleDateString('it-IT')}</p>
              <p style="margin: 5px 0;"><strong>🏥 Clinica:</strong> ${clinicName}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              ${getDocumentButton(baseUrl, document?.id)}
              ${contactButtons}
            </div>
          </div>
          <div style="background: #333; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; margin: 0; font-size: 12px;">© 2025 vetbuddy</p>
          </div>
        </div>
      `
    }
  };
  
  return templates[type] || null;
}

// GET - List available test automations
export async function GET(request) {
  return NextResponse.json({
    success: true,
    message: 'Endpoint per testare le email automatiche di vetbuddy',
    availableTypes: AUTOMATION_TYPES,
    usage: 'POST con { "type": "nomeAutomazione", "to": "email@destinatario.com" }',
    sendAll: 'POST con { "sendAll": true, "to": "email@destinatario.com" }'
  }, { headers: corsHeaders });
}

// POST - Send test email
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, to, sendAll } = body;
    
    if (!to) {
      return NextResponse.json({ error: 'Email destinatario (to) richiesta' }, { status: 400, headers: corsHeaders });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vetbuddy.it';
    
    // Get sample data for test
    const usersCollection = await getCollection('users');
    const sampleClinic = await usersCollection.findOne({ role: 'clinic' }) || {
      id: 'test-clinic', clinicName: 'Clinica Demo vetbuddy', whatsappNumber: '+393331234567',
      cancellationPolicyText: 'Cancellazione gratuita entro 24h'
    };
    
    const sampleOwner = await usersCollection.findOne({ role: 'owner' }) || { id: 'test-owner', name: 'Mario Rossi' };
    const petsCollection = await getCollection('pets');
    const samplePet = await petsCollection.findOne({}) || { id: 'test-pet', name: 'Luna' };
    
    const sampleAppointment = {
      id: 'test-apt',
      date: new Date(Date.now() + 24*60*60*1000).toLocaleDateString('it-IT'),
      time: '10:30',
      reason: 'Visita di controllo',
      amount: '65.00'
    };
    
    const sampleDocument = { id: 'test-doc', type: 'Referto Esami', date: new Date().toLocaleDateString('it-IT') };
    const sampleReward = { id: 'test-reward', name: 'Sconto 10% sulla prossima visita', description: 'Valido per 30 giorni' };
    
    const templateData = {
      owner: sampleOwner,
      pet: samplePet,
      clinic: sampleClinic,
      appointment: sampleAppointment,
      document: sampleDocument,
      reward: sampleReward,
      baseUrl
    };
    
    const results = [];
    
    if (sendAll) {
      for (const [emailType, info] of Object.entries(AUTOMATION_TYPES)) {
        const template = generateEmailTemplate(emailType, templateData);
        if (template) {
          try {
            await sendEmail({ to, subject: `🧪 TEST - ${template.subject}`, html: template.html });
            results.push({ type: emailType, name: info.name, status: 'sent' });
          } catch (err) {
            results.push({ type: emailType, name: info.name, status: 'error', error: err.message });
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Inviate ${results.filter(r => r.status === 'sent').length}/${results.length} email di test a ${to}`,
        results
      }, { headers: corsHeaders });
      
    } else {
      if (!type || !AUTOMATION_TYPES[type]) {
        return NextResponse.json({ error: 'Tipo automazione non valido', availableTypes: Object.keys(AUTOMATION_TYPES) }, { status: 400, headers: corsHeaders });
      }
      
      const template = generateEmailTemplate(type, templateData);
      if (!template) {
        return NextResponse.json({ error: 'Template non trovato' }, { status: 404, headers: corsHeaders });
      }
      
      await sendEmail({ to, subject: `🧪 TEST - ${template.subject}`, html: template.html });
      
      return NextResponse.json({
        success: true,
        message: `Email di test "${AUTOMATION_TYPES[type].name}" inviata a ${to}`,
        type,
        plan: AUTOMATION_TYPES[type].plan
      }, { headers: corsHeaders });
    }
    
  } catch (error) {
    console.error('Test automation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
