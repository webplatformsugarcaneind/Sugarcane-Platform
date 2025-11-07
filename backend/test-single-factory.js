const axios = require('axios');

async function testSingleFactory() {
  try {
    console.log('Testing single factory endpoint...');
    
    const response = await axios.get('http://localhost:5000/api/public/factories/68efa57c33a5085d2a45c697');
    const factory = response.data.data.factory;
    
    console.log('Factory Name:', factory.name);
    console.log('HHM Count:', factory.hhmCount);
    console.log('Associated HHMs:', factory.associatedHHMs.length);
    
    if (factory.associatedHHMs.length > 0) {
      console.log('HHM List:');
      factory.associatedHHMs.forEach((hhm, index) => {
        console.log(`  ${index + 1}. ${hhm.name} (${hhm.username})`);
      });
    } else {
      console.log('No HHMs associated with this factory.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testSingleFactory();