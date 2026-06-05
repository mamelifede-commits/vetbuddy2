import { NextResponse } from 'next/server';
import { getCollection } from '../../[[...path]]/modules/db';
import { v4 as uuidv4 } from 'uuid';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };

// Demo WhatsApp messages
const DEMO_WA_MESSAGES = [
  { from: 'Maria Rossi', phone: '+39 333 1234567', petName: 'Luna', text: 'Buongiorno, vorrei prenotare una visita per Luna. Ha problemi di pelle da qualche giorno.', category: 'richiesta_appuntamento', priority: 'media', status: 'unread', timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
  { from: 'Luca Bianchi', phone: '+39 347 9876543', petName: 'Rex', text: 'Salve, Rex deve fare il richiamo del vaccino. Quando avete disponibilità?', category: 'vaccino_richiamo', priority: 'media', status: 'unread', timestamp: new Date(Date.now() - 3 * 3600000).toISOString() },
  { from: 'Anna Verdi', phone: '+39 320 5551234', petName: 'Micio', text: 'Buonasera, posso ritirare il referto delle analisi di Micio? Sono pronte?', category: 'richiesta_referto', priority: 'bassa', status: 'read', timestamp: new Date(Date.now() - 5 * 3600000).toISOString() },
  { from: 'Carlo Neri', phone: '+39 338 7773456', petName: 'Buddy', text: 'URGENTE: Buddy ha ingoiato qualcosa e sta vomitando. Posso venire subito?', category: 'possibile_urgenza', priority: 'alta', status: 'unread', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
  { from: 'Giulia Romano', phone: '+39 348 2223344', petName: 'Nala', text: 'Come sta Nala dopo l\'intervento? Mangia poco.', category: 'followup_post_visita', priority: 'media', status: 'read', timestamp: new Date(Date.now() - 8 * 3600000).toISOString() },
  { from: 'Marco Ferrara', phone: '+39 335 9994455', petName: 'Thor', text: 'Potete inviarmi la ricetta dell\'Apoquel per Thor? Sta finendo.', category: 'richiesta_farmaco', priority: 'media', status: 'unread', timestamp: new Date(Date.now() - 1 * 3600000).toISOString() },
  { from: 'Sara Colombo', phone: '+39 342 1116677', petName: 'Birba', text: 'Avete disponibilità per la sterilizzazione di Birba la prossima settimana?', category: 'richiesta_appuntamento', priority: 'bassa', status: 'read', timestamp: new Date(Date.now() - 24 * 3600000).toISOString() },
  { from: 'Paolo Ricci', phone: '+39 339 8887766', petName: 'Oscar', text: 'Grazie per la visita di ieri! Oscar sta molto meglio. Devo tornare tra 10 giorni?', category: 'followup_post_visita', priority: 'bassa', status: 'read', timestamp: new Date(Date.now() - 12 * 3600000).toISOString() },
  { from: 'Elena Conti', phone: '+39 346 3332211', petName: 'Lilly', text: 'Buongiorno, ho ricevuto il promemoria ma devo spostare l\'appuntamento. Posso venire giovedì?', category: 'richiesta_appuntamento', priority: 'media', status: 'unread', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
  { from: 'Davide Moretti', phone: '+39 344 5554433', petName: 'Rocky', text: 'Rocky ha le orecchie rosse e si gratta. È urgente o posso aspettare domani?', category: 'informazione_generica', priority: 'media', status: 'unread', timestamp: new Date(Date.now() - 2.5 * 3600000).toISOString() },
  { from: 'Federica Gallo', phone: '+39 341 2221100', petName: 'Mia', text: 'Posso avere il certificato di buona salute per Mia? Devo partire per le vacanze.', category: 'richiesta_documento', priority: 'media', status: 'read', timestamp: new Date(Date.now() - 48 * 3600000).toISOString() },
  { from: 'Roberto Costa', phone: '+39 349 7776655', petName: 'Fido', text: 'Fido ha finito l\'antibiotico. Devo continuare la terapia o basta così?', category: 'followup_post_visita', priority: 'media', status: 'unread', timestamp: new Date(Date.now() - 4 * 3600000).toISOString() },
  { from: 'Laura Fontana', phone: '+39 336 4443322', petName: 'Stella', text: 'Quanto costa la pulizia dei denti per un gatto? Stella ha 5 anni.', category: 'informazione_generica', priority: 'bassa', status: 'read', timestamp: new Date(Date.now() - 72 * 3600000).toISOString() },
  { from: 'Simone Villa', phone: '+39 337 6665544', petName: 'Kira', text: 'Ho portato Kira dal toelettatore e ha una cisti. Dovrei farla vedere?', category: 'possibile_urgenza', priority: 'alta', status: 'unread', timestamp: new Date(Date.now() - 90 * 60000).toISOString() },
  { from: 'Teresa Lombardi', phone: '+39 343 8887700', petName: 'Pallina', text: 'Pallina deve fare il passaporto per viaggiare in Grecia. Quali documenti servono?', category: 'richiesta_documento', priority: 'bassa', status: 'read', timestamp: new Date(Date.now() - 96 * 3600000).toISOString() },
  { from: 'Giuseppe Marini', phone: '+39 340 1110099', petName: 'Leo', text: 'Buongiorno, Leo pesa 45kg e zoppica da ieri. Posso avere un appuntamento urgente?', category: 'richiesta_appuntamento', priority: 'alta', status: 'unread', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
  { from: 'Chiara Rizzo', phone: '+39 345 3332244', petName: 'Minù', text: 'Grazie mille per la cura! Minù è tornata a mangiare normalmente. Siete fantastici!', category: 'followup_post_visita', priority: 'bassa', status: 'read', timestamp: new Date(Date.now() - 36 * 3600000).toISOString() },
  { from: 'Andrea Santini', phone: '+39 331 9998877', petName: 'Zeus', text: 'Zeus ha un appuntamento domani alle 10. Confermo la presenza.', category: 'richiesta_appuntamento', priority: 'bassa', status: 'read', timestamp: new Date(Date.now() - 20 * 3600000).toISOString() },
  { from: 'Valentina De Luca', phone: '+39 332 7776600', petName: 'Toby', text: 'Avete il cibo gastro intestinal Royal Canin in clinica? Toby lo sta finendo.', category: 'informazione_generica', priority: 'bassa', status: 'read', timestamp: new Date(Date.now() - 50 * 3600000).toISOString() },
  { from: 'Matteo Esposito', phone: '+39 334 5554488', petName: 'Pepe', text: 'Salve, Pepe ha 3 mesi e deve iniziare le vaccinazioni. Quali sono i costi?', category: 'vaccino_richiamo', priority: 'media', status: 'unread', timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
];

// Demo WA Templates
const DEMO_WA_TEMPLATES = [
  { id: 'confirm_appt', name: 'Conferma appuntamento', category: 'appointment', text: 'Ciao {{nome}}! ✅ Confermato il tuo appuntamento per {{animale}} il {{data}} alle {{ora}}. Ti aspettiamo in clinica! — {{clinica}}', active: true },
  { id: 'remind_24h', name: 'Promemoria 24h', category: 'reminder', text: 'Ciao {{nome}}! 🔔 Ti ricordiamo che domani {{data}} alle {{ora}} hai un appuntamento per {{animale}}. Rispondi CONFERMO o DISDICI. — {{clinica}}', active: true },
  { id: 'remind_1h', name: 'Promemoria 1 ora prima', category: 'reminder', text: 'Ciao {{nome}}! ⏰ Tra 1 ora hai l\'appuntamento per {{animale}}. Ti aspettiamo! — {{clinica}}', active: true },
  { id: 'vaccine_recall', name: 'Richiamo vaccino', category: 'health', text: 'Ciao {{nome}}! 💉 È il momento del richiamo vaccinale per {{animale}}. Prenota su VetBuddy o rispondi a questo messaggio. — {{clinica}}', active: true },
  { id: 'doc_ready', name: 'Documento disponibile', category: 'document', text: 'Ciao {{nome}}! 📄 Un nuovo documento per {{animale}} è disponibile nella tua area VetBuddy. Accedi per scaricarlo. — {{clinica}}', active: true },
  { id: 'report_ready', name: 'Referto pronto', category: 'document', text: 'Ciao {{nome}}! 🧪 I risultati delle analisi di {{animale}} sono pronti. Accedi a VetBuddy per visualizzarli. — {{clinica}}', active: true },
  { id: 'followup', name: 'Follow-up post-visita', category: 'followup', text: 'Ciao {{nome}}! 🐾 Come sta {{animale}} dopo la visita? Se hai domande o dubbi, non esitare a scriverci. — {{clinica}}', active: true },
  { id: 'review_request', name: 'Richiesta recensione', category: 'review', text: 'Ciao {{nome}}! 😊 Speriamo che la visita di {{animale}} sia andata bene. Ti va di lasciarci una recensione? {{link}} — {{clinica}}', active: true },
  { id: 'passport_invite', name: 'Invito Passport', category: 'passport', text: 'Ciao {{nome}}! 🐾 Completa il VetBuddy Passport di {{animale}}: QR emergenza, vaccini, allergie — tutto in un unico posto digitale! {{link}} — {{clinica}}', active: true },
  { id: 'noshow_recovery', name: 'Recupero no-show', category: 'noshow', text: 'Ciao {{nome}}! Ci è dispiaciuto non vederti oggi per l\'appuntamento di {{animale}}. Vuoi riprogrammare? Rispondi a questo messaggio. — {{clinica}}', active: false },
];

// Demo no-show data
const DEMO_NOSHOW = {
  unconfirmed: [
    { id: uuidv4(), ownerName: 'Maria Rossi', petName: 'Luna', date: new Date(Date.now() + 24*3600000).toISOString(), time: '10:00', reason: 'Controllo pelle', risk: 'medio', confirmStatus: 'pending', remindersSent: 1 },
    { id: uuidv4(), ownerName: 'Luca Bianchi', petName: 'Rex', date: new Date(Date.now() + 24*3600000).toISOString(), time: '11:30', reason: 'Richiamo vaccino', risk: 'basso', confirmStatus: 'pending', remindersSent: 2 },
    { id: uuidv4(), ownerName: 'Carlo Neri', petName: 'Buddy', date: new Date(Date.now() + 48*3600000).toISOString(), time: '09:00', reason: 'Visita generale', risk: 'alto', confirmStatus: 'pending', remindersSent: 3 },
    { id: uuidv4(), ownerName: 'Elena Conti', petName: 'Lilly', date: new Date(Date.now() + 24*3600000).toISOString(), time: '14:00', reason: 'Sterilizzazione', risk: 'basso', confirmStatus: 'pending', remindersSent: 1 },
    { id: uuidv4(), ownerName: 'Giuseppe Marini', petName: 'Leo', date: new Date(Date.now() + 72*3600000).toISOString(), time: '16:00', reason: 'Zoppia', risk: 'medio', confirmStatus: 'pending', remindersSent: 0 },
    { id: uuidv4(), ownerName: 'Davide Moretti', petName: 'Rocky', date: new Date(Date.now() + 24*3600000).toISOString(), time: '15:30', reason: 'Controllo orecchie', risk: 'alto', confirmStatus: 'no_response', remindersSent: 3 },
    { id: uuidv4(), ownerName: 'Matteo Esposito', petName: 'Pepe', date: new Date(Date.now() + 48*3600000).toISOString(), time: '10:30', reason: 'Prima vaccinazione', risk: 'basso', confirmStatus: 'pending', remindersSent: 1 },
    { id: uuidv4(), ownerName: 'Simone Villa', petName: 'Kira', date: new Date(Date.now() + 24*3600000).toISOString(), time: '17:00', reason: 'Cisti cutanea', risk: 'medio', confirmStatus: 'pending', remindersSent: 2 },
    { id: uuidv4(), ownerName: 'Roberto Costa', petName: 'Fido', date: new Date(Date.now() + 96*3600000).toISOString(), time: '09:30', reason: 'Follow-up antibiotico', risk: 'basso', confirmStatus: 'pending', remindersSent: 0 },
    { id: uuidv4(), ownerName: 'Sara Colombo', petName: 'Birba', date: new Date(Date.now() + 120*3600000).toISOString(), time: '11:00', reason: 'Consulto sterilizzazione', risk: 'basso', confirmStatus: 'pending', remindersSent: 0 },
    { id: uuidv4(), ownerName: 'Laura Fontana', petName: 'Stella', date: new Date(Date.now() + 24*3600000).toISOString(), time: '12:00', reason: 'Pulizia denti', risk: 'alto', confirmStatus: 'no_response', remindersSent: 3 },
    { id: uuidv4(), ownerName: 'Federica Gallo', petName: 'Mia', date: new Date(Date.now() + 48*3600000).toISOString(), time: '14:30', reason: 'Certificato salute', risk: 'medio', confirmStatus: 'pending', remindersSent: 1 },
  ],
  noshowHistory: [
    { ownerName: 'Carlo Neri', petName: 'Buddy', date: new Date(Date.now() - 7*86400000).toISOString(), reason: 'Visita controllo', lostRevenue: 45 },
    { ownerName: 'Davide Moretti', petName: 'Rocky', date: new Date(Date.now() - 14*86400000).toISOString(), reason: 'Dermatologia', lostRevenue: 65 },
    { ownerName: 'Laura Fontana', petName: 'Stella', date: new Date(Date.now() - 3*86400000).toISOString(), reason: 'Vaccinazione', lostRevenue: 35 },
    { ownerName: 'Carlo Neri', petName: 'Buddy', date: new Date(Date.now() - 30*86400000).toISOString(), reason: 'Ecografia', lostRevenue: 90 },
    { ownerName: 'Davide Moretti', petName: 'Rocky', date: new Date(Date.now() - 45*86400000).toISOString(), reason: 'Controllo allergia', lostRevenue: 55 },
  ],
  waitlist: [
    { ownerName: 'Teresa Lombardi', petName: 'Pallina', requestedDate: 'Prima possibile', reason: 'Passaporto viaggi', priority: 'media', addedAt: new Date(Date.now() - 48*3600000).toISOString() },
    { ownerName: 'Chiara Rizzo', petName: 'Minù', requestedDate: 'Prossima settimana', reason: 'Controllo post-cura', priority: 'bassa', addedAt: new Date(Date.now() - 24*3600000).toISOString() },
    { ownerName: 'Valentina De Luca', petName: 'Toby', requestedDate: 'Mercoledì/Giovedì', reason: 'Problemi gastrointestinali', priority: 'alta', addedAt: new Date(Date.now() - 6*3600000).toISOString() },
    { ownerName: 'Andrea Santini', petName: 'Zeus', requestedDate: 'Questa settimana', reason: 'Visita annuale', priority: 'bassa', addedAt: new Date(Date.now() - 72*3600000).toISOString() },
    { ownerName: 'Marco Ferrara', petName: 'Thor', requestedDate: 'Urgente', reason: 'Rinnovo ricetta', priority: 'alta', addedAt: new Date(Date.now() - 2*3600000).toISOString() },
    { ownerName: 'Paolo Ricci', petName: 'Oscar', requestedDate: 'Fine mese', reason: 'Visita ortopedica', priority: 'media', addedAt: new Date(Date.now() - 96*3600000).toISOString() },
    { ownerName: 'Giulia Romano', petName: 'Nala', requestedDate: 'Questa settimana', reason: 'Controllo post-operatorio', priority: 'alta', addedAt: new Date(Date.now() - 12*3600000).toISOString() },
    { ownerName: 'Anna Verdi', petName: 'Micio', requestedDate: 'Qualsiasi giorno', reason: 'Analisi sangue', priority: 'media', addedAt: new Date(Date.now() - 168*3600000).toISOString() },
  ],
  recoveredSlots: [
    { originalOwner: 'Carlo Neri', newOwner: 'Teresa Lombardi', date: new Date(Date.now() - 2*86400000).toISOString(), time: '10:00', reason: 'Passaporto viaggi', recoveredValue: 55 },
    { originalOwner: 'Laura Fontana', newOwner: 'Valentina De Luca', date: new Date(Date.now() - 5*86400000).toISOString(), time: '14:00', reason: 'Visita gastro', recoveredValue: 65 },
    { originalOwner: 'Davide Moretti', newOwner: 'Marco Ferrara', date: new Date(Date.now() - 8*86400000).toISOString(), time: '11:30', reason: 'Rinnovo ricetta', recoveredValue: 30 },
    { originalOwner: 'Carlo Neri', newOwner: 'Andrea Santini', date: new Date(Date.now() - 12*86400000).toISOString(), time: '09:00', reason: 'Visita annuale', recoveredValue: 45 },
    { originalOwner: 'Laura Fontana', newOwner: 'Giulia Romano', date: new Date(Date.now() - 15*86400000).toISOString(), time: '16:00', reason: 'Post-operatorio', recoveredValue: 50 },
    { originalOwner: 'Davide Moretti', newOwner: 'Anna Verdi', date: new Date(Date.now() - 20*86400000).toISOString(), time: '15:00', reason: 'Analisi sangue', recoveredValue: 40 },
  ],
  ownerLabels: {
    'Carlo Neri': 'alto_rischio', 'Davide Moretti': 'alto_rischio', 'Laura Fontana': 'attenzione',
    'Maria Rossi': 'affidabile', 'Luca Bianchi': 'affidabile', 'Giulia Romano': 'affidabile',
    'Elena Conti': 'affidabile', 'Giuseppe Marini': 'affidabile', 'Sara Colombo': 'affidabile',
  },
};

// Demo review/referral data
const DEMO_REVIEWS = {
  requests: [
    { ownerName: 'Paolo Ricci', petName: 'Oscar', sentAt: new Date(Date.now() - 2*86400000).toISOString(), status: 'completed', rating: 5, channel: 'whatsapp' },
    { ownerName: 'Chiara Rizzo', petName: 'Minù', sentAt: new Date(Date.now() - 5*86400000).toISOString(), status: 'completed', rating: 5, channel: 'email' },
    { ownerName: 'Maria Rossi', petName: 'Luna', sentAt: new Date(Date.now() - 3*86400000).toISOString(), status: 'completed', rating: 4, channel: 'whatsapp' },
    { ownerName: 'Andrea Santini', petName: 'Zeus', sentAt: new Date(Date.now() - 7*86400000).toISOString(), status: 'completed', rating: 5, channel: 'email' },
    { ownerName: 'Valentina De Luca', petName: 'Toby', sentAt: new Date(Date.now() - 10*86400000).toISOString(), status: 'completed', rating: 3, channel: 'whatsapp' },
    { ownerName: 'Giulia Romano', petName: 'Nala', sentAt: new Date(Date.now() - 4*86400000).toISOString(), status: 'completed', rating: 5, channel: 'email' },
    { ownerName: 'Sara Colombo', petName: 'Birba', sentAt: new Date(Date.now() - 8*86400000).toISOString(), status: 'completed', rating: 4, channel: 'whatsapp' },
    { ownerName: 'Roberto Costa', petName: 'Fido', sentAt: new Date(Date.now() - 1*86400000).toISOString(), status: 'completed', rating: 5, channel: 'email' },
    { ownerName: 'Elena Conti', petName: 'Lilly', sentAt: new Date(Date.now() - 6*86400000).toISOString(), status: 'pending', channel: 'whatsapp' },
    { ownerName: 'Luca Bianchi', petName: 'Rex', sentAt: new Date(Date.now() - 12*86400000).toISOString(), status: 'pending', channel: 'email' },
    { ownerName: 'Federica Gallo', petName: 'Mia', sentAt: new Date(Date.now() - 9*86400000).toISOString(), status: 'pending', channel: 'whatsapp' },
    { ownerName: 'Davide Moretti', petName: 'Rocky', sentAt: new Date(Date.now() - 15*86400000).toISOString(), status: 'pending', channel: 'email' },
    { ownerName: 'Marco Ferrara', petName: 'Thor', sentAt: new Date(Date.now() - 11*86400000).toISOString(), status: 'not_sent', channel: 'whatsapp' },
    { ownerName: 'Giuseppe Marini', petName: 'Leo', sentAt: new Date(Date.now() - 14*86400000).toISOString(), status: 'not_sent', channel: 'email' },
    { ownerName: 'Teresa Lombardi', petName: 'Pallina', sentAt: new Date(Date.now() - 20*86400000).toISOString(), status: 'not_sent', channel: 'whatsapp' },
  ],
  referrals: [
    { referrerName: 'Maria Rossi', code: 'MARIA-VB2026', invitesSent: 3, converted: 1, newClientName: 'Silvia Marchetti', reward: 'Sconto 15% prossima visita', status: 'converted', date: new Date(Date.now() - 20*86400000).toISOString() },
    { referrerName: 'Giulia Romano', code: 'GIULIA-VB2026', invitesSent: 5, converted: 1, newClientName: 'Alberto Mancini', reward: 'Controllo gratuito', status: 'converted', date: new Date(Date.now() - 15*86400000).toISOString() },
    { referrerName: 'Paolo Ricci', code: 'PAOLO-VB2026', invitesSent: 2, converted: 1, newClientName: 'Francesca Vitale', reward: 'Sconto 15% prossima visita', status: 'converted', date: new Date(Date.now() - 10*86400000).toISOString() },
    { referrerName: 'Andrea Santini', code: 'ANDREA-VB2026', invitesSent: 4, converted: 0, status: 'pending', date: new Date(Date.now() - 7*86400000).toISOString() },
    { referrerName: 'Sara Colombo', code: 'SARA-VB2026', invitesSent: 1, converted: 0, status: 'pending', date: new Date(Date.now() - 3*86400000).toISOString() },
  ],
};

// Demo pilot data
const DEMO_PILOT = {
  startDate: new Date(Date.now() - 30*86400000).toISOString(),
  currentDay: 30,
  onboarding: [
    { step: 'Crea account clinica', done: true, day: 1 },
    { step: 'Importa primi 10 proprietari', done: true, day: 2 },
    { step: 'Configura orari disponibilità', done: true, day: 3 },
    { step: 'Configura servizi e listino', done: true, day: 3 },
    { step: 'Invia primo invito proprietario', done: true, day: 4 },
    { step: 'Crea primo appuntamento online', done: true, day: 5 },
    { step: 'Attiva promemoria WhatsApp', done: true, day: 6 },
    { step: 'Completa profilo clinica e posizione', done: true, day: 7 },
    { step: 'Attiva Reception AI', done: false, day: null },
    { step: 'Configura No-Show Recovery', done: false, day: null },
  ],
  metrics30: { onlineBookings: 47, callsAvoided: 38, remindersSent: 156, timeSavedHours: 12, reactivatedClients: 5, noshowAvoided: 8, slotsRecovered: 6, reviewsRequested: 15, reviewsGenerated: 8, referralsGenerated: 5, estimatedValue: 2850, roi: 285 },
  metrics60: { onlineBookings: 112, callsAvoided: 89, remindersSent: 340, timeSavedHours: 28, reactivatedClients: 12, noshowAvoided: 18, slotsRecovered: 14, reviewsRequested: 32, reviewsGenerated: 19, referralsGenerated: 9, estimatedValue: 6420, roi: 428 },
  metrics90: { onlineBookings: 198, callsAvoided: 165, remindersSent: 520, timeSavedHours: 48, reactivatedClients: 22, noshowAvoided: 31, slotsRecovered: 24, reviewsRequested: 52, reviewsGenerated: 35, referralsGenerated: 15, estimatedValue: 11850, roi: 592 },
};

// Demo import/export
const DEMO_IMPORTS = [
  { id: uuidv4(), type: 'proprietari', fileName: 'clienti_export_2026.csv', rows: 156, imported: 152, errors: 4, status: 'completata', date: new Date(Date.now() - 25*86400000).toISOString() },
  { id: uuidv4(), type: 'animali', fileName: 'animali_clinica.csv', rows: 230, imported: 230, errors: 0, status: 'completata', date: new Date(Date.now() - 25*86400000).toISOString() },
  { id: uuidv4(), type: 'appuntamenti', fileName: 'agenda_giugno.csv', rows: 45, imported: 42, errors: 3, status: 'parziale', date: new Date(Date.now() - 10*86400000).toISOString() },
];

const DEMO_EXPORTS = [
  { id: uuidv4(), type: 'proprietari', rows: 156, status: 'pronta', date: new Date(Date.now() - 2*86400000).toISOString() },
  { id: uuidv4(), type: 'animali', rows: 230, status: 'pronta', date: new Date(Date.now() - 2*86400000).toISOString() },
  { id: uuidv4(), type: 'appuntamenti', rows: 312, status: 'pronta', date: new Date(Date.now() - 1*86400000).toISOString() },
  { id: uuidv4(), type: 'report_pilota', rows: 1, status: 'pronta', date: new Date(Date.now() - 86400000).toISOString() },
  { id: uuidv4(), type: 'riepiloghi_economici', rows: 90, status: 'pronta', date: new Date().toISOString() },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const module = searchParams.get('module');

  if (module === 'whatsapp-messages') {
    return NextResponse.json({ messages: DEMO_WA_MESSAGES, templates: DEMO_WA_TEMPLATES }, { headers: corsHeaders });
  }
  if (module === 'whatsapp-templates') {
    return NextResponse.json({ templates: DEMO_WA_TEMPLATES }, { headers: corsHeaders });
  }
  if (module === 'noshow') {
    return NextResponse.json(DEMO_NOSHOW, { headers: corsHeaders });
  }
  if (module === 'reviews') {
    return NextResponse.json(DEMO_REVIEWS, { headers: corsHeaders });
  }
  if (module === 'pilot') {
    return NextResponse.json(DEMO_PILOT, { headers: corsHeaders });
  }
  if (module === 'imports') {
    return NextResponse.json({ imports: DEMO_IMPORTS, exports: DEMO_EXPORTS }, { headers: corsHeaders });
  }
  if (module === 'value-dashboard') {
    return NextResponse.json({
      metrics: DEMO_PILOT.metrics30,
      history: {
        weeks: ['Sett 1','Sett 2','Sett 3','Sett 4'],
        onlineBookings: [8, 12, 13, 14],
        callsAvoided: [6, 9, 11, 12],
        noshow: [4, 3, 1, 0],
        reviews: [1, 2, 3, 2],
        reactivated: [1, 1, 2, 1],
      }
    }, { headers: corsHeaders });
  }

  return NextResponse.json({ error: 'Module not found' }, { status: 404, headers: corsHeaders });
}

export async function POST(request) {
  return NextResponse.json({ success: true }, { headers: corsHeaders });
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
