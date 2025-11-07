const axios = require('axios');
const User = require('./models/user.model');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api';

async function testFactoryHHMAssociation() {
  console.log('🧪 Testing Factory-HHM Association Fix...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
    console.log('✅ Connected to MongoDB');

    // 1. Get all factories to test with
    console.log('\n📋 Step 1: Getting all factories...');
    const factoriesResponse = await axios.get(`${BASE_URL}/public/factories`);
    const factories = factoriesResponse.data.data.factories;
    
    console.log(`Found ${factories.length} factories:`);
    factories.forEach(factory => {
      console.log(`  - ${factory.name} (ID: ${factory.id})`);
    });

    // 2. Test each factory's associated HHMs endpoint
    console.log('\n🔍 Step 2: Testing individual factory HHM associations...');
    
    for (let i = 0; i < Math.min(factories.length, 3); i++) { // Test first 3 factories
      const factory = factories[i];
      console.log(`\n🏭 Testing factory: ${factory.name} (ID: ${factory.id})`);

      try {
        // Get factory details including associated HHMs
        const factoryResponse = await axios.get(`${BASE_URL}/public/factories/${factory.id}`);
        const factoryData = factoryResponse.data.data.factory;
        
        console.log(`  📊 Factory Details:`);
        console.log(`    - Name: ${factoryData.name}`);
        console.log(`    - Location: ${factoryData.location}`);
        console.log(`    - Associated HHMs Count: ${factoryData.hhmCount}`);
        
        if (factoryData.associatedHHMs && factoryData.associatedHHMs.length > 0) {
          console.log(`  👥 Associated HHMs:`);
          factoryData.associatedHHMs.forEach((hhm, index) => {
            console.log(`    ${index + 1}. ${hhm.name} (${hhm.username}) - ${hhm.email}`);
          });
        } else {
          console.log(`  ❌ No associated HHMs found`);
        }

        // Also check the database directly
        const dbFactory = await User.findById(factory.id).select('associatedHHMs');
        if (dbFactory && dbFactory.associatedHHMs) {
          console.log(`  📄 Database associatedHHMs field: ${dbFactory.associatedHHMs.length} entries`);
          if (dbFactory.associatedHHMs.length > 0) {
            console.log(`    Database HHM IDs: [${dbFactory.associatedHHMs.join(', ')}]`);
          }
        } else {
          console.log(`  📄 Database: No associatedHHMs field or empty array`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error testing factory ${factory.name}:`, error.message);
      }
    }

    // 3. Show all HHMs for reference
    console.log('\n📋 Step 3: All HHMs in the system (for reference)...');
    const allHHMs = await User.find({ role: 'HHM' }).select('name username email').lean();
    console.log(`Total HHMs: ${allHHMs.length}`);
    allHHMs.forEach((hhm, index) => {
      console.log(`  ${index + 1}. ${hhm.name} (${hhm.username}) - ${hhm.email}`);
    });

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📝 MongoDB connection closed');
    }
  }
}

// Run the test
if (require.main === module) {
  testFactoryHHMAssociation();
}

module.exports = { testFactoryHHMAssociation };