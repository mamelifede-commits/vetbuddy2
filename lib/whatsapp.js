// /app/lib/whatsapp.js
// Helper riusabile per invio WhatsApp via Twilio
// Usato da: modulo connect.js (inviti) + automazioni varie

let twilioClient = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  try {
    const twilio = require('twilio');
    twilioClient = twilio(sid, token);
    return twilioClient;
  } catch (e) {
    console.error('[WhatsApp] Failed to init Twilio client:', e.message);
    return null;
  }
}

function formatPhone(to) {
  if (!to) return null;
  let formatted = to.toString().replace(/\s/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
  if (!formatted.startsWith('+')) {
    // Italian fallback
    if (formatted.startsWith('3') && formatted.length >= 9) {
      formatted = '+39' + formatted;
    } else if (formatted.startsWith('39')) {
      formatted = '+' + formatted;
    } else {
      formatted = '+39' + formatted;
    }
  }
  return formatted;
}

/**
 * Invia un messaggio WhatsApp via Twilio
 * @param {string} to - Numero destinatario (con o senza +39)
 * @param {string} message - Testo del messaggio
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendWhatsApp(to, message) {
  const client = getTwilioClient();
  if (!client) {
    return { success: false, error: 'Twilio non configurato' };
  }
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!from) {
    return { success: false, error: 'TWILIO_WHATSAPP_NUMBER non configurato' };
  }
  const formatted = formatPhone(to);
  if (!formatted) {
    return { success: false, error: 'Numero destinatario mancante' };
  }
  try {
    const result = await client.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${formatted}`,
      body: message
    });
    console.log(`[WhatsApp] Sent to ${formatted} — SID: ${result.sid}`);
    return { success: true, messageId: result.sid, status: result.status };
  } catch (e) {
    console.error('[WhatsApp] Error sending to', formatted, ':', e.code, e.message);
    let userError = e.message;
    if (e.code === 21608) userError = 'Il numero non è registrato su WhatsApp o non ha accettato i messaggi dal tuo account business.';
    else if (e.code === 21211) userError = 'Numero di telefono non valido.';
    else if (e.code === 21614) userError = 'Numero WhatsApp non verificato per sandbox.';
    return { success: false, error: userError, code: e.code };
  }
}

/**
 * Genera testo WhatsApp per inviti VetBuddy Connect
 */
export function buildInviteWhatsAppText({ type, fromName, inviteLink, message }) {
  const baseTexts = {
    owner_to_clinic: `🐾 *VetBuddy* — *${fromName}* vuole collegare il Passport del suo animale alla tua clinica.\n\nRicevi promemoria, documenti, referti e prenotazioni in modo più semplice.\n\nApri qui: ${inviteLink}`,
    clinic_to_owner: `🐾 *VetBuddy* — *${fromName}* ti invita su VetBuddy!\n\nPrenota visite online, gestisci il Passport del tuo animale, ricevi documenti autorizzati e promemoria automatici.\n\nIscriviti gratis: ${inviteLink}`,
    clinic_to_lab: `🔬 *VetBuddy* — *${fromName}* vuole inviarti richieste digitali e ricevere referti tramite VetBuddy.\n\nEntra gratis nella rete: ${inviteLink}`,
    lab_to_clinic: `🔬 *VetBuddy* — Il laboratorio *${fromName}* è disponibile su VetBuddy.\n\nPuoi inviare richieste, seguire lo stato degli esami e ricevere referti PDF in modo digitale.\n\nApri qui: ${inviteLink}`
  };
  let text = baseTexts[type] || `*VetBuddy* — Hai un invito da ${fromName}.\n\n${inviteLink}`;
  if (message) {
    text += `\n\n_"${message}"_`;
  }
  text += `\n\n— VetBuddy: cliniche, proprietari e laboratori. Tutti collegati.`;
  return text;
}
