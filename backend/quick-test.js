const axios = require('axios');

async function testFactoryEndpoint() {
  try {
    console.log('Testing factory endpoint...');
    const factoryId = '68efa57c33a5085d2a45c697';
    console.log(`Calling: http://localhost:5000/api/public/factories/${factoryId}`);
    
    const response = await axios.get(`http://localhost:5000/api/public/factories/${factoryId}`);
    
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Message:', response.data.message);
    console.log('Factory Name:', response.data.data.factory.name);
    console.log('Associated HHMs Count:', response.data.data.factory.hhmCount);
    console.log('Associated HHMs Array Length:', response.data.data.factory.associatedHHMs.length);
    
    // Check if this is our updated code
    if (response.data.message.includes('FIXED VERSION')) {
      console.log('✅ This is using the UPDATED code!');
    } else {
      console.log('❌ This is using OLD code or different endpoint!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFactoryEndpoint();