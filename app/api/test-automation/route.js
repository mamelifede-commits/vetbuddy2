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
    const today = new Date();
    
    // Ensure clinic has phone and address
    await db.collection('users').updateOne(
      { id: clinicId, role: 'clinic' },
      { 
        $set: { 
          phone: '+39 02 1234567',
          address: 'Via Roma 123, 20100 Milano',
          cancellationPolicy: {
            hoursNotice: 24,
            fee: 30,
            message: 'Le cancellazioni devono essere effettuate almeno 24 ore prima. In caso contrario verrà addebitato €30.'
          }
        }
      }
    );
    
    // Get or create owner
    let owner = await db.collection('users').findOne({ email: targetEmail });
    if (!owner) {
      owner = {
        id: uuidv4(),
        name: 'Test VetBuddy',
        email: targetEmail,
        role: 'owner',
        createdAt: new Date()
      };
      await db.collection('users').insertOne(owner);
    }
    
    // Create pet
    const pet = {
      id: uuidv4(),
      name: 'Charlie',
      species: 'Cane',
      breed: 'Cocker Spaniel',
      ownerId: owner.id,
      clinicId: clinicId,
      birthDate: '2021-09-15',
      createdAt: new Date()
    };
    await db.collection('pets').insertOne(pet);
    
    // Create appointment for TOMORROW to trigger 24h reminder
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointment = {
      id: uuidv4(),
      petId: pet.id,
      ownerId: owner.id,
      clinicId: clinicId,
      date: tomorrow.toISOString().split('T')[0],
      time: '10:00',
      reason: 'Controllo Generale',
      status: 'confirmed',
      reminderSent: false,
      createdAt: new Date()
    };
    await db.collection('appointments').insertOne(appointment);
    
    // Create appointment for IN 2 DAYS to trigger confirmation
    const in2Days = new Date();
    in2Days.setDate(in2Days.getDate() + 2);
    
    const appointment2 = {
      id: uuidv4(),
      petId: pet.id,
      ownerId: owner.id,
      clinicId: clinicId,
      date: in2Days.toISOString().split('T')[0],
      time: '15:00',
      reason: 'Vaccinazione',
      status: 'pending',
      confirmationRequestSent: false,
      createdAt: new Date()
    };
    await db.collection('appointments').insertOne(appointment2);
    
    return NextResponse.json({ 
      success: true, 
      message: `Test data created for ${targetEmail}. Running CRON now...`,
      pet: pet.name,
      appointments: [
        { date: appointment.date, time: appointment.time, type: 'Promemoria 24h' },
        { date: appointment2.date, time: appointment2.time, type: 'Conferma 48h' }
      ]
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
