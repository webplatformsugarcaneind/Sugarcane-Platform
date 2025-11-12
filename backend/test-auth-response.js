const axios = require('axios');

const testAuthResponse = async () => {
  try {
    console.log('🔐 Testing auth response structure...\n');

    // 1. Login first to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // 2. Test auth/verify response
    const authResponse = await axios.get('http://localhost:5000/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📋 Auth verify response structure:');
    console.log('Full response:', JSON.stringify(authResponse.data, null, 2));
    
    if (authResponse.data.success) {
      console.log('\n🔍 User data access paths:');
      console.log('- User object:', authResponse.data.user ? 'Found' : 'Not Found');
      console.log('- User ID:', authResponse.data.user?._id || 'Not Found');
      console.log('- User Name:', authResponse.data.user?.name || 'Not Found');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testAuthResponse();