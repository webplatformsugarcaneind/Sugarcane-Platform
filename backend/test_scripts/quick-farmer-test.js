const axios = require('axios');

// Quick test just for login and profile
async function quickTest() {
    try {
        console.log('Quick test - Login and profile...');
        
        // Login
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            identifier: 'ravifarmer',
            password: '123456'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Test endpoint first
        console.log('\n1. Testing new endpoint...');
        const testResponse = await axios.get('http://localhost:5000/api/farmer/test-profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Test endpoint response:');
        console.log(JSON.stringify(testResponse.data, null, 2));
        
        // Get profile
        console.log('\n2. Testing profile endpoint...');
        const profileResponse = await axios.get('http://localhost:5000/api/farmer/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Profile response structure:');
        console.log('Keys:', Object.keys(profileResponse.data));
        console.log('Response:', JSON.stringify(profileResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

quickTest();
