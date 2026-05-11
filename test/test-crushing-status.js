// Test script for Crushing Status API endpoints
// Run this with: node test-crushing-status.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const TEST_CONFIG = {
  // You'll need to replace this with a valid factory user token
  factoryToken: 'your-factory-token-here',
  factoryId: 'your-factory-id-here'
};

async function testCrushingStatusAPI() {
  console.log('🧪 Testing Crushing Status API Endpoints\n');
  
  try {
    // Test 1: Get current crushing status
    console.log('📋 Test 1: Get current crushing status');
    const getResponse = await axios.get(`${BASE_URL}/api/factory/crushing-status`, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.factoryToken}`
      }
    });
    
    console.log('✅ Get Status Response:', getResponse.data);
    console.log(`   Current status: ${getResponse.data.data.crushingStatus}\n`);

    // Test 2: Update crushing status to ON
    console.log('🔄 Test 2: Update crushing status to ON');
    const updateOnResponse = await axios.put(`${BASE_URL}/api/factory/crushing-status`, {
      crushingStatus: 'ON'
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.factoryToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Update to ON Response:', updateOnResponse.data);
    console.log(`   Updated status: ${updateOnResponse.data.data.crushingStatus}\n`);

    // Test 3: Update crushing status to OFF
    console.log('🔄 Test 3: Update crushing status to OFF');
    const updateOffResponse = await axios.put(`${BASE_URL}/api/factory/crushing-status`, {
      crushingStatus: 'OFF'
    }, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.factoryToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Update to OFF Response:', updateOffResponse.data);
    console.log(`   Updated status: ${updateOffResponse.data.data.crushingStatus}\n`);

    // Test 4: Test invalid status
    console.log('❌ Test 4: Test invalid crushing status');
    try {
      await axios.put(`${BASE_URL}/api/factory/crushing-status`, {
        crushingStatus: 'INVALID'
      }, {
        headers: {
          'Authorization': `Bearer ${TEST_CONFIG.factoryToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.log('✅ Invalid Status Response (Expected Error):', error.response.data);
      console.log('   This error is expected for invalid status values\n');
    }

    // Test 5: Get public factory data with crushing status
    console.log('🌍 Test 5: Get public factory data');
    const publicResponse = await axios.get(`${BASE_URL}/api/public/factories/${TEST_CONFIG.factoryId}`);
    
    console.log('✅ Public Factory Response:', publicResponse.data);
    console.log(`   Public status display: ${publicResponse.data.data.factory.crushingStatus}\n`);

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Instructions for running tests
function printTestInstructions() {
  console.log('📝 Test Instructions:');
  console.log('1. Ensure backend server is running on port 5000');
  console.log('2. Create a factory user account and get authentication token');
  console.log('3. Update TEST_CONFIG with valid factoryToken and factoryId');
  console.log('4. Run: node test-crushing-status.js\n');
}

// Check if config is set up
if (TEST_CONFIG.factoryToken === 'your-factory-token-here') {
  printTestInstructions();
  console.log('⚠️  Please configure TEST_CONFIG before running tests');
} else {
  testCrushingStatusAPI();
}

module.exports = { testCrushingStatusAPI };