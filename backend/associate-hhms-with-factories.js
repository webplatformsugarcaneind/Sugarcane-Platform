const mongoose = require('mongoose');
const User = require('./models/user.model');

// Load environment variables
require('dotenv').config();

async function associateHHMsWithFactories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
    console.log('✅ Connected to MongoDB\n');

    // Get all factories and HHMs
    const factories = await User.find({ role: 'Factory' }).lean();
    const hhms = await User.find({ role: 'HHM' }).lean();

    console.log(`Found ${factories.length} factories and ${hhms.length} HHMs\n`);

    // Create specific associations to make each factory unique
    const associations = [
      {
        factoryName: 'Green Valley Sugar Mills',
        associatedHHMs: ['Sunita Sharma', 'Babulal Amin Tandure'] // 2 HHMs
      },
      {
        factoryName: 'Golden Sugarcane Industries', 
        associatedHHMs: ['Vikram Singh'] // 1 HHM
      },
      {
        factoryName: 'Sunrise Sugar Corporation',
        associatedHHMs: ['Sunil Kumar', 'Vikram Singh'] // 2 HHMs
      },
      {
        factoryName: 'Maharashtra Sugar Mills',
        associatedHHMs: [] // No HHMs
      }
    ];

    for (const association of associations) {
      console.log(`🔄 Processing ${association.factoryName}...`);
      
      // Find the factory
      const factory = factories.find(f => 
        f.factoryName === association.factoryName || 
        f.name?.includes(association.factoryName)
      );
      
      if (!factory) {
        console.log(`❌ Factory "${association.factoryName}" not found`);
        continue;
      }

      // Find HHM IDs
      const hhmIds = [];
      for (const hhmName of association.associatedHHMs) {
        const hhm = hhms.find(h => h.name === hhmName);
        if (hhm) {
          hhmIds.push(hhm._id);
          console.log(`  ✅ Found HHM: ${hhmName} (${hhm._id})`);
        } else {
          console.log(`  ❌ HHM "${hhmName}" not found`);
        }
      }

      // Update the factory with associated HHMs
      const updateResult = await User.updateOne(
        { _id: factory._id },
        { $set: { associatedHHMs: hhmIds } }
      );

      console.log(`  📝 Updated factory with ${hhmIds.length} HHMs (${updateResult.modifiedCount} modified)\n`);
    }

    console.log('✅ All associations created successfully!');

    // Verify the results
    console.log('\n📋 Verification:');
    const updatedFactories = await User.find({ role: 'Factory' }).lean();
    
    for (const factory of updatedFactories) {
      console.log(`\n🏭 ${factory.factoryName || factory.name}:`);
      console.log(`  - associatedHHMs: ${factory.associatedHHMs ? factory.associatedHHMs.length : 0} entries`);
      
      if (factory.associatedHHMs && factory.associatedHHMs.length > 0) {
        const associatedHHMs = await User.find({ 
          _id: { $in: factory.associatedHHMs },
          role: 'HHM'
        }).select('name').lean();
        
        associatedHHMs.forEach(hhm => {
          console.log(`    - ${hhm.name}`);
        });
      } else {
        console.log(`    - No associated HHMs`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n📝 MongoDB connection closed');
    }
  }
}

associateHHMsWithFactories();
