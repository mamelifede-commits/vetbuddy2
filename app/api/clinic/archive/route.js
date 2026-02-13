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

// GET - Get all archive files for a clinic
export async function GET(request) {
  const user = verifyToken(request);
  if (!user || user.role !== 'clinic') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
  }

  let client;
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db('vetbuddy');
    
    const files = await db.collection('clinic_archive')
      .find({ clinicId: user.id })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ success: true, files }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching archive:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500, headers: corsHeaders });
  } finally {
    if (client) await client.close();
  }
}

// POST - Upload a new file to archive
export async function POST(request) {
  const user = verifyToken(request);
  if (!user || user.role !== 'clinic') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
  }

  let client;
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const name = formData.get('name') || file?.name || 'Documento senza nome';
    const category = formData.get('category') || 'altro';
    const description = formData.get('description') || '';

    if (!file) {
      return NextResponse.json({ error: 'File mancante' }, { status: 400, headers: corsHeaders });
    }

    // In production, you would upload to S3/CloudStorage
    // For now, we store metadata only
    const fileData = {
      id: uuidv4(),
      clinicId: user.id,
      name,
      originalName: file.name,
      category,
      description,
      size: file.size,
      type: file.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db('vetbuddy');
    
    await db.collection('clinic_archive').insertOne(fileData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'File caricato con successo',
      file: fileData 
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error uploading to archive:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500, headers: corsHeaders });
  } finally {
    if (client) await client.close();
  }
}

// DELETE - Delete a file from archive
export async function DELETE(request) {
  const user = verifyToken(request);
  if (!user || user.role !== 'clinic') {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
  }

  let client;
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    if (!fileId) {
      return NextResponse.json({ error: 'ID file mancante' }, { status: 400, headers: corsHeaders });
    }

    client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db('vetbuddy');
    
    const result = await db.collection('clinic_archive').deleteOne({ 
      id: fileId, 
      clinicId: user.id 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'File non trovato' }, { status: 404, headers: corsHeaders });
    }
    
    return NextResponse.json({ success: true, message: 'File eliminato' }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting from archive:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500, headers: corsHeaders });
  } finally {
    if (client) await client.close();
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
