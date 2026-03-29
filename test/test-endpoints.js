const axios = require('axios');

async function testEndpoints() {
  try {
    console.log('🧪 Testing API endpoints...\n');

    // Test 1: Health endpoint (no auth required)
    console.log('1. Testing health endpoint...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Health endpoint works:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Health endpoint failed:', error.message);
      return; // Exit if basic connectivity fails
    }

    // Test 2: Listings endpoint (auth required) - should get 401
    console.log('\n2. Testing listings endpoint without auth...');
    try {
      const listingsResponse = await axios.get('http://localhost:5000/api/listings/marketplace');
      console.log('❌ Unexpected success (should fail with auth error)');
    } catch (error) {
      if (error.response) {
        console.log('✅ Expected auth error:');
        console.log('  Status:', error.response.status);
        console.log('  Message:', error.response.data?.message || error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Non-existent endpoint - should get 404
    console.log('\n3. Testing non-existent endpoint...');
    try {
      const nonExistentResponse = await axios.get('http://localhost:5000/api/nonexistent');
      console.log('❌ Unexpected success for non-existent endpoint');
    } catch (error) {
      if (error.response) {
        console.log('✅ Expected 404 for non-existent endpoint:');
        console.log('  Status:', error.response.status);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEndpoints();