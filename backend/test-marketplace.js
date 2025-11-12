const axios = require('axios');

async function testMarketplaceAPI() {
  try {
    console.log('🔐 Testing farmer login...');
    
    // First, login to get the JWT token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'testfarmer@example.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      const token = loginResponse.data.token;
      console.log('Token:', token.substring(0, 50) + '...');

      // Test marketplace endpoint
      console.log('\n🏪 Testing marketplace API...');
      
      const marketplaceResponse = await axios.get('http://localhost:5000/api/listings/marketplace', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Marketplace API Response:');
      console.log('Status:', marketplaceResponse.status);
      console.log('Success:', marketplaceResponse.data.success);
      console.log('Message:', marketplaceResponse.data.message);
      console.log('Listings count:', marketplaceResponse.data.data?.length || 0);
      console.log('Pagination:', marketplaceResponse.data.pagination);
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMarketplaceAPI();