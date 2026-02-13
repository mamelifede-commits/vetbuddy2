import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { action, targetEmail } = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
    const results = {};
    
    // Update clinic with phone and cancellation policy
    const clinicId = '30cc3933-244c-44b9-b6f3-b2b6372c6260';
    
    await db.collection('users').updateOne(
      { id: clinicId, role: 'clinic' },
      { 
        $set: { 
          phone: '+39 02 1234567',
          address: 'Via Roma 123, 20100 Milano',
          cancellationPolicy: {
            hoursNotice: 24,
            fee: 30,
            message: 'Le cancellazioni devono essere effettuate almeno 24 ore prima dell\'appuntamento. In caso contrario, verrà addebitato un costo di €30 per mancata disdetta.'
          }
        }
      }
    );
    results.clinicUpdated = true;
    
    if (action === 'test_new_email_templates') {
      // Get owner with target email
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
        name: 'Bella',
        species: 'Cane',
        breed: 'Border Collie',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: '2021-06-15',
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(pet);
      
      // 1. Create appointment for TOMORROW (promemoria 24h)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const aptTomorrow = {
        id: uuidv4(),
        petId: pet.id,
        ownerId: owner.id,
        clinicId: clinicId,
        date: tomorrow.toISOString().split('T')[0],
        time: '11:00',
        reason: 'Controllo Vaccini',
        status: 'confirmed',
        reminderSent: false,
        createdAt: new Date()
      };
      await db.collection('appointments').insertOne(aptTomorrow);
      results.appointmentTomorrow = { id: aptTomorrow.id, date: aptTomorrow.date };
      
      // 2. Create appointment for IN 2 DAYS (conferma 48h)
      const in2Days = new Date();
      in2Days.setDate(in2Days.getDate() + 2);
      
      const aptIn2Days = {
        id: uuidv4(),
        petId: pet.id,
        ownerId: owner.id,
        clinicId: clinicId,
        date: in2Days.toISOString().split('T')[0],
        time: '15:30',
        reason: 'Visita di Routine',
        status: 'pending',
        confirmationRequestSent: false,
        createdAt: new Date()
      };
      await db.collection('appointments').insertOne(aptIn2Days);
      results.appointmentIn2Days = { id: aptIn2Days.id, date: aptIn2Days.date };
      
      results.pet = { name: pet.name };
      results.message = `Test data created for ${targetEmail}. Running CRON will send improved emails with call/cancel buttons.`;
    }
    
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
