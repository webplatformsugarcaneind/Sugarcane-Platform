const axios = require('axios');

async function debugLogin() {
  try {
    console.log('🔍 Debugging login response...\n');
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'meenalabour',
      password: '123456'
    });
    
    console.log('📄 Full login response:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
    }
  }
}

debugLogin();