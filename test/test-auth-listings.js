const axios = require('axios');

async function testAuthListings() {
  try {
    console.log('🔑 Testing auth verify endpoint with listings...');
    
    // Login first
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Login successful');

      // Test auth verify endpoint
      const verifyResponse = await axios.get('http://localhost:5000/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('\n📊 Auth Verify Response:');
      console.log('- User ID:', verifyResponse.data.data.user.id);
      console.log('- Username:', verifyResponse.data.data.user.username);
      console.log('- Role:', verifyResponse.data.data.user.role);
      console.log('- Listings:', verifyResponse.data.data.user.listings ? 'INCLUDED ✅' : 'NOT INCLUDED ❌');
      
      if (verifyResponse.data.data.user.listings) {
        console.log('- Listings count:', verifyResponse.data.data.user.listings.length);
        
        verifyResponse.data.data.user.listings.forEach((listing, index) => {
          console.log(`📦 Listing ${index + 1}:`);
          console.log(`   - Variety: ${listing.variety}`);
          console.log(`   - Quantity: ${listing.quantity_available} tons`);
          console.log(`   - ID: ${listing._id}`);
          console.log('');
        });
      }
    } else {
      console.error('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
  }
}

testAuthListings();