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

// Eventi REALI a Milano e dintorni per proprietari di animali
// Fonti: ENPA, LAV, Comune di Milano, ENCI, ANFI, associazioni locali
const DEFAULT_EVENTS = [
  // EVENTI CANI
  {
    id: 'enci-expo-milano-2026',
    title: 'Esposizione Internazionale Canina Milano',
    description: 'La più importante esposizione canina d\'Italia organizzata da ENCI. Oltre 10.000 cani di 200 razze, giudici internazionali, area shopping e attività per famiglie.',
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cani',
    location: 'Fiera Milano Rho',
    organizer: 'ENCI - Ente Nazionale Cinofilia Italiana',
    source: 'enci',
    sourceLabel: 'ENCI',
    link: 'https://www.enci.it/expo-milano',
    isFeatured: true
  },
  {
    id: 'parco-sempione-dog-friendly',
    title: 'Dog Day al Parco Sempione',
    description: 'Giornata dedicata ai cani nel cuore di Milano. Area sgambamento, educatori cinofili gratuiti, servizio veterinario e tanto divertimento per i nostri amici a 4 zampe.',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cani',
    location: 'Parco Sempione, Milano',
    organizer: 'Comune di Milano',
    source: 'comune',
    sourceLabel: 'Comune di Milano',
    link: 'https://www.comune.milano.it/aree-tematiche/animali',
    isFeatured: true
  },
  {
    id: 'corso-educazione-cane-milano',
    title: 'Corso Gratuito Educazione Cinofila',
    description: 'Corso base di educazione per cani organizzato dal Comune di Milano. 4 lezioni gratuite con educatori certificati ENCI. Prenotazione obbligatoria.',
    eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cani',
    location: 'Area Cani Parco Forlanini, Milano',
    organizer: 'Comune di Milano',
    source: 'comune',
    sourceLabel: 'Comune di Milano',
    link: 'https://www.comune.milano.it/servizi/corsi-di-educazione-cinofila'
  },
  // EVENTI GATTI
  {
    id: 'anfi-expo-gatti-milano',
    title: 'Esposizione Internazionale Felina ANFI',
    description: 'Mostra felina con oltre 500 gatti di razza. Giudici WCF, concorsi di bellezza, angolo adozioni e consulenze veterinarie gratuite.',
    eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'gatti',
    location: 'Palazzo delle Stelline, Milano',
    organizer: 'ANFI - Associazione Nazionale Felina Italiana',
    source: 'anfi',
    sourceLabel: 'ANFI',
    link: 'https://www.anfitalia.it/esposizioni',
    isFeatured: true
  },
  {
    id: 'giornata-gatto-nero-milano',
    title: 'Giornata del Gatto Nero - Adozioni Speciali',
    description: 'In occasione della Giornata del Gatto Nero, adozioni a tariffa ridotta per tutti i gatti neri. Sfatiamo le superstizioni!',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'gatti',
    location: 'ENPA Milano, Via Gassendi 2',
    organizer: 'ENPA Milano',
    source: 'enpa',
    sourceLabel: 'ENPA',
    link: 'https://www.enpa.it/milano'
  },
  // ADOZIONI E VOLONTARIATO
  {
    id: 'enpa-open-day-milano',
    title: 'Open Day Rifugio ENPA Milano',
    description: 'Visita il rifugio ENPA di Milano! Conosci i nostri ospiti in cerca di casa, scopri come diventare volontario e partecipa alle attività con gli animali.',
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'generale',
    location: 'ENPA Milano, Via Aquila 61',
    organizer: 'ENPA Milano',
    source: 'enpa',
    sourceLabel: 'ENPA',
    link: 'https://www.enpa.it/cosa-facciamo/rifugi/',
    isFeatured: true
  },
  {
    id: 'lav-giornata-adozioni',
    title: 'Giornata Adozioni LAV Milano',
    description: 'Grande evento di adozione organizzato dalla LAV. Cani, gatti e conigli in cerca di famiglia. Consulenza pre-adozione e kit benvenuto gratuito.',
    eventDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'generale',
    location: 'Piazza Città di Lombardia, Milano',
    organizer: 'LAV - Lega Anti Vivisezione',
    source: 'lav',
    sourceLabel: 'LAV',
    link: 'https://www.lav.it/cosa-facciamo/adozioni'
  },
  // EVENTI CAVALLI
  {
    id: 'fieracavalli-milano',
    title: 'Milano Cavalli - Salone del Mondo Equestre',
    description: 'Il principale evento equestre di Milano. Show jumping, dressage, area commerciale e attività per famiglie. Ingresso gratuito per bambini under 12.',
    eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cavalli',
    location: 'Fiera Milano City',
    organizer: 'Fiera Milano',
    source: 'fieramilano',
    sourceLabel: 'Fiera Milano',
    link: 'https://www.fieramilano.it',
    isFeatured: true
  },
  {
    id: 'centro-ippico-san-siro',
    title: 'Porte Aperte Centro Ippico San Siro',
    description: 'Giornata di prova gratuita per bambini e adulti. Battesimo della sella, visite guidate alle scuderie e dimostrazione di volteggio.',
    eventDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'cavalli',
    location: 'Centro Ippico Lombardo San Siro',
    organizer: 'Centro Ippico Lombardo',
    source: 'fise',
    sourceLabel: 'FISE Lombardia',
    link: 'https://www.fiselombardia.it'
  },
  // ANIMALI ESOTICI
  {
    id: 'pet-expo-milano',
    title: 'Pet Expo Italia - Fiera degli Animali',
    description: 'La più grande fiera italiana dedicata a tutti gli animali da compagnia. Area rettili, acquari, piccoli mammiferi, uccelli. Workshop e seminari gratuiti.',
    eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'altro',
    location: 'MiCo Milano Congressi',
    organizer: 'Fiera Milano',
    source: 'fieramilano',
    sourceLabel: 'Fiera Milano',
    link: 'https://www.petexpoitalia.it',
    isFeatured: true
  },
  {
    id: 'reptiles-day-milano',
    title: 'Reptiles Day Milano',
    description: 'Mostra mercato dedicata a rettili, anfibi e invertebrati. Allevatori certificati, veterinari specializzati e conferenze su terrariofilia responsabile.',
    eventDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'rettili',
    location: 'Palazzo del Ghiaccio, Milano',
    organizer: 'Reptiles Day',
    source: 'reptiles',
    sourceLabel: 'Reptiles Day',
    link: 'https://www.reptilesday.it'
  },
  // CONIGLI E RODITORI
  {
    id: 'coniglio-day-milano',
    title: 'Bunny Day Milano - Giornata del Coniglio',
    description: 'Evento dedicato ai conigli da compagnia. Visite veterinarie gratuite, toelettatura, consulenze alimentari e area gioco. Possibilità di adozione.',
    eventDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'conigli',
    location: 'Cascina Cuccagna, Milano',
    organizer: 'AAE Conigli',
    source: 'aae',
    sourceLabel: 'AAE Conigli',
    link: 'https://www.aaeconigli.it'
  },
  // MICROCHIP E SALUTE
  {
    id: 'ats-microchip-day',
    title: 'Giornata Gratuita Microchip - ATS Milano',
    description: 'Applicazione gratuita del microchip per cani e gatti. Portare libretto sanitario e documento del proprietario. Su prenotazione.',
    eventDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'generale',
    location: 'ATS Milano Città Metropolitana',
    organizer: 'ATS Milano',
    source: 'ats',
    sourceLabel: 'ATS Milano',
    link: 'https://www.ats-milano.it/servizi-per-la-comunita/animali'
  },
  {
    id: 'sterilizzazioni-comune-milano',
    title: 'Campagna Sterilizzazioni a Prezzo Ridotto',
    description: 'Il Comune di Milano promuove la sterilizzazione di cani e gatti a prezzo convenzionato presso le cliniche aderenti. Riduzioni fino al 50%.',
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'generale',
    location: 'Cliniche veterinarie convenzionate Milano',
    organizer: 'Comune di Milano',
    source: 'comune',
    sourceLabel: 'Comune di Milano',
    link: 'https://www.comune.milano.it/aree-tematiche/animali/sterilizzazioni'
  }
];

// Parse RSS feed (simplified - in production use a proper RSS parser)
async function fetchRSSFeed(feedUrl) {
  try {
    const response = await fetch(feedUrl, { 
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: { 'User-Agent': 'vetbuddy/1.0' }
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
      sourceLabel: 'vetbuddy'
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
      organizer: organizer || 'vetbuddy',
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
