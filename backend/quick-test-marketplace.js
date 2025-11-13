const axios = require('axios');

async function quickTest() {
  console.log('🧪 Quick test of marketplace endpoint...');
  
  try {
    const response = await axios.get('http://localhost:5000/api/listings/marketplace');
    console.log('❌ Unexpected success');
  } catch (error) {
    console.log('Response Status:', error.response?.status);
    console.log('Response Data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('✅ Good! Getting 401 auth error as expected');
    } else if (error.response?.status === 404) {
      console.log('❌ Bad! Getting 404 - route not found');
    }
  }
}

quickTest();
