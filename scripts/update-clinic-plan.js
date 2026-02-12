const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const MONGO_URL = envContent.match(/MONGO_URL=(.+)/)?.[1];
const DB_NAME = envContent.match(/DB_NAME=(.+)/)?.[1] || 'vetbuddy';

async function updateClinicPlan() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Update the demo clinic to Pro plan
    const result = await db.collection('users').updateOne(
      { email: 'clinica.demo@vetbuddy.it' },
      { 
        $set: { 
          subscriptionPlan: 'pro',
          plan: 'pro',
          planLimits: {
            maxUsers: 5,
            maxPatients: -1,
            automationsEnabled: true,
            automationsCount: 20,
            features: ['agenda_base', 'map_position', 'team_inbox', 'documents', 'google_calendar', 'reports', 'automations_basic']
          },
          pilotMember: true,
          planChangedAt: new Date()
        }
      }
    );
    
    console.log('Update result:', result);
    
    // Also check current state
    const clinic = await db.collection('users').findOne({ email: 'clinica.demo@vetbuddy.it' });
    console.log('Clinic plan now:', clinic?.subscriptionPlan || 'not found');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateClinicPlan();
