const axios = require('axios');

async function testFarmerProfileAPI() {
  try {
    console.log('🔐 Testing Farmer profile API access...');
    
    // Add delay to ensure server is ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Login with farmer user
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravi.patel@example.com',
      password: '123456'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful for farmer!');

    // Get farmer profile
    const profileResponse = await axios.get('http://localhost:5000/api/farmer/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Farmer profile API working!');
    console.log('📋 Response:', JSON.stringify(profileResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Server not running on http://localhost:5000');
    }
  }
}

testFarmerProfileAPI();