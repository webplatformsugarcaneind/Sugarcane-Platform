const axios = require('axios');

async function testServer() {
  console.log('🧪 Testing server endpoints...');
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health:', healthResponse.data);
    
    // Test listings test endpoint
    console.log('Testing listings test endpoint...');
    const testResponse = await axios.get('http://localhost:5000/api/listings/test');
    console.log('✅ Test:', testResponse.data);
    
    // Test marketplace endpoint
    console.log('Testing marketplace endpoint...');
    const marketplaceResponse = await axios.get('http://localhost:5000/api/listings/marketplace');
    console.log('✅ Marketplace:', marketplaceResponse.data);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testServer();