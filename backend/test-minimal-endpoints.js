const axios = require('axios');

async function testMinimalServer() {
  console.log('🧪 Testing minimal server listings endpoint...');
  
  try {
    const response = await axios.get('http://localhost:3001/api/listings/test');
    console.log('✅ Success!', response.data);
  } catch (error) {
    console.log('❌ Error:');
    console.log('Response Status:', error.response?.status);
    console.log('Response Data:', error.response?.data);
    console.log('Error Code:', error.code);
  }

  try {
    const response = await axios.get('http://localhost:3001/api/test/test');
    console.log('✅ Direct route Success!', response.data);
  } catch (error) {
    console.log('❌ Direct route Error:');
    console.log('Response Status:', error.response?.status);
    console.log('Response Data:', error.response?.data);
  }
}

testMinimalServer();