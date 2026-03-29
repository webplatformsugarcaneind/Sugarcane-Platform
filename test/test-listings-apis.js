const axios = require('axios');

async function testListingsAPI() {
  try {
    console.log('🔍 Testing Marketplace Listings API vs User Listings...\n');

    const baseURL = 'http://localhost:5000/api';

    // Login
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      identifier: 'ravifarmer',
      password: '123456'
    });

    const token = loginResponse.data.data.token;

    // Test 1: Get marketplace listings (all listings)
    console.log('1️⃣ Marketplace Listings API:');
    try {
      const marketplaceResponse = await axios.get(`${baseURL}/listings/marketplace`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (marketplaceResponse.data.success) {
        const listings = marketplaceResponse.data.data || [];
        const raviListings = listings.filter(listing => 
          listing.farmer_name?.includes('Ravi') || 
          listing.farmerName?.includes('Ravi') ||
          listing.farmer?.name?.includes('Ravi')
        );
        
        console.log(`   Found ${raviListings.length} Ravi listings in marketplace:`);
        raviListings.forEach(listing => {
          console.log(`   - ${listing.title || listing.name}: ${listing.quantity_in_tons || listing.quantity} tons`);
        });
      }
    } catch (error) {
      console.log('   ❌ Marketplace API error:', error.response?.data?.message || error.message);
    }

    // Test 2: Get user's profile to check embedded listings
    console.log('\n2️⃣ User Profile Listings (embedded):');
    try {
      const profileResponse = await axios.get(`${baseURL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('   Profile API Response:');
      console.log('   Success:', profileResponse.data.success);
      console.log('   User listings count:', profileResponse.data.data?.user?.listings?.length || 0);
      
      if (profileResponse.data.data?.user?.listings) {
        profileResponse.data.data.user.listings.forEach(listing => {
          console.log(`   - ${listing.title}: ${listing.quantity_in_tons} tons`);
        });
      }
    } catch (error) {
      console.log('   ❌ Profile API error:', error.response?.data?.message || error.message);
    }

    // Test 3: Check if there's a specific farmer listings endpoint
    console.log('\n3️⃣ Testing Farmer-specific Listings:');
    try {
      const userResponse = await axios.get(`${baseURL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const farmerId = userResponse.data.data.user.id;
      
      const farmerListingsResponse = await axios.get(`${baseURL}/listings/marketplace`, {
        params: { farmer_id: farmerId },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (farmerListingsResponse.data.success) {
        const listings = farmerListingsResponse.data.data || [];
        console.log(`   Found ${listings.length} listings for farmer ${farmerId}:`);
        listings.forEach(listing => {
          console.log(`   - ${listing.title || listing.name}: ${listing.quantity_in_tons || listing.quantity} tons`);
        });
      }
    } catch (error) {
      console.log('   ❌ Farmer listings error:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
  }
}

testListingsAPI();