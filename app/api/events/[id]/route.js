import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID evento richiesto' }, { status: 400, headers: corsHeaders });
    }

    const events = await getCollection('events');
    const event = await events.findOne({ id });

    if (!event) {
      return NextResponse.json({ error: 'Evento non trovato' }, { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(event, { headers: corsHeaders });
    
  } catch (error) {
    console.error('GET event by ID error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
