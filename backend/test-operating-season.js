require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function testOperatingSeason() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all factory users
    const factories = await User.find({ role: 'Factory' })
      .select('name factoryName operatingSeason crushingStatus');
    
    console.log('🏭 FACTORY OPERATING SEASON CHECK\n');
    console.log('='.repeat(60));
    
    factories.forEach((factory, index) => {
      console.log(`\n${index + 1}. ${factory.factoryName || factory.name}`);
      console.log(`   Operating Season: ${factory.operatingSeason || '❌ NOT SET'}`);
      console.log(`   Crushing Status: ${factory.crushingStatus || 'OFF'}`);
    });

    console.log('\n' + '='.repeat(60));
    
    const withSeason = factories.filter(f => f.operatingSeason);
    console.log(`\n✅ Factories with Operating Season: ${withSeason.length}/${factories.length}`);
    
    if (withSeason.length === factories.length) {
      console.log('🎉 SUCCESS: All factories have operating season set!');
    } else {
      console.log('⚠️  Some factories are missing operating season');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testOperatingSeason();
