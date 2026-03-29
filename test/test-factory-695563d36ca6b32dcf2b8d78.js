require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Import models
const User = require('./models/user.model');

const testSpecificFactory = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    const factoryId = '695563d36ca6b32dcf2b8d78';
    console.log(`\n🏭 Testing Factory: ${factoryId}`);

    // Check if factory exists
    const factory = await User.findById(factoryId);
    if (!factory) {
      console.log('❌ Factory not found!');
      process.exit(1);
    }

    console.log(`✅ Factory found: ${factory.name} (${factory.role})`);
    console.log(`📧 Email: ${factory.email}`);
    console.log(`📍 Location: ${factory.location}`);
    console.log(`Associated HHMs count: ${factory.associatedHHMs ? factory.associatedHHMs.length : 0}`);

    // Check available HHMs for association
    const allHHMs = await User.find({ role: 'HHM' });
    console.log(`\n👥 Total HHMs available for association: ${allHHMs.length}`);

    // Check which HHMs are already associated
    const associatedHHMIds = factory.associatedHHMs || [];
    const availableHHMs = allHHMs.filter(hhm => !associatedHHMIds.includes(hhm._id.toString()));
    console.log(`📋 Available HHMs for new association: ${availableHHMs.length}`);

    if (availableHHMs.length > 0) {
      console.log('\n🔗 Available HHMs for association:');
      availableHHMs.slice(0, 5).forEach((hhm, index) => {
        console.log(`${index + 1}. ${hhm.name} (@${hhm.username}) - ${hhm.location}`);
      });
    }

    console.log('\n✨ Test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
};

testSpecificFactory();