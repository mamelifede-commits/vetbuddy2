import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { targetEmail } = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
    const clinicId = '30cc3933-244c-44b9-b6f3-b2b6372c6260';
    
    // Ensure clinic has phone
    await db.collection('users').updateOne(
      { id: clinicId, role: 'clinic' },
      { $set: { phone: '+39 02 1234567', address: 'Via Roma 123, Milano' } }
    );
    
    // Get or create owner
    let owner = await db.collection('users').findOne({ email: targetEmail });
    if (!owner) {
      owner = { id: uuidv4(), name: 'Test', email: targetEmail, role: 'owner', createdAt: new Date() };
      await db.collection('users').insertOne(owner);
    }
    
    // Create pet and appointment for tomorrow
    const pet = { id: uuidv4(), name: 'Luna', species: 'Cane', ownerId: owner.id, clinicId, createdAt: new Date() };
    await db.collection('pets').insertOne(pet);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const apt = {
      id: uuidv4(), petId: pet.id, ownerId: owner.id, clinicId,
      date: tomorrow.toISOString().split('T')[0], time: '10:00',
      reason: 'Visita Controllo', status: 'confirmed', reminderSent: false, createdAt: new Date()
    };
    await db.collection('appointments').insertOne(apt);
    
    return NextResponse.json({ success: true, pet: pet.name, date: apt.date });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
