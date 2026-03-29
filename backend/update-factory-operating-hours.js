require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

const updateFactoryOperatingHours = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all Factory users
    const factories = await User.find({ role: 'Factory' });
    console.log(`🏭 Found ${factories.length} Factory users\n`);

    let updatedCount = 0;

    for (const factory of factories) {
      console.log(`\n📋 Factory: ${factory.name} (${factory.factoryName})`);
      console.log(`   Current operating season: ${factory.operatingHours?.season || 'Not set'}`);
      
      // Update operating hours to October to March
      factory.operatingHours = factory.operatingHours || {};
      factory.operatingHours.season = 'October to March';
      
      await factory.save();
      updatedCount++;
      
      console.log(`   ✅ Updated to: October to March`);
    }

    console.log(`\n\n📊 Summary:`);
    console.log(`   Total factories: ${factories.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`\n✅ All factory operating hours updated to "October to March"!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateFactoryOperatingHours();
