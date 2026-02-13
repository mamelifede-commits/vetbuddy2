import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { verifyToken, getUserFromRequest } from '@/lib/auth';

// Default automation settings
const DEFAULT_SETTINGS = {
  // === EMAIL AUTOMATICHE ===
  appointmentReminders: true,      // Promemoria appuntamenti 24h prima
  bookingConfirmation: true,       // Conferma prenotazione immediata
  vaccineRecalls: true,            // Richiamo vaccini 30 giorni prima
  postVisitFollowup: true,         // Follow-up post visita 48h dopo
  
  // === GESTIONE SMART ===
  noShowDetection: true,           // No-show detection automatica
  waitlistNotification: true,      // Notifica slot liberi da lista attesa
  suggestedSlots: true,            // Slot suggeriti basato su storico
  documentReminders: true,         // Reminder documenti mancanti
  
  // === MESSAGGI & REPORT ===
  autoTicketAssignment: true,      // Auto-assegnazione ticket per categoria
  aiQuickReplies: true,            // Risposte rapide AI suggerite
  urgencyNotifications: true,      // Notifiche urgenze priorità automatica
  weeklyReport: true,              // Report settimanale ogni lunedì
  
  // === ENGAGEMENT & FIDELIZZAZIONE ===
  petBirthday: true,               // Auguri compleanno pet
  reviewRequest: true,             // Richiesta recensione post-visita
  inactiveClientReactivation: true, // Riattivazione clienti inattivi (6+ mesi)
  
  // === SALUTE & PREVENZIONE ===
  antiparasiticReminder: true,     // Promemoria antiparassitari
  annualCheckup: true,             // Reminder controllo annuale
  medicationRefill: true,          // Avviso refill farmaci cronici
  weightAlert: true,               // Alert variazioni peso significative
  dentalHygiene: true,             // Promemoria igiene dentale annuale
  
  // === OPERATIVITÀ CLINICA ===
  appointmentConfirmation: true,   // Richiesta conferma 48h prima
  labResultsReady: true,           // Notifica referti pronti
  paymentReminder: true,           // Reminder fatture non pagate
  postSurgeryFollowup: true,       // Follow-up specifico post-chirurgia
  
  // === STAGIONALI ===
  summerHeatAlert: true,           // Alert caldo estivo (giugno-agosto)
  tickSeasonAlert: true,           // Alert stagione zecche (marzo-maggio)
  newYearFireworksAlert: true,     // Consigli botti capodanno (dicembre)
  
  // === COMUNICAZIONE MULTI-CANALE ===
  whatsappReminders: false,        // Promemoria via WhatsApp (richiede integrazione)
  smsEmergency: false,             // SMS per emergenze (richiede crediti SMS)
  
  // === CICLO DI VITA PET ===
  sterilizationReminder: true,     // Promemoria sterilizzazione cuccioli 6-12 mesi
  seniorPetCare: true,             // Checkup speciali pet over 7 anni
  microchipCheck: true,            // Verifica annuale dati microchip
  welcomeNewPet: true,             // Sequenza benvenuto nuovi clienti
  
  // === INTELLIGENZA ARTIFICIALE ===
  aiLabExplanation: true,          // Spiegazione referti in linguaggio semplice
  breedRiskAlert: true,            // Alert patologie comuni per razza
  dietSuggestions: true,           // Suggerimenti dieta per specie/età/peso
  
  // === BUSINESS & FIDELIZZAZIONE ===
  loyaltyProgram: true,            // Punti e sconti dopo X visite
  referralProgram: true,           // Sconto per chi porta amici
  holidayClosures: true,           // Avviso chiusure festive
  
  // === SITUAZIONI DELICATE ===
  petCondolences: true,            // Messaggio condoglianze
  griefFollowup: true,             // Follow-up supporto dopo 1 mese
  
  // === PER LA CLINICA ===
  dailySummary: true,              // Riepilogo giornaliero serale
  lowStockAlert: true,             // Alert scorte basse
  staffBirthday: true              // Ricorda compleanni staff
};

