require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

const verifyFactoryOperatingHours = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all Factory users
    const factories = await User.find({ role: 'Factory' });
    console.log(`🏭 Found ${factories.length} Factory users\n`);

    console.log('📋 Current Operating Hours for all Factories:\n');

    factories.forEach((factory, index) => {
      console.log(`${index + 1}. ${factory.name} (${factory.factoryName})`);
      console.log(`   Operating Season: ${factory.operatingHours?.season || 'Not set'}`);
      console.log(`   Crushing Status: ${factory.crushingStatus || 'Not set'}`);
      console.log('');
    });

    // Check if all factories have "October to March"
    const allStandardized = factories.every(
      factory => factory.operatingHours?.season === 'October to March'
    );

    if (allStandardized) {
      console.log('✅ All factories have standardized operating season: "October to March"');
    } else {
      console.log('⚠️  Some factories have different operating seasons');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyFactoryOperatingHours();
