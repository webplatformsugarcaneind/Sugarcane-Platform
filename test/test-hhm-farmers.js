const axios = require('axios');

const testHHMFarmersEndpoint = async () => {
  try {
    console.log('🔍 Testing HHM farmers directory endpoint...');
    
    // First get an HHM login token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'sunilhhm',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ HHM login successful');
    
    // Test farmers directory for HHM
    console.log('🔍 Testing GET /api/hhm/farmers...');
    const farmersResponse = await axios.get('http://localhost:5000/api/hhm/farmers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📋 HHM Farmers Directory Response:');
    console.log(`Found ${farmersResponse.data.count} farmers`);
    console.log('Status:', farmersResponse.status);
    console.log('Success:', farmersResponse.data.success);
    console.log('Message:', farmersResponse.data.message);
    
    if (farmersResponse.data.data && farmersResponse.data.data.length > 0) {
      console.log('\n🎯 First farmer in directory:');
      const firstFarmer = farmersResponse.data.data[0];
      console.log(`Name: ${firstFarmer.name}`);
      console.log(`Username: ${firstFarmer.username}`);
      console.log(`Email: ${firstFarmer.email}`);
      console.log(`Location: ${firstFarmer.location || 'Not specified'}`);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
  }
};

testHHMFarmersEndpoint();