const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// MongoDB Atlas connection string - use environment variable
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/vetbuddy';

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

async function seedDatabase() {
  console.log('🚀 Connecting to MongoDB Atlas...');
  
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('vetbuddy');
    const users = db.collection('users');
    const pets = db.collection('pets');
    const appointments = db.collection('appointments');
    const documents = db.collection('documents');
    
    // Clear existing demo data
    console.log('🧹 Cleaning existing demo data...');
    await users.deleteMany({ email: { $in: ['demo@vetbuddy.it', 'mario.rossi@email.com', 'anna.bianchi@email.com'] } });
    
    // Create Demo Clinic
    const clinicId = uuidv4();
    const demoClinic = {
      id: clinicId,
      email: 'demo@vetbuddy.it',
      password: hashPassword('DemoVet2025!'),
      name: 'Clinica Veterinaria VetBuddy',
      role: 'clinic',
      clinicName: 'Clinica Veterinaria VetBuddy',
      phone: '+39 02 1234567',
      address: 'Via Roma 123',
      city: 'Milano',
      vatNumber: 'IT12345678901',
      website: 'https://www.vetbuddy.it',
      latitude: 45.4642,
      longitude: 9.1900,
      description: 'Clinica veterinaria moderna con servizi completi per i tuoi amici a quattro zampe.',
      services: ['Visite generali', 'Vaccinazioni', 'Chirurgia', 'Radiologia', 'Laboratorio analisi', 'Toelettatura'],
      openingHours: {
        monday: '09:00-19:00',
        tuesday: '09:00-19:00',
        wednesday: '09:00-19:00',
        thursday: '09:00-19:00',
        friday: '09:00-19:00',
        saturday: '09:00-13:00',
        sunday: 'Chiuso'
      },
      rating: 4.8,
      reviewCount: 127,
      createdAt: new Date().toISOString(),
      setupComplete: true,
      googleCalendar: { connected: false }
    };
    
    await users.insertOne(demoClinic);
    console.log('✅ Demo clinic created: demo@vetbuddy.it / DemoVet2025!');
    
    // Create Demo Owner 1 - Mario Rossi
    const owner1Id = uuidv4();
    const demoOwner1 = {
      id: owner1Id,
      email: 'mario.rossi@email.com',
      password: hashPassword('Password123!'),
      name: 'Mario Rossi',
      role: 'owner',
      phone: '+39 333 1234567',
      city: 'Milano',
      clinicId: clinicId,
      createdAt: new Date().toISOString()
    };
    
    await users.insertOne(demoOwner1);
    console.log('✅ Demo owner 1 created: mario.rossi@email.com / Password123!');
    
    // Create Demo Owner 2 - Anna Bianchi
    const owner2Id = uuidv4();
    const demoOwner2 = {
      id: owner2Id,
      email: 'anna.bianchi@email.com',
      password: hashPassword('Password123!'),
      name: 'Anna Bianchi',
      role: 'owner',
      phone: '+39 333 7654321',
      city: 'Milano',
      clinicId: clinicId,
      createdAt: new Date().toISOString()
    };
    
    await users.insertOne(demoOwner2);
    console.log('✅ Demo owner 2 created: anna.bianchi@email.com / Password123!');
    
    // Create Demo Pets
    const pet1Id = uuidv4();
    const pet2Id = uuidv4();
    const pet3Id = uuidv4();
    
    const demoPets = [
      {
        id: pet1Id,
        name: 'Luna',
        species: 'Cane',
        breed: 'Labrador',
        birthDate: '2020-03-15',
        weight: 28,
        microchip: '380260000123456',
        sterilized: true,
        allergies: ['Pollo'],
        medications: [],
        notes: 'Molto socievole, ama giocare con altri cani',
        ownerId: owner1Id,
        clinicId: clinicId,
        createdAt: new Date().toISOString()
      },
      {
        id: pet2Id,
        name: 'Milo',
        species: 'Gatto',
        breed: 'Europeo',
        birthDate: '2019-07-22',
        weight: 5,
        microchip: '380260000789012',
        sterilized: true,
        allergies: [],
        medications: ['Antiparassitario mensile'],
        notes: 'Un po\' timido con le persone nuove',
        ownerId: owner1Id,
        clinicId: clinicId,
        createdAt: new Date().toISOString()
      },
      {
        id: pet3Id,
        name: 'Rocky',
        species: 'Cane',
        breed: 'Golden Retriever',
        birthDate: '2021-11-08',
        weight: 32,
        microchip: '380260000456789',
        sterilized: false,
        allergies: [],
        medications: [],
        notes: 'Energico e giocherellone',
        ownerId: owner2Id,
        clinicId: clinicId,
        createdAt: new Date().toISOString()
      }
    ];
    
    await pets.insertMany(demoPets);
    console.log('✅ Demo pets created: Luna, Milo, Rocky');
    
    // Create Demo Appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const demoAppointments = [
      {
        id: uuidv4(),
        clinicId: clinicId,
        ownerId: owner1Id,
        ownerName: 'Mario Rossi',
        petId: pet1Id,
        petName: 'Luna',
        date: tomorrow.toISOString().split('T')[0],
        time: '10:00',
        service: 'Vaccino',
        reason: 'Richiamo vaccino annuale',
        status: 'confermato',
        staffId: null,
        notes: '',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        clinicId: clinicId,
        ownerId: owner1Id,
        ownerName: 'Mario Rossi',
        petId: pet2Id,
        petName: 'Milo',
        date: nextWeek.toISOString().split('T')[0],
        time: '15:30',
        service: 'Visita di controllo',
        reason: 'Controllo generale annuale',
        status: 'in attesa',
        staffId: null,
        notes: '',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        clinicId: clinicId,
        ownerId: owner2Id,
        ownerName: 'Anna Bianchi',
        petId: pet3Id,
        petName: 'Rocky',
        date: tomorrow.toISOString().split('T')[0],
        time: '11:30',
        service: 'Visita',
        reason: 'Controllo zampa anteriore',
        status: 'confermato',
        staffId: null,
        notes: 'Il cane zoppica leggermente',
        createdAt: new Date().toISOString()
      }
    ];
    
    await appointments.insertMany(demoAppointments);
    console.log('✅ Demo appointments created');
    
    // Create Demo Documents
    const demoDocuments = [
      {
        id: uuidv4(),
        name: 'Libretto Vaccinale Luna',
        type: 'Libretto vaccinale',
        status: 'completato',
        clinicId: clinicId,
        ownerId: owner1Id,
        petId: pet1Id,
        petName: 'Luna',
        ownerEmail: 'mario.rossi@email.com',
        notes: 'Vaccinazioni complete',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Referto Analisi Milo',
        type: 'Referto',
        status: 'inviato',
        clinicId: clinicId,
        ownerId: owner1Id,
        petId: pet2Id,
        petName: 'Milo',
        ownerEmail: 'mario.rossi@email.com',
        notes: 'Analisi del sangue - tutti i valori nella norma',
        createdAt: new Date().toISOString()
      }
    ];
    
    await documents.insertMany(demoDocuments);
    console.log('✅ Demo documents created');
    
    console.log('\n========================================');
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log('📋 CREDENZIALI DI ACCESSO:\n');
    console.log('🏥 CLINICA:');
    console.log('   Email: demo@vetbuddy.it');
    console.log('   Password: DemoVet2025!\n');
    console.log('🐾 PROPRIETARIO 1:');
    console.log('   Email: mario.rossi@email.com');
    console.log('   Password: Password123!\n');
    console.log('🐾 PROPRIETARIO 2:');
    console.log('   Email: anna.bianchi@email.com');
    console.log('   Password: Password123!\n');
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB Atlas');
  }
}

seedDatabase();
