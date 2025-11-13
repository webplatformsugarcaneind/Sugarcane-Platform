const axios = require('axios');

const testHHMProfile = async () => {
  try {
    console.log('🔐 Testing HHM Profile API...');
    
    // Step 1: Login as HHM user
    console.log('Step 1: Logging in as HHM user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'vikramhhm',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful for:', loginResponse.data.data.user.name);
    
    // Step 2: Fetch HHM profile
    console.log('Step 2: Fetching HHM profile...');
    const profileResponse = await axios.get('http://localhost:5000/api/hhm/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const profile = profileResponse.data.profile;
    console.log('✅ Profile fetched successfully');
    console.log('\n📊 HHM Profile Data:');
    console.log('- Name:', profile.name);
    console.log('- Username:', profile.username);
    console.log('- Role:', profile.role);
    console.log('- Management Experience:', profile.managementExperience || 'NOT FOUND ❌');
    console.log('- Team Size:', profile.teamSize || 'NOT FOUND ❌');
    console.log('- Management Operations:', profile.managementOperations || 'NOT FOUND ❌');
    console.log('- Services Offered:', profile.servicesOffered || 'NOT FOUND ❌');
    
    // Check if all HHM-specific fields are present
    const hhmFields = ['managementExperience', 'teamSize', 'managementOperations', 'servicesOffered'];
    const missingFields = hhmFields.filter(field => !profile[field]);
    
    if (missingFields.length === 0) {
      console.log('\n✅ SUCCESS: All HHM fields are now correctly returned!');
      console.log('   Management Experience:', `"${profile.managementExperience}"`);
      console.log('   Team Size:', `"${profile.teamSize}"`);
      console.log('   Management Operations:', `"${profile.managementOperations}"`);
      console.log('   Services Offered:', `"${profile.servicesOffered}"`);
    } else {
      console.log('\n❌ ISSUE: Missing HHM fields:', missingFields.join(', '));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testHHMProfile();