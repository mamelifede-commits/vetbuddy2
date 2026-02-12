import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { verifyToken, getUserFromRequest } from '@/lib/auth';

// Default automation settings
const DEFAULT_SETTINGS = {
  appointmentReminders: true,      // Promemoria appuntamenti 24h prima
  bookingConfirmation: true,       // Conferma prenotazione immediata
  vaccineRecalls: true,            // Richiamo vaccini 30 giorni prima
  postVisitFollowup: true,         // Follow-up post visita 48h dopo
  noShowDetection: true,           // No-show detection automatica
  waitlistNotification: true,      // Notifica slot liberi da lista attesa
  suggestedSlots: true,            // Slot suggeriti basato su storico
  documentReminders: true,         // Reminder documenti mancanti
  autoTicketAssignment: true,      // Auto-assegnazione ticket per categoria
  aiQuickReplies: true,            // Risposte rapide AI suggerite
  urgencyNotifications: true,      // Notifiche urgenze priorità automatica
  weeklyReport: true               // Report settimanale ogni lunedì
};

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

    return NextResponse.json({
      success: true,
      settings: {
        ...DEFAULT_SETTINGS,
        ...settings
      }
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
