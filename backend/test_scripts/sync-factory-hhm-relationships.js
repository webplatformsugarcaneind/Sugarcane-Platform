require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/user.model');

/**
 * This script fixes the bidirectional relationship between factories and HHMs
 * It syncs the associatedFactories field in HHM documents based on factories' associatedHHMs
 */
const syncFactoryHHMRelationships = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('\n🔍 Finding all factories with associated HHMs...');
    const factories = await User.find({ 
      role: 'Factory',
      associatedHHMs: { $exists: true, $ne: [] }
    }).select('_id name username associatedHHMs');

    console.log(`\n✅ Found ${factories.length} factories with HHM associations\n`);

    let totalUpdates = 0;

    for (const factory of factories) {
      console.log(`\n🏭 Processing Factory: ${factory.name} (@${factory.username})`);
      console.log(`   Factory ID: ${factory._id}`);
      console.log(`   Has ${factory.associatedHHMs.length} associated HHMs`);

      for (const hhmId of factory.associatedHHMs) {
        const hhm = await User.findById(hhmId);
        
        if (!hhm) {
          console.log(`   ⚠️  HHM ${hhmId} not found - skipping`);
          continue;
        }

        if (hhm.role !== 'HHM') {
          console.log(`   ⚠️  User ${hhmId} is not an HHM (role: ${hhm.role}) - skipping`);
          continue;
        }

        // Check if factory is already in HHM's associatedFactories
        const currentFactories = hhm.associatedFactories || [];
        const factoryIdStr = factory._id.toString();
        const isAlreadyAssociated = currentFactories
          .map(id => id.toString())
          .includes(factoryIdStr);

        if (isAlreadyAssociated) {
          console.log(`   ✓ ${hhm.name} (@${hhm.username}) already has this factory`);
        } else {
          console.log(`   + Adding factory to ${hhm.name} (@${hhm.username})`);
          currentFactories.push(factory._id);
          await User.findByIdAndUpdate(hhmId, {
            associatedFactories: currentFactories
          });
          totalUpdates++;
        }
      }
    }

    console.log('\n\n📊 Summary:');
    console.log(`   Factories processed: ${factories.length}`);
    console.log(`   HHM records updated: ${totalUpdates}`);
    console.log('\n✅ Synchronization complete!\n');

    // Verify the results
    console.log('🔍 Verification - Checking HHMs with factories:');
    const hhmsWithFactories = await User.find({
      role: 'HHM',
      associatedFactories: { $exists: true, $ne: [] }
    }).select('_id name username associatedFactories').populate('associatedFactories', 'name factoryName username');

    for (const hhm of hhmsWithFactories) {
      console.log(`\n👤 ${hhm.name} (@${hhm.username})`);
      console.log(`   Associated with ${hhm.associatedFactories.length} factories:`);
      hhm.associatedFactories.forEach((factory, idx) => {
        console.log(`   ${idx + 1}. ${factory.factoryName || factory.name} (@${factory.username})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

syncFactoryHHMRelationships();
