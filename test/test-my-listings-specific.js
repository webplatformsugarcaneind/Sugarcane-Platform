const axios = require('axios');

async function testMyListings() {
  try {
    console.log('🔍 Testing my-listings endpoint specifically...');
    
    // Login as Ravi
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: '123456'
    });

    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    console.log('✅ Login successful. User ID:', userId);

    // Test my-listings endpoint
    const response = await axios.get('http://localhost:5000/api/listings/my-listings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📋 My-listings response:');
    console.log('   Status:', response.status);
    console.log('   Success:', response.data.success);
    console.log('   Total listings:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      response.data.data.forEach((listing, index) => {
        console.log(`   ${index + 1}. ${listing.title} (ID: ${listing._id})`);
      });
    }

    // Now test orders for the first listing (if any)
    if (response.data.data && response.data.data.length > 0) {
      const firstListingId = response.data.data[0]._id;
      console.log(`\n🔍 Testing orders for first listing: ${firstListingId}`);
      
      const ordersResponse = await axios.get(`http://localhost:5000/api/orders/listing/${firstListingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('📦 Orders response:');
      console.log('   Status:', ordersResponse.status);
      console.log('   Success:', ordersResponse.data.success);
      console.log('   Message:', ordersResponse.data.message);
      console.log('   Orders count:', ordersResponse.data.data?.length || 0);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testMyListings();