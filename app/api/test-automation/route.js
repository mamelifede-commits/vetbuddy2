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
    
    if (action === 'test_buttons_emails') {
      // 1. Pet for birthday TODAY
      const petBirthday = {
        id: uuidv4(),
        name: 'Fido',
        species: 'Cane',
        breed: 'Golden Retriever',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: `2019-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(petBirthday);
      results.birthday = { pet: petBirthday.name, age: today.getFullYear() - 2019 };
      
      // 2. Appointment for TOMORROW (reminder 24h)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const petTomorrow = {
        id: uuidv4(),
        name: 'Stella',
        species: 'Gatto',
        breed: 'Siamese',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: '2022-04-10',
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(petTomorrow);
      
      const aptTomorrow = {
        id: uuidv4(),
        petId: petTomorrow.id,
        ownerId: owner.id,
        clinicId: clinicId,
        date: tomorrow.toISOString().split('T')[0],
        time: '09:30',
        reason: 'Vaccinazione Annuale',
        status: 'confirmed',
        reminderSent: false,
        createdAt: new Date()
      };
      await db.collection('appointments').insertOne(aptTomorrow);
      results.reminder24h = { pet: petTomorrow.name, date: aptTomorrow.date };
      
      // 3. Follow-up (2 days ago completed)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const petFollowUp = {
        id: uuidv4(),
        name: 'Leo',
        species: 'Cane',
        breed: 'Bulldog Francese',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: '2021-08-20',
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(petFollowUp);
      
      const aptFollowUp = {
        id: uuidv4(),
        petId: petFollowUp.id,
        ownerId: owner.id,
        clinicId: clinicId,
        date: twoDaysAgo.toISOString().split('T')[0],
        time: '14:00',
        reason: 'Visita Dermatologica',
        status: 'completed',
        followUpSent: false,
        createdAt: new Date()
      };
      await db.collection('appointments').insertOne(aptFollowUp);
      results.followUp = { pet: petFollowUp.name, date: aptFollowUp.date };
      
      // 4. Vaccine expiring
      const petVaccine = {
        id: uuidv4(),
        name: 'Oscar',
        species: 'Cane',
        breed: 'Labrador',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: '2020-01-15',
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(petVaccine);
      
      const in20Days = new Date();
      in20Days.setDate(in20Days.getDate() + 20);
      
      const vaccine = {
        id: uuidv4(),
        petId: petVaccine.id,
        name: 'Vaccino Polivalente',
        administeredDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextDueDate: in20Days.toISOString().split('T')[0],
        status: 'active',
        reminderSent: false,
        createdAt: new Date()
      };
      await db.collection('vaccinations').insertOne(vaccine);
      results.vaccine = { pet: petVaccine.name, vaccine: vaccine.name };
      
      // 5. Antiparasitic due
      const petAntiparasitic = {
        id: uuidv4(),
        name: 'Birba',
        species: 'Gatto',
        breed: 'Europeo',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: '2021-05-10',
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(petAntiparasitic);
      
      const treatment = {
        id: uuidv4(),
        petId: petAntiparasitic.id,
        type: 'antiparasitic',
        name: 'Advantix',
        administeredDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextDueDate: today.toISOString().split('T')[0],
        reminderSent: false,
        createdAt: new Date()
      };
      await db.collection('treatments').insertOne(treatment);
      results.antiparasitic = { pet: petAntiparasitic.name };
      
      // 6. Confirmation in 2 days
      const in2Days = new Date();
      in2Days.setDate(in2Days.getDate() + 2);
      
      const petConfirm = {
        id: uuidv4(),
        name: 'Nuvola',
        species: 'Coniglio',
        breed: 'Ariete Nano',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: '2023-02-14',
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(petConfirm);
      
      const aptConfirm = {
        id: uuidv4(),
        petId: petConfirm.id,
        ownerId: owner.id,
        clinicId: clinicId,
        date: in2Days.toISOString().split('T')[0],
        time: '16:00',
        reason: 'Controllo Dentale',
        status: 'pending',
        confirmationRequestSent: false,
        createdAt: new Date()
      };
      await db.collection('appointments').insertOne(aptConfirm);
      results.confirmation = { pet: petConfirm.name, date: aptConfirm.date };
      
      results.message = `Created 6 test scenarios for ${targetEmail}. Run CRON to send emails with action buttons.`;
      results.automations = [
        '🎂 Compleanno Pet (Fido - 7 anni)',
        '⏰ Promemoria 24h (Stella)',
        '💚 Follow-up Post Visita (Leo)',
        '💉 Richiamo Vaccini (Oscar)',
        '🐜 Antiparassitario (Birba)',
        '✅ Conferma Appuntamento (Nuvola)'
      ];
    }
    
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
