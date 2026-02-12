const { MongoClient } = require('mongodb');
require('dotenv').config();

async function updateClinicPlan() {
  const client = new MongoClient(process.env.MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'vetbuddy');
    
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
    console.log('Clinic plan now:', clinic?.subscriptionPlan || clinic?.plan || 'starter');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateClinicPlan();
