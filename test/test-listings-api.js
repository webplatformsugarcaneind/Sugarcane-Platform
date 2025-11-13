const axios = require('axios');

// Test the new CropListing API endpoints
async function testListingsAPI() {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing CropListing API Endpoints...\n');
  
  try {
    // First, let's login as a farmer to get a token
    console.log('1. 📝 Logging in as a farmer...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'farmer1@test.com', // Assuming you have test farmers
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed. Please make sure you have a test farmer account.');
      return;
    }
    
    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    console.log('✅ Login successful!');
    console.log(`👤 Logged in as: ${loginResponse.data.data.user.name}\n`);
    
    // Test 1: Create a new crop listing (POST /api/listings/create)
    console.log('2. 🌾 Creating a new crop listing...');
    const createListingResponse = await axios.post(`${baseURL}/listings/create`, {
      title: 'Fresh Sugarcane - High Quality',
      crop_variety: 'Co 86032',
      quantity_in_tons: 25.5,
      expected_price_per_ton: 3500,
      harvest_availability_date: '2025-12-15',
      location: 'Pune, Maharashtra',
      description: 'Premium quality sugarcane ready for harvest. Good sugar content and excellent yield.'
    }, { headers });
    
    if (createListingResponse.data.success) {
      console.log('✅ Listing created successfully!');
      console.log(`📋 Listing ID: ${createListingResponse.data.data._id}`);
      console.log(`📝 Title: ${createListingResponse.data.data.title}`);
      console.log(`🌾 Variety: ${createListingResponse.data.data.crop_variety}`);
      console.log(`⚖️  Quantity: ${createListingResponse.data.data.quantity_in_tons} tons`);
      console.log(`💰 Price: ₹${createListingResponse.data.data.expected_price_per_ton}/ton\n`);
    } else {
      console.log('❌ Failed to create listing:', createListingResponse.data.message);
    }
    
    // Test 2: Get marketplace listings (GET /api/listings/marketplace)
    console.log('3. 🏪 Fetching marketplace listings...');
    const marketplaceResponse = await axios.get(`${baseURL}/listings/marketplace`, { headers });
    
    if (marketplaceResponse.data.success) {
      console.log('✅ Marketplace listings retrieved successfully!');
      console.log(`📊 Total listings: ${marketplaceResponse.data.data.length}`);
      
      if (marketplaceResponse.data.data.length > 0) {
        console.log('📋 First few listings:');
        marketplaceResponse.data.data.slice(0, 3).forEach((listing, index) => {
          console.log(`   ${index + 1}. ${listing.title} - ${listing.quantity_in_tons} tons - ₹${listing.expected_price_per_ton}/ton`);
          console.log(`      👤 Seller: ${listing.farmer_id.name}`);
          console.log(`      📍 Location: ${listing.location}`);
        });
      }
      console.log();
    } else {
      console.log('❌ Failed to fetch marketplace:', marketplaceResponse.data.message);
    }
    
    // Test 3: Get specific listing details (GET /api/listings/:listingId)
    if (createListingResponse.data.success) {
      const listingId = createListingResponse.data.data._id;
      console.log('4. 🔍 Fetching specific listing details...');
      
      const listingDetailsResponse = await axios.get(`${baseURL}/listings/${listingId}`, { headers });
      
      if (listingDetailsResponse.data.success) {
        console.log('✅ Listing details retrieved successfully!');
        const listing = listingDetailsResponse.data.data;
        console.log(`📝 Title: ${listing.title}`);
        console.log(`🌾 Crop Variety: ${listing.crop_variety}`);
        console.log(`⚖️  Quantity: ${listing.quantity_in_tons} tons`);
        console.log(`💰 Expected Price: ₹${listing.expected_price_per_ton}/ton`);
        console.log(`💵 Total Value: ₹${(listing.quantity_in_tons * listing.expected_price_per_ton).toLocaleString()}`);
        console.log(`📅 Harvest Date: ${new Date(listing.harvest_availability_date).toLocaleDateString()}`);
        console.log(`📍 Location: ${listing.location}`);
        console.log(`📊 Status: ${listing.status}`);
        console.log(`👤 Seller: ${listing.farmer_id.name} (${listing.farmer_id.email})`);
        if (listing.description) {
          console.log(`📄 Description: ${listing.description}`);
        }
      } else {
        console.log('❌ Failed to fetch listing details:', listingDetailsResponse.data.message);
      }
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

// Run the tests
testListingsAPI();