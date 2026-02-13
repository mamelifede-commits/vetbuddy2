import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// POST: Create test data with specific email
export async function POST(request) {
  try {
    const { action, targetEmail } = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
    const results = {};
    
    if (action === 'create_test_for_email') {
      // Create or find owner with target email
      let owner = await db.collection('users').findOne({ email: targetEmail });
      
      if (!owner) {
        // Create a test owner with the target email
        owner = {
          id: uuidv4(),
          name: 'Test VetBuddy',
          email: targetEmail,
          role: 'owner',
          createdAt: new Date()
        };
        await db.collection('users').insertOne(owner);
        results.ownerCreated = true;
      }
      
      // Find or create a pet for this owner
      let pet = await db.collection('pets').findOne({ ownerId: owner.id });
      if (!pet) {
        pet = {
          id: uuidv4(),
          name: 'Luna',
          species: 'Cane',
          breed: 'Golden Retriever',
          ownerId: owner.id,
          clinicId: '30cc3933-244c-44b9-b6f3-b2b6372c6260',
          birthDate: '2022-05-15',
          createdAt: new Date()
        };
        await db.collection('pets').insertOne(pet);
        results.petCreated = true;
      }
      
      // Create vaccination expiring soon (within 30 days)
      const in20Days = new Date();
      in20Days.setDate(in20Days.getDate() + 20);
      
      const vaccination = {
        id: uuidv4(),
        petId: pet.id,
        name: 'Vaccino Antirabbica',
        administeredDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextDueDate: in20Days.toISOString().split('T')[0],
        status: 'active',
        reminderSent: false,
        createdAt: new Date()
      };
      await db.collection('vaccinations').insertOne(vaccination);
      
      // Create appointment for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const appointment = {
        id: uuidv4(),
        petId: pet.id,
        ownerId: owner.id,
        clinicId: '30cc3933-244c-44b9-b6f3-b2b6372c6260',
        date: tomorrow.toISOString().split('T')[0],
        time: '10:30',
        reason: 'Visita di Controllo',
        status: 'confirmed',
        reminderSent: false,
        createdAt: new Date()
      };
      await db.collection('appointments').insertOne(appointment);
      
      results.owner = { id: owner.id, name: owner.name, email: owner.email };
      results.pet = { id: pet.id, name: pet.name };
      results.vaccination = { id: vaccination.id, nextDueDate: vaccination.nextDueDate };
      results.appointment = { id: appointment.id, date: appointment.date, time: appointment.time };
      results.message = `Test data created. CRON will send emails to ${targetEmail}`;
    }
    
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
