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
    
    // Find or get owner with target email
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
    
    if (action === 'test_all_automations') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // 1. FOLLOW-UP POST VISITA (48h dopo visita completata)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const petFollowUp = {
        id: uuidv4(),
        name: 'Buddy',
        species: 'Cane',
        breed: 'Labrador',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: '2021-03-10',
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
        reason: 'Visita Generale',
        status: 'completed',
        followUpSent: false,
        createdAt: new Date()
      };
      await db.collection('appointments').insertOne(aptFollowUp);
      results.followUp = { pet: petFollowUp.name, date: aptFollowUp.date };
      
      // 2. COMPLEANNO PET (oggi)
      const petBirthday = {
        id: uuidv4(),
        name: 'Rocky',
        species: 'Cane',
        breed: 'Boxer',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: `2020-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(petBirthday);
      results.birthday = { pet: petBirthday.name, birthDate: petBirthday.birthDate, age: today.getFullYear() - 2020 };
      
      // 3. RICHIESTA RECENSIONE (3 giorni dopo visita)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const petReview = {
        id: uuidv4(),
        name: 'Mia',
        species: 'Gatto',
        breed: 'Persiano',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: '2019-08-20',
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(petReview);
      
      const aptReview = {
        id: uuidv4(),
        petId: petReview.id,
        ownerId: owner.id,
        clinicId: clinicId,
        date: threeDaysAgo.toISOString().split('T')[0],
        time: '11:00',
        reason: 'Controllo Dentale',
        status: 'completed',
        reviewRequestSent: false,
        createdAt: new Date()
      };
      await db.collection('appointments').insertOne(aptReview);
      results.reviewRequest = { pet: petReview.name, date: aptReview.date };
      
      // 4. CONFERMA APPUNTAMENTO (48h prima = tra 2 giorni)
      const in2Days = new Date();
      in2Days.setDate(in2Days.getDate() + 2);
      
      const petConfirm = {
        id: uuidv4(),
        name: 'Whiskers',
        species: 'Gatto',
        breed: 'Maine Coon',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: '2022-01-15',
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
        reason: 'Vaccinazione',
        status: 'pending',
        confirmationRequestSent: false,
        createdAt: new Date()
      };
      await db.collection('appointments').insertOne(aptConfirm);
      results.appointmentConfirmation = { pet: petConfirm.name, date: aptConfirm.date };
      
      // 5. STERILIZZAZIONE (cucciolo 6-12 mesi)
      const eightMonthsAgo = new Date();
      eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8);
      
      const petSterilization = {
        id: uuidv4(),
        name: 'Pippo',
        species: 'Cane',
        breed: 'Beagle',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: eightMonthsAgo.toISOString().split('T')[0],
        isNeutered: false,
        sterilizationReminderSent: false,
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(petSterilization);
      results.sterilization = { pet: petSterilization.name, ageMonths: 8 };
      
      // 6. SENIOR PET CARE (pet over 7 anni)
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      
      const sevenMonthsAgo = new Date();
      sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
      
      const petSenior = {
        id: uuidv4(),
        name: 'Vecchio Saggio',
        species: 'Cane',
        breed: 'Pastore Tedesco',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: tenYearsAgo.toISOString().split('T')[0],
        seniorCheckupReminderSent: false,
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(petSenior);
      
      // Create old completed appointment for senior pet
      const aptSenior = {
        id: uuidv4(),
        petId: petSenior.id,
        ownerId: owner.id,
        clinicId: clinicId,
        date: sevenMonthsAgo.toISOString().split('T')[0],
        time: '09:00',
        reason: 'Controllo Generale',
        status: 'completed',
        createdAt: new Date()
      };
      await db.collection('appointments').insertOne(aptSenior);
      results.seniorPetCare = { pet: petSenior.name, age: 10, lastVisit: aptSenior.date };
      
      // 7. ANTIPARASSITARIO (trattamento scaduto)
      const petAntiparasitic = {
        id: uuidv4(),
        name: 'Pallino',
        species: 'Cane',
        breed: 'Jack Russell',
        ownerId: owner.id,
        clinicId: clinicId,
        birthDate: '2020-06-01',
        createdAt: new Date()
      };
      await db.collection('pets').insertOne(petAntiparasitic);
      
      const treatment = {
        id: uuidv4(),
        petId: petAntiparasitic.id,
        type: 'antiparasitic',
        name: 'Frontline Plus',
        administeredDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        nextDueDate: todayStr,
        reminderSent: false,
        createdAt: new Date()
      };
      await db.collection('treatments').insertOne(treatment);
      results.antiparasitic = { pet: petAntiparasitic.name, treatment: treatment.name };
      
      results.message = `Created test data for 7 automations. Running CRON will send emails to ${targetEmail}`;
      results.automationsCreated = [
        'Follow-up Post Visita (Buddy)',
        'Compleanno Pet (Rocky - 6 anni)',
        'Richiesta Recensione (Mia)',
        'Conferma Appuntamento (Whiskers)',
        'Sterilizzazione (Pippo - 8 mesi)',
        'Senior Pet Care (Vecchio Saggio - 10 anni)',
        'Antiparassitario (Pallino)'
      ];
    }
    
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
