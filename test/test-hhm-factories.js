require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/user.model');

const testHHMFactories = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    // Test with the HHMs that should be connected to deepakfactory
    const hhmIds = [
      '695563d36ca6b32dcf2b8d73', // Sunita Sharma
      '695563d36ca6b32dcf2b8d74', // Vikram Singh
      '695563d36ca6b32dcf2b8d75'  // Sunil Kumar
    ];

    for (const hhmId of hhmIds) {
      console.log(`\n🔍 Testing HHM: ${hhmId}`);
      
      const hhm = await User.findById(hhmId)
        .select('name username associatedFactories')
        .populate('associatedFactories', 'name factoryName username');
      
      if (hhm) {
        console.log(`✅ HHM found: ${hhm.name} (@${hhm.username})`);
        console.log(`📧 Raw associatedFactories:`, hhm.associatedFactories);
        console.log(`🏭 Found ${hhm.associatedFactories?.length || 0} associated factories`);
        
        if (hhm.associatedFactories && hhm.associatedFactories.length > 0) {
          hhm.associatedFactories.forEach((factory, idx) => {
            console.log(`  ${idx + 1}. ${factory.factoryName || factory.name} (@${factory.username})`);
          });
        }
      } else {
        console.log('❌ HHM not found');
      }
    }

    // Also test the factory to see which HHMs it has
    console.log(`\n\n🏭 Testing Factory: 695563d36ca6b32dcf2b8d7a (Deepak Sharma)`);
    const factory = await User.findById('695563d36ca6b32dcf2b8d7a')
      .select('name username associatedHHMs');
    
    if (factory) {
      console.log(`✅ Factory found: ${factory.name} (@${factory.username})`);
      console.log(`📧 Raw associatedHHMs (IDs):`, factory.associatedHHMs);
      console.log(`👥 Has ${factory.associatedHHMs?.length || 0} HHMs in associatedHHMs field`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testHHMFactories();
