const axios = require('axios');

async function testOrderForCropListing() {
  try {
    console.log('🔍 Testing order creation for CropListing...');
    
    // Login as a different farmer (not Ravi)
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'prakashfarmer',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful as Prakash');

    // Get Ravi's listing from CropListing collection
    const raviLogin = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: '123456'
    });
    const raviToken = raviLogin.data.data.token;

    const listingsResponse = await axios.get('http://localhost:5000/api/listings/my-listings', {
      headers: { 'Authorization': `Bearer ${raviToken}` }
    });

    if (!listingsResponse.data.data || listingsResponse.data.data.length === 0) {
      console.log('❌ No CropListings found for Ravi');
      return;
    }

    const listing = listingsResponse.data.data[0];
    console.log(`📋 Found CropListing: ${listing.title} (ID: ${listing._id})`);

    // Try to create an order for this CropListing
    const orderData = {
      listingId: listing._id,
      farmerId: typeof listing.farmer_id === 'object' ? listing.farmer_id._id : listing.farmer_id,
      buyerName: "Prakash Farmer",
      buyerEmail: "prakash.farmer@example.com", 
      buyerPhone: "+91 9876543210",
      quantityWanted: 15,
      proposedPrice: 2500,
      deliveryLocation: "Delhi, India",
      message: "Need good quality sugarcane for processing",
      urgency: "medium",
      totalAmount: 37500
    };

    console.log('📦 Creating order with data:');
    console.log('   listingId:', orderData.listingId, 'Type:', typeof orderData.listingId);
    console.log('   farmerId:', orderData.farmerId, 'Type:', typeof orderData.farmerId);
    console.log('   ObjectId valid listingId:', require('mongoose').Types.ObjectId.isValid(orderData.listingId));
    console.log('   ObjectId valid farmerId:', require('mongoose').Types.ObjectId.isValid(orderData.farmerId));
    
    const orderResponse = await axios.post('http://localhost:5000/api/orders/create', orderData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Order created successfully!');
    console.log('📊 Order details:', JSON.stringify(orderResponse.data, null, 2));

    // Now test if we can fetch orders for this listing
    console.log(`\n🔍 Fetching orders for CropListing ${listing._id}...`);
    
    const ordersResponse = await axios.get(`http://localhost:5000/api/orders/listing/${listing._id}`, {
      headers: { 'Authorization': `Bearer ${raviToken}` }
    });

    console.log('📋 Orders result:');
    console.log('   Status:', ordersResponse.status);
    console.log('   Success:', ordersResponse.data.success);
    console.log('   Message:', ordersResponse.data.message);
    console.log('   Orders count:', ordersResponse.data.data?.length || 0);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testOrderForCropListing();