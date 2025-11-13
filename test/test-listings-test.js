const axios = require('axios');

async function testListingsTest() {
  console.log('🧪 Testing listings test endpoint...');
  
  try {
    const response = await axios.get('http://localhost:5000/api/listings/test');
    console.log('✅ Success!', response.data);
  } catch (error) {
    console.log('❌ Error:');
    console.log('Response Status:', error.response?.status);
    console.log('Response Data:', error.response?.data);
  }
}

testListingsTest();