const axios = require('axios');

// Test the factory profile API endpoint
const testFactoryProfile = async () => {
  try {
    console.log('🧪 Testing Factory Profile API...\n');
    
    // Login as factory user
    console.log('1. Logging in as factory user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'priyafactory',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test GET factory profile
    console.log('\n2. Getting factory profile...');
    const profileResponse = await axios.get('http://localhost:5000/api/factory/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Profile retrieved successfully');
    console.log('🔍 Profile data:', JSON.stringify(profileResponse.data.profile, null, 2));
    
    // Check specifically for crushingStatus
    const crushingStatus = profileResponse.data.profile?.crushingStatus;
    console.log(`\n🏭 Crushing Status in profile: ${crushingStatus}`);
    
    if (crushingStatus) {
      console.log('✅ Crushing status is included in profile response');
    } else {
      console.log('❌ Crushing status is missing from profile response');
    }
    
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
};

testFactoryProfile();