const axios = require('axios');

async function testMyListingsFlow() {
  const passwords = ['password123', 'password', '123456', 'farmer123'];
  let loginSuccessful = false;
  let token = null;
  
  try {
    console.log('🔐 Testing My Listings API flow...\n');

    // Try different passwords
    for (let password of passwords) {
      try {
        console.log(`1. Trying login with password: ${password}`);
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
          identifier: 'ravifarmer',
          password: password
        });

        if (loginResponse.data.success) {
          token = loginResponse.data.data.token;  // Fix token path
          loginSuccessful = true;
          console.log('✅ Login successful with password:', password);
          console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token');
          break;
        }
      } catch (error) {
        console.log(`❌ Failed with password: ${password}`);
      }
    }

    if (!loginSuccessful) {
      console.log('❌ Could not login with any password.');
      return;
    }

    // Step 2: Get user info
    console.log('\n2. Getting user info...');
    const userResponse = await axios.get('http://localhost:5000/api/auth/verify', {  // Fix endpoint
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!userResponse.data.success) {
      console.log('❌ Failed to get user info:', userResponse.data.message);
      return;
    }

    const user = userResponse.data.data.user;  // Fix user path
    console.log('✅ User info retrieved:');
    console.log('- User ID:', user._id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);

    // Step 3: Fetch my listings
    console.log('\n3. Fetching my listings...');
    const listingsResponse = await axios.get('http://localhost:5000/api/listings/marketplace', {
      params: { farmer_id: user._id },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!listingsResponse.data.success) {
      console.log('❌ Failed to get listings:', listingsResponse.data.message);
      return;
    }

    const listings = listingsResponse.data.data || [];
    console.log(`✅ Found ${listings.length} listings for Ravi Patel:`);
    
    listings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title}`);
      console.log(`   - ID: ${listing._id}`);
      console.log(`   - Status: ${listing.status}`);
      console.log(`   - Quantity: ${listing.quantity_in_tons} tons`);
      console.log(`   - Price: ₹${listing.expected_price_per_ton}/ton`);
      console.log('');
    });

    // Step 4: Test without farmer_id filter (to see all listings)
    console.log('4. Fetching all marketplace listings (for comparison)...');
    const allListingsResponse = await axios.get('http://localhost:5000/api/listings/marketplace', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (allListingsResponse.data.success) {
      const allListings = allListingsResponse.data.data || [];
      console.log(`✅ Total marketplace listings: ${allListings.length}`);
      
      const raviListings = allListings.filter(listing => 
        listing.farmer_id && listing.farmer_id._id === user._id
      );
      console.log(`✅ Ravi's listings in marketplace: ${raviListings.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMyListingsFlow();