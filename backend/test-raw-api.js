const axios = require('axios');

const testRawAPI = async () => {
  try {
    console.log('🔍 Testing raw marketplace API response...');
    
    const response = await axios.get('http://localhost:5000/api/listings/marketplace');
    const data = response.data;
    
    console.log('\n📄 Raw API Response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testRawAPI();