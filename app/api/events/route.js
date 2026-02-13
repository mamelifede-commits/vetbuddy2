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
    
    // Sort by date (upcoming first, then recent)
    const now = new Date();
    allEvents.sort((a, b) => {
      const dateA = new Date(a.eventDate || a.createdAt);
      const dateB = new Date(b.eventDate || b.createdAt);
      
      // Upcoming events first
      const aIsUpcoming = dateA >= now;
      const bIsUpcoming = dateB >= now;
      
      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;
      
      // Then sort by date
      return dateA - dateB;
    });
    
    return NextResponse.json({ 
      events: allEvents.slice(0, 30),
      sources: RSS_FEEDS.map(f => ({ id: f.id, name: f.name }))
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
