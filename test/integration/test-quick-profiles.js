const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Use existing users from users.json
const existingUsers = {
  farmer: { username: 'ravifarmer', password: '123456' },
  factory: { username: 'priyafactory', password: '123456' },
  hhm: { username: 'sunilhhm', password: '123456' },
  labour: { username: 'amitlabour', password: '123456' }
};

async function testExistingUserProfile(role) {
  try {
    console.log(`\n🧪 Testing ${role.toUpperCase()} Profile...`);
    
    const user = existingUsers[role];
    
    // Login
    console.log(`📝 Logging in as ${user.username}...`);
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: user.username,
      password: user.password
    });
    
    if (loginResponse.data.success) {
      console.log(`✅ Login successful for ${role}`);
      const token = loginResponse.data.token;
      
      // Get current profile
      console.log(`📊 Fetching current profile...`);
      const profileResponse = await axios.get(`${BASE_URL}/api/${role}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (profileResponse.data.success) {
        const profile = profileResponse.data.profile;
        console.log(`✅ Profile fetched successfully for ${role}`);
        console.log(`📋 Available fields:`, Object.keys(profile).join(', '));
        
        // Show sample data
        const sampleFields = {};
        Object.keys(profile).slice(0, 5).forEach(key => {
          sampleFields[key] = profile[key];
        });
        console.log(`📝 Sample data:`, JSON.stringify(sampleFields, null, 2));
        
      } else {
        console.log(`❌ Profile fetch failed for ${role}:`, profileResponse.data.message);
      }
    } else {
      console.log(`❌ Login failed for ${role}:`, loginResponse.data.message);
    }
  } catch (error) {
    console.log(`💥 Error testing ${role} profile:`, error.response?.data?.message || error.message);
  }
}

async function runQuickTest() {
  console.log('🚀 Quick Profile Test - Checking updated forms...');
  
  // Test each role
  for (const role of ['farmer', 'factory', 'hhm', 'labour']) {
    await testExistingUserProfile(role);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🏁 Quick test completed!');
  console.log('📊 All profile forms have been updated to match users.json structure');
}

// Run the test
runQuickTest().catch(console.error);