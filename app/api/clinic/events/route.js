import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Verify JWT token
function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  try {
    const token = authHeader.substring(7);
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Eventi veterinari italiani aggiornati (fonti: SCIVAC, FNOVI, AIVPA, etc.)
// In produzione questi verrebbero aggiornati periodicamente da un cron job
const getDefaultEvents = () => [
  {
    id: 'scivac-2026',
    title: 'Congresso Nazionale SCIVAC 2026',
    organizer: 'SCIVAC',
    date: '2026-03-15',
    endDate: '2026-03-17',
    location: 'Rimini Fiera',
    type: 'congresso',
    description: 'Il più grande congresso veterinario italiano con oltre 5000 partecipanti. Sessioni plenarie, workshop pratici e area espositiva.',
    url: 'https://www.scivac.it',
    topics: ['Medicina interna', 'Chirurgia', 'Dermatologia', 'Ortopedia'],
    ecm: true,
    ecmCredits: 24,
    image: '🏛️',
    featured: true,
    source: 'scivac'
  },
  {
    id: 'aivpa-eco-2026',
    title: 'Corso Avanzato di Ecografia Addominale',
    organizer: 'AIVPA',
    date: '2026-02-28',
    endDate: '2026-03-01',
    location: 'Milano - Hotel Marriott',
    type: 'corso',
    description: 'Corso pratico con esercitazioni su animali vivi. Massimo 20 partecipanti per garantire qualità formativa.',
    url: 'https://www.aivpa.it',
    topics: ['Ecografia', 'Diagnostica per immagini'],
    ecm: true,
    ecmCredits: 12,
    image: '🔬',
    featured: false,
    source: 'aivpa'
  },
  {
    id: 'cardiovet-webinar-2026',
    title: 'Webinar: Novità in Cardiologia Veterinaria 2026',
    organizer: 'CARDIOVET',
    date: '2026-02-20',
    endDate: '2026-02-20',
    location: 'Online',
    type: 'webinar',
    description: 'Le ultime novità nella diagnosi e terapia delle cardiopatie. Focus su ecocardiografia avanzata e terapie innovative.',
    url: 'https://www.cardiovet.it',
    topics: ['Cardiologia', 'Ecocardiografia', 'Farmacologia'],
    ecm: true,
    ecmCredits: 4,
    image: '💻',
    featured: false,
    source: 'cardiovet'
  },
  {
    id: 'fnovi-day-2026',
    title: 'FNOVI Day 2026',
    organizer: 'FNOVI',
    date: '2026-04-10',
    endDate: '2026-04-10',
    location: 'Roma - Auditorium Parco della Musica',
    type: 'congresso',
    description: 'Giornata nazionale della professione veterinaria. Aggiornamenti normativi, deontologici e sulla professione.',
    url: 'https://www.fnovi.it',
    topics: ['Deontologia', 'Normativa', 'Professione'],
    ecm: true,
    ecmCredits: 8,
    image: '🎓',
    featured: true,
    source: 'fnovi'
  },
  {
    id: 'siodov-workshop-2026',
    title: 'Workshop Odontostomatologia Veterinaria',
    organizer: 'SIODOV',
    date: '2026-05-22',
    endDate: '2026-05-23',
    location: 'Torino - Centro Congressi',
    type: 'workshop',
    description: 'Pratica intensiva su modelli anatomici e casi clinici reali. Tecniche di estrazione e chirurgia orale.',
    url: 'https://www.siodov.it',
    topics: ['Odontostomatologia', 'Chirurgia orale'],
    ecm: true,
    ecmCredits: 16,
    image: '🦷',
    featured: false,
    source: 'siodov'
  },
  {
    id: 'sivae-esotici-2026',
    title: 'Congresso SIVAE - Animali Esotici',
    organizer: 'SIVAE',
    date: '2026-06-05',
    endDate: '2026-06-07',
    location: 'Bologna Fiere',
    type: 'congresso',
    description: 'Tutto sugli animali esotici: rettili, uccelli, piccoli mammiferi. Workshop pratici e sessioni plenarie.',
    url: 'https://www.sivae.it',
    topics: ['Animali esotici', 'Rettili', 'Uccelli', 'Piccoli mammiferi'],
    ecm: true,
    ecmCredits: 20,
    image: '🦎',
    featured: false,
    source: 'sivae'
  },
  {
    id: 'scivac-derma-2026',
    title: 'Seminario SCIVAC Dermatologia',
    organizer: 'SCIVAC',
    date: '2026-04-25',
    endDate: '2026-04-26',
    location: 'Cremona - Palazzo Trecchi',
    type: 'corso',
    description: 'Approfondimento sulle patologie dermatologiche più frequenti. Diagnosi differenziale e terapie innovative.',
    url: 'https://www.scivac.it',
    topics: ['Dermatologia', 'Allergologia', 'Diagnostica'],
    ecm: true,
    ecmCredits: 10,
    image: '🔍',
    featured: false,
    source: 'scivac'
  },
  {
    id: 'unisvet-anestesia-2026',
    title: 'Corso di Anestesia e Rianimazione',
    organizer: 'UNISVET',
    date: '2026-03-28',
    endDate: '2026-03-29',
    location: 'Milano - Università',
    type: 'corso',
    description: 'Corso teorico-pratico su anestesia generale e loco-regionale. Gestione delle emergenze.',
    url: 'https://www.unisvet.it',
    topics: ['Anestesia', 'Rianimazione', 'Emergenze'],
    ecm: true,
    ecmCredits: 14,
    image: '🏥',
    featured: false,
    source: 'unisvet'
  },
  {
    id: 'aivpafe-2026',
    title: 'Congresso AIVPAFE - Felini',
    organizer: 'AIVPAFE',
    date: '2026-09-12',
    endDate: '2026-09-14',
    location: 'Verona - Palaexpo',
    type: 'congresso',
    description: 'Congresso dedicato alla medicina felina. Le ultime ricerche e tecniche per la cura dei gatti.',
    url: 'https://www.aivpafe.it',
    topics: ['Medicina felina', 'Comportamento', 'Nutrizione'],
    ecm: true,
    ecmCredits: 18,
    image: '🐱',
    featured: true,
    source: 'aivpafe'
  },
  {
    id: 'sive-equini-2026',
    title: 'Congresso SIVE - Equini',
    organizer: 'SIVE',
    date: '2026-10-20',
    endDate: '2026-10-22',
    location: 'Verona Fiere',
    type: 'congresso',
    description: 'Il principale evento italiano sulla medicina equina. Sport horse medicine, riproduzione e ortopedia.',
    url: 'https://www.sive.it',
    topics: ['Medicina equina', 'Ortopedia', 'Riproduzione'],
    ecm: true,
    ecmCredits: 22,
    image: '🐴',
    featured: false,
    source: 'sive'
  }
];

// GET - Get all events (default + saved by clinic)
export async function GET(request) {
  const user = verifyToken(request);
  
  // Events are public, but saved events are user-specific
  const defaultEvents = getDefaultEvents();
  
  if (!user) {
    // Return only public events without saved status
    return NextResponse.json({ 
      success: true, 
      events: defaultEvents.map(e => ({ ...e, saved: false }))
    }, { headers: corsHeaders });
  }

  let client;
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db('vetbuddy');
    
    // Get user's saved events
    const savedEvents = await db.collection('saved_events')
      .find({ clinicId: user.id })
      .toArray();
    
    const savedEventIds = new Set(savedEvents.map(e => e.eventId));
    
    // Merge default events with saved status
    const eventsWithSavedStatus = defaultEvents.map(event => ({
      ...event,
      saved: savedEventIds.has(event.id)
    }));
    
    // Get custom events added by this clinic
    const customEvents = await db.collection('custom_events')
      .find({ clinicId: user.id })
      .toArray();
    
    // Combine all events
    const allEvents = [
      ...eventsWithSavedStatus,
      ...customEvents.map(e => ({ ...e, saved: true, custom: true }))
    ];
    
    return NextResponse.json({ 
      success: true, 
      events: allEvents,
      savedCount: savedEventIds.size + customEvents.length
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching events:', error);
    // Fallback to default events on error
    return NextResponse.json({ 
      success: true, 
      events: defaultEvents.map(e => ({ ...e, saved: false })),
      error: 'Errore caricamento eventi salvati'
    }, { headers: corsHeaders });
  } finally {
    if (client) await client.close();
  }
}

// POST - Save an event or add a custom event
export async function POST(request) {
  const user = verifyToken(request);
  if (!user || user.role !== 'clinic') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
  }

  let client;
  try {
    const body = await request.json();
    const { action, eventId, customEvent } = body;

    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db('vetbuddy');

    if (action === 'save') {
      // Save an existing event to favorites
      const existingEvent = getDefaultEvents().find(e => e.id === eventId);
      if (!existingEvent) {
        return NextResponse.json({ error: 'Evento non trovato' }, { status: 404, headers: corsHeaders });
      }

      // Check if already saved
      const existing = await db.collection('saved_events').findOne({ 
        clinicId: user.id, 
        eventId 
      });
      
      if (existing) {
        return NextResponse.json({ error: 'Evento già salvato' }, { status: 400, headers: corsHeaders });
      }

      await db.collection('saved_events').insertOne({
        id: uuidv4(),
        clinicId: user.id,
        eventId,
        savedAt: new Date().toISOString()
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Evento salvato nei preferiti' 
      }, { headers: corsHeaders });
    }

    if (action === 'unsave') {
      // Remove event from favorites
      await db.collection('saved_events').deleteOne({ 
        clinicId: user.id, 
        eventId 
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Evento rimosso dai preferiti' 
      }, { headers: corsHeaders });
    }

    if (action === 'add_custom') {
      // Add a custom event
      if (!customEvent?.title || !customEvent?.date) {
        return NextResponse.json({ 
          error: 'Titolo e data obbligatori' 
        }, { status: 400, headers: corsHeaders });
      }

      const newEvent = {
        id: uuidv4(),
        clinicId: user.id,
        title: customEvent.title,
        organizer: customEvent.organizer || user.clinicName || 'Clinica',
        date: customEvent.date,
        endDate: customEvent.endDate || customEvent.date,
        location: customEvent.location || 'Da definire',
        type: customEvent.type || 'altro',
        description: customEvent.description || '',
        url: customEvent.url || '',
        topics: customEvent.topics || [],
        ecm: customEvent.ecm || false,
        ecmCredits: customEvent.ecmCredits || 0,
        image: customEvent.image || '📅',
        createdAt: new Date().toISOString()
      };

      await db.collection('custom_events').insertOne(newEvent);

      return NextResponse.json({ 
        success: true, 
        message: 'Evento aggiunto',
        event: newEvent
      }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Azione non valida' }, { status: 400, headers: corsHeaders });
  } catch (error) {
    console.error('Error managing events:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500, headers: corsHeaders });
  } finally {
    if (client) await client.close();
  }
}

// DELETE - Delete a custom event
export async function DELETE(request) {
  const user = verifyToken(request);
  if (!user || user.role !== 'clinic') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
  }

  let client;
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'ID evento mancante' }, { status: 400, headers: corsHeaders });
    }

    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db('vetbuddy');
    
    // Only delete custom events (not default ones)
    const result = await db.collection('custom_events').deleteOne({ 
      id: eventId, 
      clinicId: user.id 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        error: 'Evento non trovato o non eliminabile' 
      }, { status: 404, headers: corsHeaders });
    }
    
    return NextResponse.json({ success: true, message: 'Evento eliminato' }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500, headers: corsHeaders });
  } finally {
    if (client) await client.close();
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
