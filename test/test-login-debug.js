const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Testing login and token validation...\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in as Meena Kumari...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'meenalabour',
      password: '123456'
    });
    
    console.log('Login response:', {
      status: loginResponse.status,
      success: loginResponse.data.success,
      message: loginResponse.data.message,
      hasToken: !!loginResponse.data.token,
      tokenLength: loginResponse.data.token ? loginResponse.data.token.length : 0
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received\n');
    console.log('🔑 Token preview:', token.substring(0, 50) + '...');
    
    // Step 2: Test token with a simple endpoint
    console.log('\n2️⃣ Testing token with worker profile endpoint...');
    
    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('📤 Request headers:', headers);
    
    try {
      const profileResponse = await axios.get('http://localhost:5000/api/worker/profile', { headers });
      console.log('✅ Profile request successful!');
      console.log('📋 Response:', {
        status: profileResponse.status,
        success: profileResponse.data.success,
        hasProfile: !!profileResponse.data.profile
      });
      
      if (profileResponse.data.profile) {
        console.log('👤 Profile data:', {
          name: profileResponse.data.profile.name,
          role: profileResponse.data.profile.role,
          skills: profileResponse.data.profile.skills,
          skillsType: typeof profileResponse.data.profile.skills
        });
      }
      
    } catch (profileError) {
      console.log('❌ Profile request failed:');
      console.log('Status:', profileError.response?.status);
      console.log('Message:', profileError.response?.data?.message);
      console.log('Full error:', profileError.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

testLogin();