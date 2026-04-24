const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login with fixed credentials...\n');

    const response = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravi_farmer',  // Changed from 'username' to 'identifier'
      password: 'password123'
    });

    console.log('✅ LOGIN SUCCESSFUL!');
    console.log(`👤 User: ${response.data.user.name}`);
    console.log(`👤 Role: ${response.data.user.role}`);
    console.log(`🔑 Token: ${response.data.token.substring(0, 20)}...`);
    console.log('\n🎉 Login issue is now FIXED!');
    console.log('\n📝 Credentials that work:');
    console.log('   Username: ravi_farmer');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Login still failing:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
  }
}

testLogin();