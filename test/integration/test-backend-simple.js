const axios = require('axios');

const testBackend = async () => {
  try {
    console.log('🔍 Testing Backend Server...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test root endpoint
    const rootResponse = await axios.get('http://localhost:5000/');
    console.log('✅ Root endpoint:', rootResponse.data.message);
    
    // Test auth endpoint
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'amitlabour',
      password: '123456'
    });
    console.log('✅ Login successful for:', loginResponse.data.data.user.name);
    
    // Test worker profile with fresh token
    const token = loginResponse.data.data.token;
    const profileResponse = await axios.get('http://localhost:5000/api/worker/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const profile = profileResponse.data.profile;
    console.log('\n📊 Worker Profile Test Result:');
    console.log('- Name:', profile.name);
    console.log('- Work Experience:', profile.workExperience || 'MISSING ❌');
    
    if (profile.workExperience) {
      console.log('\n✅ SUCCESS: Work Experience field is working!');
      console.log(`   Value: "${profile.workExperience}"`);
    } else {
      console.log('\n❌ ISSUE: Work Experience field is still missing');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testBackend();