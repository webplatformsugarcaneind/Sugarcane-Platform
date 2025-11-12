const axios = require('axios');

const testWorkerProfile = async () => {
  try {
    console.log('🔐 Testing Worker Profile API...');
    
    // Step 1: Login as labour user
    console.log('Step 1: Logging in as labour user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'amitlabour',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Fetch profile
    console.log('Step 2: Fetching worker profile...');
    const profileResponse = await axios.get('http://localhost:5000/api/worker/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const profile = profileResponse.data.profile;
    console.log('✅ Profile fetched successfully');
    console.log('\n📊 Profile Data:');
    console.log('- Name:', profile.name);
    console.log('- Username:', profile.username);
    console.log('- Role:', profile.role);
    console.log('- Work Experience:', profile.workExperience || 'NOT FOUND ❌');
    console.log('- Farming Experience:', profile.farmingExperience || 'Not set');
    console.log('- Skills:', profile.skills || 'Not set');
    console.log('- Wage Rate:', profile.wageRate || 'Not set');
    console.log('- Availability:', profile.availabilityStatus || 'Not set');
    
    // Check if workExperience field is present
    if (profile.workExperience) {
      console.log('\n✅ SUCCESS: workExperience field is now correctly returned!');
      console.log(`   Value: "${profile.workExperience}"`);
    } else {
      console.log('\n❌ ISSUE: workExperience field is still missing');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testWorkerProfile();