const axios = require('axios');

const testOwnListingDetection = async () => {
  try {
    console.log('🔐 Testing Own Listing Detection...\n');

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

    // 2. Get user info
    const userResponse = await axios.get('http://localhost:5000/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (userResponse.data.success) {
      const user = userResponse.data.data.user;
      console.log('✅ User ID:', user.id);

      // 3. Get one of Ravi's listings
      const response = await axios.get('http://localhost:5000/api/listings/marketplace', {
        params: { farmer_id: user.id },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success && response.data.data.length > 0) {
        const listing = response.data.data[0];
        console.log('✅ Found listing:', listing.title);
        console.log('   Farmer ID in listing:', listing.farmer_id);
        console.log('   Current user ID:', user.id);
        
        // Check if they match
        const listingFarmerId = typeof listing.farmer_id === 'object' 
          ? listing.farmer_id._id 
          : listing.farmer_id;
        
        const isOwnListing = listingFarmerId === user.id;
        console.log('   Listing farmer ID (extracted):', listingFarmerId);
        console.log('   Is own listing:', isOwnListing);

        console.log('\n🎯 Expected behavior:');
        console.log('   - When Ravi views his own listing details:');
        console.log('   - ❌ No "Buy This Sugarcane" button');
        console.log('   - ❌ No "Contact Farmer" button'); 
        console.log('   - ❌ No "View Profile" button');
        console.log('   - ✅ Shows "This is your listing" message');
        console.log('   - ✅ Shows "Back to Marketplace" button');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testOwnListingDetection();