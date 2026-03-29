require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Import models
const User = require('./models/user.model');

const testFactoryHHMs = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    const factoryId = '695563d36ca6b32dcf2b8d7a';
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

    // Check associated HHMs
    console.log('\n🔍 Checking associated HHMs...');
    console.log(`Raw associatedHHMs: ${JSON.stringify(factory.associatedHHMs, null, 2)}`);

    if (factory.associatedHHMs && factory.associatedHHMs.length > 0) {
      console.log(`\n👥 Found ${factory.associatedHHMs.length} associated HHMs:`);
      
      for (let i = 0; i < factory.associatedHHMs.length; i++) {
        const hhmId = factory.associatedHHMs[i];
        const hhm = await User.findById(hhmId);
        
        if (hhm) {
          console.log(`\n${i + 1}. ${hhm.name} (@${hhm.username})`);
          console.log(`   📧 Email: ${hhm.email}`);
          console.log(`   📞 Phone: ${hhm.phone}`);
          console.log(`   📍 Location: ${hhm.location}`);
          console.log(`   👤 Role: ${hhm.role}`);
          console.log(`   📅 Experience: ${hhm.experience} years`);
        } else {
          console.log(`\n❌ HHM with ID ${hhmId} not found`);
        }
      }
    } else {
      console.log('📋 No associated HHMs found for this factory');
    }

    // Test the API endpoint format
    console.log('\n🔗 Testing API population...');
    const populatedFactory = await User.findById(factoryId)
      .populate('associatedHHMs', 'name username email phone location experience profilePicture')
      .lean();

    if (populatedFactory.associatedHHMs && populatedFactory.associatedHHMs.length > 0) {
      console.log('\n✅ Populated HHMs:');
      populatedFactory.associatedHHMs.forEach((hhm, index) => {
        console.log(`${index + 1}. ${hhm.name} (@${hhm.username})`);
        console.log(`   Location: ${hhm.location}`);
        console.log(`   Experience: ${hhm.experience} years`);
      });
    } else {
      console.log('📋 No populated HHMs available');
    }

    console.log('\n✨ Test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during test:', error);
    process.exit(1);
  }
};

testFactoryHHMs();