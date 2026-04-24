require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function verifyOperatingSeason() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all factory users
    const factoryUsers = await User.find({ role: 'Factory' }).select('name email operatingSeason crushingStatus');
    
    console.log(`Found ${factoryUsers.length} factory users:\n`);
    
    factoryUsers.forEach((factory, index) => {
      console.log(`${index + 1}. ${factory.name} (${factory.email})`);
      console.log(`   Operating Season: ${factory.operatingSeason || 'Not set'}`);
      console.log(`   Crushing Status: ${factory.crushingStatus || 'Not set'}`);
      console.log('');
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyOperatingSeason();
