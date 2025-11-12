const axios = require('axios');

async function testFullFlow() {
  try {
    console.log('🔍 Testing complete order display flow...');
    
    // 1. Login as Ravi
    console.log('🔐 Logging in as Ravi...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    console.log('✅ Login successful. User ID:', userId);

    // 2. Get Ravi's listings
    console.log('📋 Fetching Ravi\'s listings...');
    const listingsResponse = await axios.get('http://localhost:5000/api/listings/my-listings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const listings = listingsResponse.data.data;
    console.log(`✅ Found ${listings.length} listings for Ravi`);

    if (listings.length === 0) {
      console.log('❌ No listings found for Ravi');
      return;
    }

    // 3. Test each listing for orders
    for (const listing of listings) {
      console.log(`\n🔍 Checking listing: "${listing.title}" (ID: ${listing._id})`);
      
      const ordersResponse = await axios.get(`http://localhost:5000/api/orders/listing/${listing._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (ordersResponse.data.success && ordersResponse.data.data.length > 0) {
        console.log(`✅ Found ${ordersResponse.data.data.length} order(s) for this listing:`);
        ordersResponse.data.data.forEach((order, index) => {
          console.log(`   📦 Order ${index + 1}:`);
          console.log(`      👤 Buyer: ${order.buyerDetails.name}`);
          console.log(`      📧 Email: ${order.buyerDetails.email}`);
          console.log(`      📞 Phone: ${order.buyerDetails.phone}`);
          console.log(`      📊 Quantity: ${order.orderDetails.quantityWanted} tons`);
          console.log(`      💰 Price: ₹${order.orderDetails.proposedPrice}/ton`);
          console.log(`      📍 Location: ${order.orderDetails.deliveryLocation}`);
          console.log(`      ⚡ Urgency: ${order.orderDetails.urgency}`);
          console.log(`      📝 Status: ${order.status}`);
          if (order.buyer) {
            console.log(`      🆔 Buyer Details: ${order.buyer.name} (${order.buyer.username})`);
          }
        });
      } else {
        console.log('   ℹ️  No orders found for this listing');
      }
    }

  } catch (error) {
    console.error('❌ Error in test flow:', error.response?.data?.message || error.message);
  }
}

testFullFlow();