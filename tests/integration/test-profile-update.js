const axios = require('axios');

// Test profile update functionality for all roles
async function testProfileUpdate() {
  const baseURL = 'http://localhost:5000';
  
  // Test data for different roles
  const testUsers = [
    {
      role: 'Labour',
      credentials: { identifier: 'amitlabour', password: '123456' },
      updateData: {
        name: 'Amit Kumar Updated',
        phone: '9999999999',
        skills: 'Harvesting, Planting, Equipment Operation',
        farmLocation: 'Pune, Maharashtra',
        availability: 'Available'
      },
      endpoint: '/api/worker/profile'
    },
    {
      role: 'Farmer',
      credentials: { identifier: 'ravifarmer', password: '123456' },
      updateData: {
        name: 'Ravi Patel Updated',
        phone: '8888888888',
        location: 'Nashik, Maharashtra',
        farmSize: '15 acres'
      },
      endpoint: '/api/farmer/profile'
    }
  ];

  for (const testUser of testUsers) {
    try {
      console.log(`\n🧪 Testing profile update for ${testUser.role} role...`);
      
      // Step 1: Login to get token
      console.log('Step 1: Logging in...');
      console.log('Login credentials:', testUser.credentials);
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, testUser.credentials);
      
      console.log('Login response status:', loginResponse.status);
      console.log('Login response data:', loginResponse.data);
      
      if (!loginResponse.data.success) {
        console.log('❌ Login failed:', loginResponse.data.message);
        continue;
      }
      
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful');
      
      // Step 2: Get current profile
      console.log('Step 2: Getting current profile...');
      const profileResponse = await axios.get(`${baseURL}${testUser.endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!profileResponse.data.success) {
        console.log('❌ Get profile failed:', profileResponse.data.message);
        continue;
      }
      
      console.log('✅ Current profile retrieved');
      console.log('Current name:', profileResponse.data.profile.name);
      console.log('Current phone:', profileResponse.data.profile.phone);
      
      // Step 3: Update profile
      console.log('Step 3: Updating profile...');
      const updateResponse = await axios.put(`${baseURL}${testUser.endpoint}`, testUser.updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!updateResponse.data.success) {
        console.log('❌ Profile update failed:', updateResponse.data.message);
        console.log('Error details:', updateResponse.data.error);
        continue;
      }
      
      console.log('✅ Profile update successful');
      console.log('Updated name:', updateResponse.data.profile.name);
      console.log('Updated phone:', updateResponse.data.profile.phone);
      
      // Step 4: Verify update by getting profile again
      console.log('Step 4: Verifying update...');
      const verifyResponse = await axios.get(`${baseURL}${testUser.endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!verifyResponse.data.success) {
        console.log('❌ Verification failed:', verifyResponse.data.message);
        continue;
      }
      
      const verifiedProfile = verifyResponse.data.profile;
      console.log('✅ Verification successful');
      console.log('Verified name:', verifiedProfile.name);
      console.log('Verified phone:', verifiedProfile.phone);
      
      // Check if changes were persisted
      const nameUpdated = verifiedProfile.name === testUser.updateData.name;
      const phoneUpdated = verifiedProfile.phone === testUser.updateData.phone;
      
      if (nameUpdated && phoneUpdated) {
        console.log('🎉 Database persistence confirmed! Changes were saved successfully.');
      } else {
        console.log('⚠️ Database persistence issue:');
        console.log('  Name updated:', nameUpdated);
        console.log('  Phone updated:', phoneUpdated);
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${testUser.role}:`);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      } else {
        console.log('Error message:', error.message);
      }
    }
  }
  
  console.log('\n✅ Profile update test completed!');
}

// Run the test
testProfileUpdate();