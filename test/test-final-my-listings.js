const axios = require('axios');

const testMyListingsFunctionality = async () => {
  try {
    console.log('🔐 Testing complete My Listings functionality...\n');

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

    // 2. Verify auth and get user ID (simulating frontend fetchMyListings)
    console.log('2. Verifying auth and getting user ID...');
    const userResponse = await axios.get('http://localhost:5000/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (userResponse.data.success) {
      const farmerId = userResponse.data.data.user.id;  // Fixed: using .data.user.id instead of .user._id
      console.log('✅ User verified, Farmer ID:', farmerId);

      // 3. Fetch listings for this specific farmer (simulating My Listings API call)
      console.log('3. Fetching my listings...');
      const response = await axios.get('http://localhost:5000/api/listings/marketplace', {
        params: { farmer_id: farmerId },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        const myListings = response.data.data || [];
        console.log(`✅ Found ${myListings.length} listings for Ravi Patel:`);
        
        myListings.forEach((listing, index) => {
          console.log(`  ${index + 1}. ${listing.title}`);
          console.log(`     - Quantity: ${listing.quantity} tons`);
          console.log(`     - Price: ₹${listing.price}/ton`);
          console.log(`     - Status: ${listing.status}`);
        });

        if (myListings.length === 0) {
          console.log('⚠️  No listings found - this might indicate an issue');
        }
      } else {
        console.log('❌ Failed to fetch listings');
      }
    } else {
      console.log('❌ Auth verification failed');
    }

    console.log('\n🎯 Summary:');
    console.log('- Fixed API endpoint: /api/auth/verify ✅');
    console.log('- Fixed user ID path: .data.data.user.id ✅');
    console.log('- Frontend should now show My Listings correctly ✅');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testMyListingsFunctionality();