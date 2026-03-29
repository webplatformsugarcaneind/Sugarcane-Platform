const axios = require('axios');

const testFarmerHHMEndpoints = async () => {
  try {
    console.log('🔍 Testing farmer HHM endpoints...');
    
    // First get a test farmer login token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Farmer login successful');
    
    // Test HHM directory
    const hhmResponse = await axios.get('http://localhost:5000/api/farmer/hhms', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📋 HHM Directory Response:');
    console.log(`Found ${hhmResponse.data.count} HHMs`);
    
    if (hhmResponse.data.data && hhmResponse.data.data.length > 0) {
      const firstHHM = hhmResponse.data.data[0];
      console.log('\n🎯 Testing with first HHM:');
      console.log(`ID: ${firstHHM._id}`);
      console.log(`Name: ${firstHHM.name}`);
      console.log(`Role: ${firstHHM.role || 'undefined'}`);
      
      // Test individual HHM profile
      console.log('\n🔍 Testing HHM profile endpoint...');
      try {
        const profileResponse = await axios.get(`http://localhost:5000/api/farmer/hhms/${firstHHM._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Profile request successful');
        console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
      } catch (profileError) {
        console.log('❌ Profile request failed:');
        console.log('Status:', profileError.response?.status);
        console.log('Data:', JSON.stringify(profileError.response?.data, null, 2));
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
};

testFarmerHHMEndpoints();