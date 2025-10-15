const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testLabourProfile() {
  console.log('🧪 Testing Labour Profile Against Live Server...\n');
  
  try {
    // 1. Login first
    console.log('1. Logging in as labour user...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'amitlabour',
      password: '123456'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('   User:', loginResponse.data.user.username, `(${loginResponse.data.user.role})`);
    console.log('   Token:', token.substring(0, 20) + '...\n');
    
    // 2. Get profile
    console.log('2. Getting labour profile...');
    const profileResponse = await axios.get(`${API_BASE}/worker/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile retrieved successfully');
    console.log('   Full response structure:');
    console.log('   Keys:', Object.keys(profileResponse.data));
    console.log('   Response:', JSON.stringify(profileResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLabourProfile();