const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/vetbuddy';
const ADMIN_EMAIL = 'info@vetbuddy.it';
const NEW_PASSWORD = 'VetBuddy2025!';

async function updateAdminPassword() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const users = db.collection('users');
    
    // Find admin user
    const admin = await users.findOne({ email: ADMIN_EMAIL });
    
    if (!admin) {
      console.log('Admin user not found, creating...');
      const hashedPassword = bcrypt.hashSync(NEW_PASSWORD, 10);
      await users.insertOne({
        id: require('crypto').randomUUID(),
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: 'Admin VetBuddy',
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user found, updating password...');
      const hashedPassword = bcrypt.hashSync(NEW_PASSWORD, 10);
      await users.updateOne(
        { email: ADMIN_EMAIL },
        { $set: { password: hashedPassword, role: 'admin' } }
      );
      console.log('Admin password updated successfully');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateAdminPassword();
