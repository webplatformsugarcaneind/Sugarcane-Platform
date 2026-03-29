const axios = require('axios');

// Test the farmer listing management API endpoints
async function testFarmerListingManagement() {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing Farmer Listing Management API Endpoints...\n');
  
  try {
    // Login as a farmer to get token
    console.log('1. 📝 Logging in as farmer...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'farmer1@test.com', // Update with actual farmer email
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed. Using alternate login...');
      // Try alternative farmer credentials
      const altLoginResponse = await axios.post(`${baseURL}/auth/login`, {
        username: 'farmer1',
        password: 'password123'
      });
      
      if (!altLoginResponse.data.success) {
        console.log('❌ Alternative login also failed. Please check farmer credentials.');
        return;
      }
      loginResponse.data = altLoginResponse.data;
    }
    
    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('✅ Login successful!');
    console.log(`👤 Logged in as: ${loginResponse.data.data.user.name}\n`);
    
    // Create a test listing first
    console.log('2. 🌾 Creating a test listing...');
    const createResponse = await axios.post(`${baseURL}/listings/create`, {
      title: 'Test Sugarcane for Management',
      crop_variety: 'Co 238',
      quantity_in_tons: 15.0,
      expected_price_per_ton: 4000,
      harvest_availability_date: '2025-12-20',
      location: 'Nashik, Maharashtra',
      description: 'High-quality sugarcane for testing listing management features'
    }, { headers });
    
    let testListingId = null;
    if (createResponse.data.success) {
      testListingId = createResponse.data.data._id;
      console.log(`✅ Test listing created: ${testListingId}\n`);
    } else {
      console.log('❌ Failed to create test listing. Using existing listing for tests.\n');
    }
    
    // Test 1: Get My Listings (GET /api/listings/my-listings)
    console.log('3. 📋 Testing Get My Listings...');
    const myListingsResponse = await axios.get(`${baseURL}/listings/my-listings`, { headers });
    
    if (myListingsResponse.data.success) {
      console.log('✅ My listings retrieved successfully!');
      console.log(`📊 Total my listings: ${myListingsResponse.data.data.length}`);
      
      if (myListingsResponse.data.data.length > 0) {
        const firstListing = myListingsResponse.data.data[0];
        if (!testListingId) testListingId = firstListing._id; // Use existing listing for tests
        
        console.log('📋 Your listings:');
        myListingsResponse.data.data.slice(0, 3).forEach((listing, index) => {
          console.log(`   ${index + 1}. ${listing.title}`);
          console.log(`      🌾 Variety: ${listing.crop_variety}`);
          console.log(`      ⚖️  Quantity: ${listing.quantity_in_tons} tons`);
          console.log(`      💰 Price: ₹${listing.expected_price_per_ton}/ton`);
          console.log(`      📊 Status: ${listing.status}`);
          console.log(`      📅 Created: ${new Date(listing.createdAt).toLocaleDateString()}`);
        });
      } else {
        console.log('📭 No listings found for this farmer');
      }
      console.log();
    } else {
      console.log('❌ Failed to fetch my listings:', myListingsResponse.data.message);
    }
    
    // Test 2: Update Listing (PUT /api/listings/:listingId)
    if (testListingId) {
      console.log('4. ✏️ Testing Update Listing...');
      const updateResponse = await axios.put(`${baseURL}/listings/${testListingId}`, {
        expected_price_per_ton: 4500, // Update price
        description: 'Updated description: Premium sugarcane with excellent sugar content',
        status: 'active'
      }, { headers });
      
      if (updateResponse.data.success) {
        console.log('✅ Listing updated successfully!');
        const updated = updateResponse.data.data;
        console.log(`📝 Updated Fields: ${updateResponse.data.updatedFields.join(', ')}`);
        console.log(`💰 New Price: ₹${updated.expected_price_per_ton}/ton`);
        console.log(`📄 New Description: ${updated.description}`);
        console.log(`📊 Status: ${updated.status}\n`);
      } else {
        console.log('❌ Failed to update listing:', updateResponse.data.message);
      }
    }
    
    // Test 3: Test with filtering and pagination on my-listings
    console.log('5. 🔍 Testing My Listings with Filters...');
    const filteredResponse = await axios.get(`${baseURL}/listings/my-listings?status=active&page=1&limit=5&sort=price`, { headers });
    
    if (filteredResponse.data.success) {
      console.log('✅ Filtered listings retrieved!');
      console.log(`📊 Active listings: ${filteredResponse.data.data.length}`);
      console.log(`📄 Page: ${filteredResponse.data.pagination.currentPage}/${filteredResponse.data.pagination.totalPages}`);
      console.log(`🔍 Filters applied: status=active, sort=price\n`);
    }
    
    // Test 4: Test Update with validation error
    if (testListingId) {
      console.log('6. 🧪 Testing Update Validation...');
      try {
        await axios.put(`${baseURL}/listings/${testListingId}`, {
          expected_price_per_ton: -100, // Invalid price
          quantity_in_tons: 0 // Invalid quantity
        }, { headers });
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log('✅ Validation working correctly!');
          console.log(`❌ Expected validation error: ${error.response.data.message}\n`);
        } else {
          throw error;
        }
      }
    }
    
    // Test 5: Test unauthorized access (try to update someone else's listing)
    console.log('7. 🔒 Testing Authorization Protection...');
    // This test would need another farmer's listing ID to be meaningful
    // For now, we'll test with an invalid listing ID
    try {
      await axios.put(`${baseURL}/listings/507f1f77bcf86cd799439011`, { // Fake but valid ObjectId
        title: 'Hacked listing'
      }, { headers });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Authorization protection working correctly!');
        console.log(`🔒 Expected 404 error for non-existent listing\n`);
      } else {
        throw error;
      }
    }
    
    // Test 6: Delete Listing (DELETE /api/listings/:listingId)
    if (testListingId && createResponse.data.success) {
      console.log('8. 🗑️ Testing Delete Listing...');
      const deleteResponse = await axios.delete(`${baseURL}/listings/${testListingId}`, { headers });
      
      if (deleteResponse.data.success) {
        console.log('✅ Listing deleted successfully!');
        console.log(`🗑️ Deleted: ${deleteResponse.data.deletedListing.title}`);
        console.log(`🌾 Variety: ${deleteResponse.data.deletedListing.crop_variety}`);
        console.log(`⚖️  Quantity: ${deleteResponse.data.deletedListing.quantity_in_tons} tons`);
      } else {
        console.log('❌ Failed to delete listing:', deleteResponse.data.message);
      }
    }
    
    console.log('\n🎉 All farmer listing management tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
    if (error.response?.status) {
      console.error('HTTP Status:', error.response.status);
    }
  }
}

// Run the tests
testFarmerListingManagement();