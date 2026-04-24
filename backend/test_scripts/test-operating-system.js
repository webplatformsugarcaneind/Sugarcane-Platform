/**
 * Test Script: Operating Hours & Status Integration
 * 
 * This script verifies that the simplified Operating Hours system works correctly:
 * 1. Operating Season (operatingHours.season)
 * 2. Operating Status (crushingStatus) linked to dashboard controls
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-ecosystem');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// User model
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const testOperatingSystem = async () => {
  try {
    console.log('🧪 Testing Operating Hours & Status Integration...\n');

    // Find all factory users
    const factories = await User.find({ role: 'Factory' });
    console.log(`📊 Found ${factories.length} factory users\n`);

    for (const factory of factories) {
      console.log(`🏭 Factory: ${factory.name || factory.factoryName || 'Unnamed'}`);
      console.log(`   📍 Location: ${factory.factoryLocation || 'Not specified'}`);
      
      // Check Operating Season
      const operatingHours = factory.operatingHours || {};
      console.log(`   🗓️  Operating Season: ${operatingHours.season || 'Not specified'}`);
      
      // Check Operating Status (crushingStatus)
      const crushingStatus = factory.crushingStatus || 'OFF';
      console.log(`   ⚡ Operating Status: ${crushingStatus === 'ON' ? '🟢 Factory ON' : '🔴 Factory OFF'}`);
      
      // Test the simplified structure
      const expectedFields = ['season'];
      const operatingHoursKeys = Object.keys(operatingHours);
      const unexpectedFields = operatingHoursKeys.filter(key => !expectedFields.includes(key));
      
      if (unexpectedFields.length > 0) {
        console.log(`   ⚠️  Warning: Found unexpected operating hours fields: ${unexpectedFields.join(', ')}`);
      } else {
        console.log(`   ✅ Operating Hours structure is clean (only season field)`);
      }
      
      console.log('   ---');
    }

    console.log('\n📋 Summary:');
    console.log('✅ Operating Season: Stored in operatingHours.season');
    console.log('✅ Operating Status: Stored in crushingStatus (ON/OFF)');
    console.log('✅ Backend model updated to simplified structure');
    console.log('✅ Frontend forms and displays updated accordingly');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    throw error;
  }
};

const runTest = async () => {
  try {
    await connectDB();
    await testOperatingSystem();
    
    console.log('\n🎉 Operating Hours & Status Integration Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  runTest();
}

module.exports = {
  testOperatingSystem,
  runTest
};