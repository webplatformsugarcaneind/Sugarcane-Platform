const axios = require('axios');

async function testPublicFactoriesAPI() {
  try {
    console.log('🔍 Testing public factories API...');
    
    // Add a small delay to ensure server is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test getting all factories
    const response = await axios.get('http://localhost:5000/api/public/factories');
    
    console.log('✅ Public factories API working!');
    console.log('📋 Response data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.factories) {
      console.log(`🏭 Found ${response.data.data.factories.length} factories`);
      
      response.data.data.factories.forEach((factory, index) => {
        console.log(`\n🏭 Factory ${index + 1}:`);
        console.log(`   Name: ${factory.name}`);
        console.log(`   Location: ${factory.location}`);
        console.log(`   Capacity: ${factory.capacity}`);
        console.log(`   Description: ${factory.description}`);
        console.log(`   Experience: ${factory.experience}`);
        console.log(`   Specialization: ${factory.specialization}`);
        console.log(`   Contact Phone: ${factory.contactInfo?.phone}`);
        console.log(`   Contact Email: ${factory.contactInfo?.email}`);
        console.log(`   Website: ${factory.contactInfo?.website}`);
        
        if (factory.operatingHours && Object.keys(factory.operatingHours).length > 0) {
          console.log(`   Operating Hours: ${JSON.stringify(factory.operatingHours)}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Server is not running on http://localhost:5000');
      console.error('Please start the backend server first with: node server.js');
    }
  }
}

testPublicFactoriesAPI();