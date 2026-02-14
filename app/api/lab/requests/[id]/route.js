import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Get single lab request detail
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const client = await clientPromise;
    const db = client.db('vetbuddy');
    
    const labRequest = await db.collection('lab_requests').findOne({ id });
    
    if (!labRequest) {
      return NextResponse.json({ error: 'Richiesta non trovata' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      request: labRequest
    });
    
  } catch (error) {
    console.error('Error fetching lab request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
