const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test labour/worker profile functionality
async function testLabourProfile() {
    console.log('🧪 Testing Labour Profile Functionality...\n');
    
    try {
        // 1. Login as labour user
        console.log('1. Logging in as labour user...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            identifier: 'amitlabour',
            password: '123456'
        });
        
        const token = loginResponse.data.data.token;
        const user = loginResponse.data.data.user;
        
        console.log('✅ Login successful');
        console.log(`   User: ${user.username} (${user.role})`);
        console.log(`   Token: ${token.substring(0, 20)}...`);
        
        // 2. Get labour profile
        console.log('\n2. Getting labour profile...');
        const profileResponse = await axios.get(`${BASE_URL}/worker/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Profile retrieved successfully');
        console.log('   Full response structure:');
        console.log('   Keys:', Object.keys(profileResponse.data));
        console.log('   Response:', JSON.stringify(profileResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('   Response data:', error.response.data);
        }
    }
}

// Run the test
testLabourProfile();