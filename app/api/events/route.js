import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// RSS Feed sources for pet events in Italy
const RSS_FEEDS = [
  {
    id: 'enci',
    name: 'ENCI - Ente Nazionale Cinofilia',
    url: 'https://www.enci.it/rss',
    category: 'cani'
  },
  {
    id: 'anmvi',
    name: 'ANMVI - Associazione Veterinari',
    url: 'https://www.anmvioggi.it/rss',
    category: 'veterinaria'
  },
  {
    id: 'anfi',
    name: 'ANFI - Associazione Nazionale Felina',
    url: 'https://www.anfitalia.it/feed',
    category: 'gatti'
  }
];

// Default/Demo events when no RSS available - includes ALL pet types
const DEFAULT_EVENTS = [
  {
    id: 'demo-1',
    title: 'Giornata Mondiale del Cane',
    description: 'Celebra con noi la giornata dedicata ai nostri amici a 4 zampe! Eventi, sconti e attività in tutte le cliniche partner.',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cani',
    location: 'Tutta Italia',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy',
    isFeatured: true
  },
  {
    id: 'demo-2',
    title: 'Campagna Vaccinazioni Gatti - Primavera 2026',
    description: 'Promozione speciale sulle vaccinazioni per gatti. Proteggi il tuo micio con i vaccini essenziali a prezzo ridotto.',
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'gatti',
    location: 'Milano e provincia',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy',
    isFeatured: true
  },
  {
    id: 'demo-3',
    title: 'Workshop: Cura del Coniglio Domestico',
    description: 'Impara tutto sulla cura, alimentazione e salute del coniglio. Tenuto da veterinari specializzati in animali esotici.',
    eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'conigli',
    location: 'Online - Webinar',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy',
    link: ''
  },
  {
    id: 'demo-4',
    title: 'Giornata degli Uccelli da Compagnia',
    description: 'Evento dedicato a pappagalli, canarini e altri volatili. Visite specialistiche gratuite e consulenze nutrizionali.',
    eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'uccelli',
    location: 'Roma',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy'
  },
  {
    id: 'demo-5',
    title: 'Corso Base: Terrariofilia Responsabile',
    description: 'Tutto quello che devi sapere su tartarughe, serpenti, lucertole e altri rettili. Dalla sistemazione alla nutrizione.',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'rettili',
    location: 'Torino',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy'
  },
  {
    id: 'demo-6',
    title: 'Acquariofilia per Principianti',
    description: 'Workshop pratico sulla gestione dell\'acquario domestico. Dalla scelta dei pesci alla manutenzione del filtro.',
    eventDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'pesci',
    location: 'Online - Webinar',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy'
  },
  {
    id: 'demo-7',
    title: 'Fiera del Criceto e Piccoli Roditori',
    description: 'Esposizione e concorso dedicato a criceti, cavie, gerbilli e altri piccoli roditori. Premi e gadget per tutti!',
    eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'roditori',
    location: 'Bologna',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy'
  },
  {
    id: 'demo-8',
    title: 'Seminario: Primo Soccorso per Animali',
    description: 'Impara le manovre di primo soccorso per cani, gatti e piccoli animali. Certificato di partecipazione incluso.',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'veterinaria',
    location: 'Milano',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy',
    isFeatured: true
  },
  {
    id: 'demo-9',
    title: 'Expo Felina Internazionale Milano',
    description: 'La più grande esposizione di gatti d\'Italia. Razze rare, concorsi di bellezza e incontri con allevatori.',
    eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'gatti',
    location: 'Fiera Milano',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy'
  },
  {
    id: 'demo-10',
    title: 'Dog Walking Day - Passeggiata di Gruppo',
    description: 'Unisciti alla passeggiata collettiva con il tuo cane! Percorso di 5km nel parco cittadino con veterinari a disposizione.',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cani',
    location: 'Parco Sempione, Milano',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy'
  },
  {
    id: 'demo-11',
    title: 'Controllo Gratuito Microchip',
    description: 'Porta il tuo animale per un controllo gratuito del microchip. Valido per cani, gatti, furetti e conigli.',
    eventDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'generale',
    location: 'Tutte le cliniche VetBuddy',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy',
    isFeatured: true
  },
  {
    id: 'demo-12',
    title: 'Adotta un Furetto - Giornata di Adozioni',
    description: 'In collaborazione con i rifugi locali, giornata dedicata all\'adozione di furetti e altri mustelidi.',
    eventDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'furetti',
    location: 'Roma',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy'
  },
  // EVENTI PER CAVALLI
  {
    id: 'demo-13',
    title: 'Fiera Internazionale del Cavallo - Verona',
    description: 'La più grande manifestazione equestre italiana. Show jumping, dressage, endurance e tanto altro. Non perdere i campionati nazionali!',
    eventDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cavalli',
    location: 'Fiera di Verona',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy',
    isFeatured: true
  },
  {
    id: 'demo-14',
    title: 'Corso di Mascalcia e Cura dello Zoccolo',
    description: 'Workshop pratico sulla ferratura e cura dello zoccolo equino. Tenuto da maniscalchi professionisti certificati FISE.',
    eventDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cavalli',
    location: 'Centro Ippico Milano',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy'
  },
  {
    id: 'demo-15',
    title: 'Giornata di Visite Veterinarie Equine Gratuite',
    description: 'Check-up gratuito per il tuo cavallo: controllo generale, denti, arti e consulenza nutrizionale con veterinari specializzati.',
    eventDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cavalli',
    location: 'Maneggi convenzionati Lombardia',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy',
    isFeatured: true
  },
  {
    id: 'demo-16',
    title: 'Seminario: Alimentazione del Cavallo Sportivo',
    description: 'Come nutrire correttamente il cavallo atleta. Integrazione, timing dei pasti e gestione del peso con esperti di nutrizione equina.',
    eventDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cavalli',
    location: 'Online - Webinar',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy'
  },
  {
    id: 'demo-17',
    title: 'Passeggiata a Cavallo nel Parco del Ticino',
    description: 'Escursione guidata di 3 ore nella natura. Adatta a tutti i livelli. Veterinario presente per emergenze.',
    eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cavalli',
    location: 'Parco del Ticino, Vigevano',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy'
  },
  {
    id: 'demo-18',
    title: 'Corso First Aid Equino',
    description: 'Impara a gestire le emergenze del cavallo: coliche, ferite, problemi respiratori. Certificato rilasciato dalla FISE.',
    eventDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cavalli',
    location: 'Bologna - Centro Equestre',
    source: 'vetbuddy',
    sourceLabel: 'VetBuddy'
  }
];

