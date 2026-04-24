const axios = require('axios');

// Test the crushing status API endpoints
const testCrushingStatusAPI = async () => {
  try {
    console.log('🧪 Testing Crushing Status API...\n');
    
    // First, let's try to login as a factory user to get a token
    console.log('1. Logging in as factory user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'priyafactory',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, got token');
    console.log('🔍 Response data:', JSON.stringify(loginResponse.data, null, 2));
    
    // Test GET crushing status
    console.log('\n2. Getting current crushing status...');
    const getResponse = await axios.get('http://localhost:5000/api/factory/crushing-status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`✅ Current status: ${getResponse.data.data.crushingStatus}`);
    
    // Test PUT crushing status - change to ON
    console.log('\n3. Updating crushing status to ON...');
    const updateResponse = await axios.put('http://localhost:5000/api/factory/crushing-status', 
      { crushingStatus: 'ON' },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    console.log(`✅ Status updated to: ${updateResponse.data.data.crushingStatus}`);
    
    // Test GET again to confirm
    console.log('\n4. Confirming status change...');
    const confirmResponse = await axios.get('http://localhost:5000/api/factory/crushing-status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`✅ Confirmed status: ${confirmResponse.data.data.crushingStatus}`);
    
    console.log('\n🎉 All API tests passed! Crushing Status API is working correctly.');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
  }
};

testCrushingStatusAPI();