const axios = require('axios');

async function testFarmerProfile() {
  try {
    console.log('🔐 Testing Farmer profile access...');
    
    // Add a delay to ensure server is ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Login with a farmer user (Ravi Patel)
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravi.patel@example.com',
      password: '123456'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful for farmer user!');
    console.log('🔑 Token received:', token.substring(0, 20) + '...');

    // Get farmer profile
    const profileResponse = await axios.get('http://localhost:5000/api/farmer/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Farmer profile endpoint working!');
    console.log('🔍 Full response data:', JSON.stringify(profileResponse.data, null, 2));
    
    const profile = profileResponse.data.profile || profileResponse.data.data;
    
    console.log('\n📋 Farmer Profile Data:');
    console.log('Name:', profile.name);
    console.log('Username:', profile.username);
    console.log('Email:', profile.email);
    console.log('Phone:', profile.phone);
    console.log('Role:', profile.role);
    console.log('Farm Size:', profile.farmSize);
    console.log('Farming Experience:', profile.farmingExperience);
    console.log('Farming Methods:', profile.farmingMethods);
    console.log('Equipment:', profile.equipment);
    console.log('Certifications:', profile.certifications);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Server is not running on http://localhost:5000');
      console.error('Please start the backend server first with: node server.js');
    }
  }
}

testFarmerProfile();