// Parse RSS feed (simplified - in production use a proper RSS parser)
async function fetchRSSFeed(feedUrl) {
  try {
    const response = await fetch(feedUrl, { 
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: { 'User-Agent': 'VetBuddy/1.0' }
    });
    
    if (!response.ok) return [];
    
    const text = await response.text();
    const items = [];
    
    // Simple XML parsing for RSS items
    const itemMatches = text.match(/<item>[\s\S]*?<\/item>/g) || [];
    
    for (const itemXml of itemMatches.slice(0, 5)) { // Limit to 5 items per feed
      const title = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] || itemXml.match(/<title>(.*?)<\/title>/)?.[1] || '';
      const link = itemXml.match(/<link>(.*?)<\/link>/)?.[1] || '';
      const description = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[1] || '';
      const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
      
      if (title) {
        items.push({
          title: title.replace(/<[^>]*>/g, '').trim(),
          link,
          description: description.replace(/<[^>]*>/g, '').substring(0, 200).trim(),
          pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
        });
      }
    }
    
    return items;
  } catch (error) {
    console.error('Error fetching RSS:', feedUrl, error.message);
    return [];
  }
}

// GET - Fetch events (RSS + manual)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const source = searchParams.get('source'); // 'rss', 'manual', 'all'
    
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
    // Fetch manual events from database
    const query = { isActive: true };
    if (category) query.category = category;
    
    const manualEvents = await db.collection('events')
      .find(query)
      .sort({ eventDate: 1, createdAt: -1 })
      .limit(20)
      .toArray();
    
    // Format manual events
    const formattedManualEvents = manualEvents.map(e => ({
      ...e,
      source: 'vetbuddy',
      sourceLabel: 'VetBuddy'
    }));
    
    // If only manual events requested
    if (source === 'manual') {
      return NextResponse.json({ events: formattedManualEvents }, { headers: corsHeaders });
    }
    
    // Fetch RSS events (with caching consideration)
    let rssEvents = [];
    
    // Check if we have cached RSS events (less than 1 hour old)
    const cachedRSS = await db.collection('events_cache').findOne({ 
      type: 'rss',
      cachedAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } // 1 hour
    });
    
    if (cachedRSS) {
      rssEvents = cachedRSS.events || [];
    } else {
      // Fetch fresh RSS data
      for (const feed of RSS_FEEDS) {
        const items = await fetchRSSFeed(feed.url);
        for (const item of items) {
          rssEvents.push({
            id: `rss-${feed.id}-${Buffer.from(item.title).toString('base64').substring(0, 20)}`,
            title: item.title,
            description: item.description,
            link: item.link,
            eventDate: item.pubDate,
            category: feed.category,
            source: 'rss',
            sourceLabel: feed.name,
            sourceFeed: feed.id
          });
        }
      }
      
      // Cache RSS events
      if (rssEvents.length > 0) {
        await db.collection('events_cache').updateOne(
          { type: 'rss' },
          { $set: { events: rssEvents, cachedAt: new Date() } },
          { upsert: true }
        );
      }
    }
    
    // Combine and sort events
    let allEvents = [];
    
    if (source === 'rss') {
      allEvents = rssEvents;
    } else {
      allEvents = [...formattedManualEvents, ...rssEvents];
    }
    
    // If no events found, use default demo events
    if (allEvents.length === 0) {
      // Filter default events by category if specified
      let defaultEventsToUse = [...DEFAULT_EVENTS];
      if (category) {
        defaultEventsToUse = defaultEventsToUse.filter(e => e.category === category || e.category === 'generale');
      }
      allEvents = defaultEventsToUse;
    }
    
    // Sort by date (upcoming first, then recent)
    const now = new Date();
    allEvents.sort((a, b) => {
      const dateA = new Date(a.eventDate || a.createdAt);
      const dateB = new Date(b.eventDate || b.createdAt);
      
      // Featured events first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      
      // Upcoming events first
      const aIsUpcoming = dateA >= now;
      const bIsUpcoming = dateB >= now;
      
      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;
      
      // Then sort by date
      return dateA - dateB;
    });
    
    // Add category labels for UI
    const categoryLabels = {
      'cani': 'Cani',
      'gatti': 'Gatti',
      'cavalli': 'Cavalli',
      'conigli': 'Conigli',
      'uccelli': 'Uccelli',
      'rettili': 'Rettili',
      'pesci': 'Pesci',
      'roditori': 'Roditori',
      'furetti': 'Furetti',
      'altro': 'Altri Animali',
      'veterinaria': 'Veterinaria',
      'generale': 'Tutti gli animali'
    };
    
    const enrichedEvents = allEvents.map(e => ({
      ...e,
      categoryLabel: categoryLabels[e.category] || e.category
    }));
    
    return NextResponse.json({ 
      events: enrichedEvents.slice(0, 30),
      sources: RSS_FEEDS.map(f => ({ id: f.id, name: f.name })),
      categories: Object.entries(categoryLabels).map(([id, label]) => ({ id, label }))
    }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('GET events error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// POST - Create manual event (admin only)
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const body = await request.json();
    const { 
      title, 
      description, 
      eventDate, 
      endDate,
      location, 
      category, 
      link, 
      imageUrl,
      organizer,
      isFeatured 
    } = body;
    
    if (!title) {
      return NextResponse.json({ error: 'Titolo obbligatorio' }, { status: 400, headers: corsHeaders });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
    const newEvent = {
      id: uuidv4(),
      title,
      description: description || '',
      eventDate: eventDate || null,
      endDate: endDate || null,
      location: location || '',
      category: category || 'generale',
      link: link || '',
      imageUrl: imageUrl || '',
      organizer: organizer || 'VetBuddy',
      isFeatured: isFeatured || false,
      isActive: true,
      source: 'manual',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('events').insertOne(newEvent);
    
    return NextResponse.json(newEvent, { headers: corsHeaders });
    
  } catch (error) {
    console.error('POST event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// PUT - Update event (admin only)
export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID evento obbligatorio' }, { status: 400, headers: corsHeaders });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
    updates.updatedAt = new Date().toISOString();
    
    await db.collection('events').updateOne({ id }, { $set: updates });
    
    const updated = await db.collection('events').findOne({ id });
    return NextResponse.json(updated, { headers: corsHeaders });
    
  } catch (error) {
    console.error('PUT event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// DELETE - Delete event (admin only)
export async function DELETE(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID evento obbligatorio' }, { status: 400, headers: corsHeaders });
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
    await db.collection('events').deleteOne({ id });
    
    return NextResponse.json({ success: true }, { headers: corsHeaders });
    
  } catch (error) {
    console.error('DELETE event error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