// Automazioni incluse nel piano Starter (gratuite ma essenziali)
const STARTER_AUTOMATIONS = [
  'appointmentReminders',    // Promemoria appuntamenti 24h prima
  'bookingConfirmation',     // Conferma prenotazione
  'welcomeNewPet',           // Benvenuto nuovo pet
  'petBirthday',             // Compleanno pet (fidelizzazione)
  'appointmentConfirmation'  // Conferma appuntamento
];

// Automazioni incluse nel piano Pro (tutto di Starter + avanzate)
const PRO_AUTOMATIONS = [
  ...STARTER_AUTOMATIONS,
  'vaccineRecalls', 'postVisitFollowup', 'noShowDetection', 'waitlistNotification',
  'suggestedSlots', 'documentReminders', 'autoTicketAssignment', 'urgencyNotifications',
  'weeklyReport', 'reviewRequest', 'inactiveClientReactivation', 'antiparasiticReminder',
  'annualCheckup', 'labResultsReady', 'paymentReminder', 'postSurgeryFollowup',
  'aiQuickReplies', 'medicationRefill', 'weightAlert', 'dentalHygiene'
];

// GET - Retrieve automation settings for the authenticated clinic
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (user.role !== 'clinic') {
      return NextResponse.json({ error: 'Solo le cliniche possono gestire le automazioni' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    const clinic = await db.collection('users').findOne({ id: user.id });
    
    // Return existing settings or defaults
    const settings = clinic?.automationSettings || DEFAULT_SETTINGS;
    
    // Get plan info
    const plan = clinic?.subscriptionPlan || 'starter';
    const planLimits = clinic?.planLimits || {};
    
    // Determine which automations are allowed based on plan
    let allowedAutomations = [];
    let automationsCount = 0;
    
    if (plan === 'custom' || plan === 'enterprise') {
      allowedAutomations = 'all';
      automationsCount = 44;
    } else if (plan === 'pro') {
      // Pro plan: all Pro automations allowed
      allowedAutomations = PRO_AUTOMATIONS;
      automationsCount = PRO_AUTOMATIONS.length;
    } else {
      // Starter: 5 basic automations
      allowedAutomations = STARTER_AUTOMATIONS;
      automationsCount = STARTER_AUTOMATIONS.length;
    }

    return NextResponse.json({
      success: true,
      settings: {
        ...DEFAULT_SETTINGS,
        ...settings
      },
      plan,
      planLimits,
      allowedAutomations,
      automationsCount,
      starterAutomations: STARTER_AUTOMATIONS
    });
  } catch (error) {
    console.error('Error getting automation settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update automation settings for the authenticated clinic
export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (user.role !== 'clinic') {
      return NextResponse.json({ error: 'Solo le cliniche possono gestire le automazioni' }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Impostazioni non valide' }, { status: 400 });
    }

    // Validate that all keys are valid automation settings
    const validKeys = Object.keys(DEFAULT_SETTINGS);
    const sanitizedSettings = {};
    
    for (const key of validKeys) {
      if (key in settings) {
        sanitizedSettings[key] = Boolean(settings[key]);
      }
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    await db.collection('users').updateOne(
      { id: user.id },
      { 
        $set: { 
          automationSettings: sanitizedSettings,
          automationSettingsUpdatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Impostazioni salvate con successo',
      settings: sanitizedSettings
    });
  } catch (error) {
    console.error('Error updating automation settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Update a single automation setting (convenience endpoint)
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    if (user.role !== 'clinic') {
      return NextResponse.json({ error: 'Solo le cliniche possono gestire le automazioni' }, { status: 403 });
    }

    const body = await request.json();
    const { key, enabled } = body;

    if (!key || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Parametri non validi' }, { status: 400 });
    }

    // Validate key
    if (!(key in DEFAULT_SETTINGS)) {
      return NextResponse.json({ error: 'Impostazione non riconosciuta' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');

    await db.collection('users').updateOne(
      { id: user.id },
      { 
        $set: { 
          [`automationSettings.${key}`]: enabled,
          automationSettingsUpdatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({
      success: true,
      message: `Automazione "${key}" ${enabled ? 'attivata' : 'disattivata'}`,
      key,
      enabled
    });
  } catch (error) {
    console.error('Error updating single automation setting:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
