import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

// GET: Check database data for automation testing
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
    // Get collections data
    const vaccinations = await db.collection('vaccinations').find({}).limit(5).toArray();
    const pets = await db.collection('pets').find({}).limit(5).toArray();
    const appointments = await db.collection('appointments').find({}).limit(5).toArray();
    const owners = await db.collection('users').find({ role: 'owner' }).limit(3).toArray();
    const clinics = await db.collection('users').find({ role: 'clinic' }).limit(3).toArray();
    const treatments = await db.collection('treatments').find({}).limit(5).toArray();
    
    // Check clinic automation settings
    const clinicsWithSettings = await db.collection('users').find({ role: 'clinic' }).toArray();
    const clinicSettings = clinicsWithSettings.map(c => ({
      id: c.id,
      clinicName: c.clinicName,
      automationSettings: c.automationSettings || 'DEFAULT'
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        vaccinations: vaccinations.length,
        vaccinationsData: vaccinations,
        pets: pets.length,
        petsData: pets.map(p => ({ id: p.id, name: p.name, species: p.species, ownerId: p.ownerId, clinicId: p.clinicId, birthDate: p.birthDate })),
        appointments: appointments.length,
        appointmentsData: appointments.map(a => ({ id: a.id, date: a.date, time: a.time, status: a.status, petId: a.petId, ownerId: a.ownerId, clinicId: a.clinicId, reminderSent: a.reminderSent })),
        owners: owners.map(o => ({ id: o.id, name: o.name, email: o.email })),
        clinics: clinics.map(c => ({ id: c.id, name: c.name, clinicName: c.clinicName, email: c.email })),
        treatments: treatments.length,
        treatmentsData: treatments,
        clinicSettings
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create test data for automation testing
export async function POST(request) {
  try {
    const { action, clinicId } = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
    const results = {};
    
    if (action === 'enable_all_automations') {
      // Enable all automations for a clinic
      const targetClinicId = clinicId || '30cc3933-244c-44b9-b6f3-b2b6372c6260';
      
      // Default settings - all enabled
      const allAutomationsEnabled = {
        appointmentReminders: true,
        vaccineRecalls: true,
        postVisitFollowup: true,
        noShowDetection: true,
        documentReminders: true,
        weeklyReport: true,
        petBirthday: true,
        reviewRequest: true,
        inactiveClientReactivation: true,
        antiparasiticReminder: true,
        annualCheckup: true,
        medicationRefill: true,
        weightAlert: true,
        dentalHygiene: true,
        appointmentConfirmation: true,
        labResultsReady: true,
        paymentReminder: true,
        postSurgeryFollowup: true,
        summerHeatAlert: true,
        tickSeasonAlert: true,
        newYearFireworksAlert: true,
        whatsappReminders: false,
        smsEmergency: false,
        sterilizationReminder: true,
        seniorPetCare: true,
        microchipCheck: true,
        welcomeNewPet: true,
        aiLabExplanation: true,
        breedRiskAlert: true,
        dietSuggestions: true,
        loyaltyProgram: true,
        referralProgram: true,
        holidayClosures: true,
        petCondolences: true,
        griefFollowup: true,
        dailySummary: true,
        lowStockAlert: true,
        staffBirthday: true
      };
      
      await db.collection('users').updateOne(
        { id: targetClinicId, role: 'clinic' },
        { $set: { automationSettings: allAutomationsEnabled } }
      );
      
      results.message = `All automations enabled for clinic ${targetClinicId}`;
      results.settings = allAutomationsEnabled;
    }
    
    if (action === 'create_vaccine_test') {
      // Find a pet and owner
      const pet = await db.collection('pets').findOne({});
      const owner = pet ? await db.collection('users').findOne({ id: pet.ownerId }) : null;
      
      if (pet && owner) {
        // Create a vaccination expiring in 25 days (within 30-day reminder window)
        const in25Days = new Date();
        in25Days.setDate(in25Days.getDate() + 25);
        
        const vaccination = {
          id: uuidv4(),
          petId: pet.id,
          name: 'Test Vaccino Rabbia',
          administeredDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          nextDueDate: in25Days.toISOString().split('T')[0],
          status: 'active',
          reminderSent: false,
          createdAt: new Date()
        };
        
        await db.collection('vaccinations').insertOne(vaccination);
        
        results.vaccination = vaccination;
        results.pet = { id: pet.id, name: pet.name };
        results.owner = { id: owner.id, name: owner.name, email: owner.email };
        results.message = `Created vaccination expiring on ${vaccination.nextDueDate}. When CRON runs, it will send reminder to ${owner.email}`;
      } else {
        results.error = 'No pet or owner found in database';
      }
    }
    
    if (action === 'create_appointment_test') {
      // Create an appointment for tomorrow to test 24h reminder
      const pet = await db.collection('pets').findOne({});
      const owner = pet ? await db.collection('users').findOne({ id: pet.ownerId }) : null;
      const clinic = await db.collection('users').findOne({ role: 'clinic' });
      
      if (pet && owner && clinic) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const appointment = {
          id: uuidv4(),
          petId: pet.id,
          ownerId: owner.id,
          clinicId: clinic.id,
          date: tomorrow.toISOString().split('T')[0],
          time: '10:00',
          reason: 'Test Visita di Controllo',
          status: 'confirmed',
          reminderSent: false,
          createdAt: new Date()
        };
        
        await db.collection('appointments').insertOne(appointment);
        
        results.appointment = appointment;
        results.pet = { id: pet.id, name: pet.name };
        results.owner = { id: owner.id, name: owner.name, email: owner.email };
        results.clinic = { id: clinic.id, name: clinic.clinicName };
        results.message = `Created appointment for ${appointment.date} ${appointment.time}. CRON will send reminder to ${owner.email}`;
      } else {
        results.error = 'No pet, owner or clinic found in database';
      }
    }
    
    return NextResponse.json({ success: true, results });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
