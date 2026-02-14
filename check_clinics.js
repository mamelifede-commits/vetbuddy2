const { MongoClient } = require('mongodb');

async function checkClinics() {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const db = client.db();
  
  // Count clinics
  const clinics = await db.collection('users').find({ role: 'clinic' }).toArray();
  console.log(`\n=== CLINICHE NEL DATABASE: ${clinics.length} ===\n`);
  
  clinics.forEach(c => {
    console.log(`- ID: ${c.id}`);
    console.log(`  Nome: ${c.clinicName || c.name}`);
    console.log(`  Città: ${c.city || 'N/A'}`);
    console.log(`  Indirizzo: ${c.address || 'N/A'}`);
    console.log(`  Lat/Lng: ${c.latitude || 'N/A'}, ${c.longitude || 'N/A'}`);
    console.log(`  Servizi: ${JSON.stringify(c.services || c.servicesOffered || [])}`);
    console.log('');
  });
  
  await client.close();
}

checkClinics().catch(console.error);
