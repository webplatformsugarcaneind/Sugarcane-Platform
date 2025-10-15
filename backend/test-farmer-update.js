const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test farmer profile update
async function testFarmerUpdate() {
    console.log('🧪 Testing Farmer Profile Update...\n');
    
    try {
        // 1. Login as farmer
        console.log('1. Logging in as farmer...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            identifier: 'ravifarmer',
            password: '123456'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // 2. Update farmer profile with new fields
        console.log('\n2. Testing profile update with new fields...');
        const updateData = {
            name: 'Ravi Patel (Updated)',
            location: 'Nashik, Maharashtra',
            farmSize: '30 acres',
            farmingExperience: '15 years',
            equipment: 'Tractor, Modern Harvester, Irrigation pumps, Spraying equipment',
            cropTypes: 'Sugarcane, Rice, Vegetables',
            irrigationType: 'drip'
        };
        
        const updateResponse = await axios.put(`${BASE_URL}/farmer/profile`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Profile updated successfully');
        console.log('   Response:', JSON.stringify(updateResponse.data, null, 2));
        
        // 3. Get updated profile
        console.log('\n3. Verifying updated profile...');
        const profileResponse = await axios.get(`${BASE_URL}/farmer/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Updated profile retrieved');
        console.log('   Profile data:', JSON.stringify(profileResponse.data.profile, null, 2));
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('   Response data:', error.response.data);
        }
    }
}

// Run the test
testFarmerUpdate();