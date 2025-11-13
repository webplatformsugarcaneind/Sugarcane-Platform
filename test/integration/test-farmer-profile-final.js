const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test farmer profile functionality
async function testFarmerProfile() {
    console.log('🧪 Testing Farmer Profile Functionality...\n');
    
    try {
        // 1. Login as farmer
        console.log('1. Logging in as farmer...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            identifier: 'ravifarmer',
            password: '123456'
        });
        
        const token = loginResponse.data.data.token;
        const user = loginResponse.data.data.user;
        
        console.log('✅ Login successful');
        console.log(`   User: ${user.username} (${user.role})`);
        console.log(`   Token: ${token.substring(0, 20)}...`);
        
        // 2. Get farmer profile
        console.log('\n2. Getting farmer profile...');
        const profileResponse = await axios.get(`${BASE_URL}/farmer/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Profile retrieved successfully');
        console.log('   Full response:', JSON.stringify(profileResponse.data, null, 2));
        const profile = profileResponse.data.profile; // Changed from profileResponse.data
        console.log('   Profile data:');
        console.log(`   - Name: ${profile.name || 'Not set'}`);
        console.log(`   - Farm Size: ${profile.farmSize || 'Not set'}`);
        console.log(`   - Farming Experience: ${profile.farmingExperience || 'Not set'}`);
        console.log(`   - Location: ${profile.location || 'Not set'}`);
        console.log(`   - Phone: ${profile.phone || 'Not set'}`);
        console.log(`   - Equipment: ${profile.equipment || 'Not set'}`);
        
        // 3. Test profile update
        console.log('\n3. Testing profile update...');
        const updateData = {
            name: 'Ravi Patel (Updated)',
            farmSize: '25 acres',
            farmingExperience: '8 years',
            equipment: 'Tractor, Harvester, Plowing equipment'
        };
        
        const updateResponse = await axios.put(`${BASE_URL}/farmer/profile`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ Profile updated successfully');
        console.log('   Updated fields:');
        Object.entries(updateData).forEach(([key, value]) => {
            console.log(`   - ${key}: ${value}`);
        });
        
        // 4. Verify updated profile
        console.log('\n4. Verifying updated profile...');
        const verifyResponse = await axios.get(`${BASE_URL}/farmer/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const updatedProfile = verifyResponse.data.profile; // Changed from verifyResponse.data
        console.log('✅ Updated profile retrieved');
        console.log('   Verified updates:');
        Object.entries(updateData).forEach(([key, value]) => {
            const currentValue = updatedProfile[key];
            const match = currentValue === value ? '✅' : '❌';
            console.log(`   ${match} ${key}: ${currentValue}`);
        });
        
        console.log('\n🎉 All farmer profile tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
        if (error.response?.data) {
            console.error('   Response data:', error.response.data);
        }
    }
}

// Run the test
testFarmerProfile();