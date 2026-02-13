import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCollection } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// POST - Upload pet photo
export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    const formData = await request.formData();
    const file = formData.get('photo');
    const petId = formData.get('petId');

    if (!file || !petId) {
      return NextResponse.json({ error: 'File e petId sono obbligatori' }, { status: 400, headers: corsHeaders });
    }

    // Verify pet belongs to user (for owners) or clinic has access
    const pets = await getCollection('pets');
    const pet = await pets.findOne({ id: petId });
    
    if (!pet) {
      return NextResponse.json({ error: 'Animale non trovato' }, { status: 404, headers: corsHeaders });
    }

    // Check authorization
    if (user.role === 'owner' && pet.ownerId !== user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo file non supportato. Usa JPG, PNG, WebP o GIF.' }, { status: 400, headers: corsHeaders });
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File troppo grande. Massimo 20MB.' }, { status: 400, headers: corsHeaders });
    }

    // Create unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `pet_${petId}_${uuidv4()}.${ext}`;
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'pets');
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Generate public URL
    const photoUrl = `/uploads/pets/${filename}`;

    // Update pet with photo URL
    await pets.updateOne(
      { id: petId },
      { 
        $set: { 
          photoUrl,
          photoUpdatedAt: new Date().toISOString()
        } 
      }
    );

    return NextResponse.json({ 
      success: true, 
      photoUrl,
      message: 'Foto caricata con successo!' 
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Pet photo upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

// DELETE - Remove pet photo
export async function DELETE(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401, headers: corsHeaders });
    }

    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');

    if (!petId) {
      return NextResponse.json({ error: 'petId è obbligatorio' }, { status: 400, headers: corsHeaders });
    }

    const pets = await getCollection('pets');
    const pet = await pets.findOne({ id: petId });
    
    if (!pet) {
      return NextResponse.json({ error: 'Animale non trovato' }, { status: 404, headers: corsHeaders });
    }

    // Check authorization
    if (user.role === 'owner' && pet.ownerId !== user.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403, headers: corsHeaders });
    }

    // Remove photo URL from pet
    await pets.updateOne(
      { id: petId },
      { 
        $unset: { photoUrl: 1, photoUpdatedAt: 1 }
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Foto rimossa' 
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Pet photo delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
