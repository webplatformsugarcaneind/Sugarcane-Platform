const mongoose = require('mongoose');
const User = require('./models/user.model');

// Load environment variables
require('dotenv').config();

async function checkDatabaseDirectly() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
    console.log('✅ Connected to MongoDB\n');

    // Check specific factory
    const factoryId = '68efa57c33a5085d2a45c697';
    console.log(`🔍 Checking factory ID: ${factoryId}\n`);

    // Get factory with full data
    const factory = await User.findById(factoryId).lean();
    
    if (factory) {
      console.log('Factory found:');
      console.log('- Name:', factory.factoryName || factory.name);
      console.log('- Role:', factory.role);
      console.log('- associatedHHMs field exists:', 'associatedHHMs' in factory);
      console.log('- associatedHHMs value:', factory.associatedHHMs);
      console.log('- associatedHHMs type:', typeof factory.associatedHHMs);
      console.log('- associatedHHMs length:', factory.associatedHHMs ? factory.associatedHHMs.length : 'N/A');
    } else {
      console.log('❌ Factory not found!');
    }

    // Now let's see what the API logic would return
    console.log('\n🔍 Simulating API logic...');
    
    let associatedHHMs = [];
    if (factory.associatedHHMs && factory.associatedHHMs.length > 0) {
      console.log('✅ Found associatedHHMs, fetching details...');
      associatedHHMs = await User.find({ 
        _id: { $in: factory.associatedHHMs },
        role: 'HHM'
      }).select('name username email phone role isActive createdAt').lean();
      console.log('✅ Associated HHMs found:', associatedHHMs.length);
    } else {
      console.log('❌ No associatedHHMs found or empty array');
      console.log('Will return empty array');
    }

    console.log('\nFinal result:');
    console.log('- associatedHHMs array length:', associatedHHMs.length);
    console.log('- HHM count:', associatedHHMs ? associatedHHMs.length : 0);

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

checkDatabaseDirectly();