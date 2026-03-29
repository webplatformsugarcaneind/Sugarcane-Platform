require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

const removeOperatingHours = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all Factory users
    const factories = await User.find({ role: 'Factory' });
    console.log(`🏭 Found ${factories.length} Factory users\n`);

    let updatedCount = 0;

    for (const factory of factories) {
      console.log(`📋 Factory: ${factory.name} (${factory.factoryName})`);
      console.log(`   Current operatingHours: ${JSON.stringify(factory.operatingHours)}`);
      
      // Remove operatingHours field
      factory.operatingHours = undefined;
      
      await factory.save();
      updatedCount++;
      
      console.log(`   ✅ Removed operatingHours field\n`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total factories: ${factories.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`\n✅ OperatingHours field removed from all factory users!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

removeOperatingHours();
