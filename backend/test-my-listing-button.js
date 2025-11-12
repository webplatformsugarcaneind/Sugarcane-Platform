const axios = require('axios');

const testMyListingsButton = async () => {
  try {
    console.log('🔐 Testing My Listings button functionality...\n');

    // 1. Login as Ravi
    console.log('1. Logging in as Ravi...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // 2. Test the API call that My Listings button will make
    console.log('2. Testing My Listings API call...');
    
    // Get user info first
    const userResponse = await axios.get('http://localhost:5000/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (userResponse.data.success) {
      const farmerId = userResponse.data.data.user.id;
      console.log('✅ User verified, Farmer ID:', farmerId);

      // Get my listings
      const response = await axios.get('http://localhost:5000/api/listings/marketplace', {
        params: { farmer_id: farmerId },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const myListings = response.data.data || [];
        console.log(`✅ Found ${myListings.length} listings for Ravi:`);
        
        myListings.forEach((listing, index) => {
          console.log(`  ${index + 1}. ${listing.title}`);
          console.log(`     - Status: ${listing.status}`);
          console.log(`     - Variety: ${listing.crop_variety}`);
        });

        console.log('\n🎉 My Listings functionality should work correctly!');
        console.log('📍 Frontend URL: http://localhost:5177');
        console.log('👆 Click the "👤 My Listing" button to see these listings.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testMyListingsButton();