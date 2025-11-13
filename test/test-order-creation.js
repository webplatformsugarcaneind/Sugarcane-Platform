const axios = require('axios');

async function testOrderCreation() {
  try {
    console.log('🧪 Testing Buy Order Creation...');

    // First, login to get a token (using Prakash as the buyer)
    console.log('🔐 Logging in as buyer (prakashfarmer)...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'prakashfarmer',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, got token');

    // Get user info to verify
    const userResponse = await axios.get('http://localhost:5000/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const buyer = userResponse.data.data.user;
    console.log('👤 Buyer info:', buyer.name, '(', buyer.id, ')');

    // Get Ravi's listing info to create order for
    console.log('📋 Getting Ravi\'s listings...');
    const listingsResponse = await axios.get('http://localhost:5000/api/listings/marketplace', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const listings = listingsResponse.data.data;
    console.log('📊 Found', listings.length, 'listings');

    // Find a listing by Ravi
    const raviListing = listings.find(listing => 
      listing.farmer_id && 
      (listing.farmer_id.username === 'ravifarmer' || 
       (typeof listing.farmer_id === 'object' && listing.farmer_id.username === 'ravifarmer'))
    );

    if (!raviListing) {
      console.log('❌ No listing by Ravi found!');
      console.log('Available listings:', listings.map(l => ({ 
        title: l.title, 
        farmer: l.farmer_id?.username || l.farmer_id?.name || 'unknown' 
      })));
      return;
    }

    console.log('🎯 Found Ravi\'s listing:', raviListing.title);
    console.log('📋 Listing ID:', raviListing._id);
    console.log('👨‍🌾 Farmer ID:', raviListing.farmer_id._id || raviListing.farmer_id);

    // Create a buy order
    console.log('💰 Creating buy order...');
    const orderData = {
      listingId: raviListing._id,
      farmerId: raviListing.farmer_id._id || raviListing.farmer_id,
      buyerName: 'Prakash Test Order',
      buyerEmail: 'prakash.test@example.com',
      buyerPhone: '+91 9876543299',
      quantityWanted: 10,
      proposedPrice: 2700,
      deliveryLocation: 'Mumbai Test Location',
      message: 'This is a test order to verify the system works correctly.',
      urgency: 'normal',
      totalAmount: 10 * 2700
    };

    const orderResponse = await axios.post('http://localhost:5000/api/orders/create', orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (orderResponse.data.success) {
      console.log('✅ Buy order created successfully!');
      console.log('📄 Order details:', {
        orderId: orderResponse.data.data.orderId,
        status: orderResponse.data.data.status,
        totalAmount: orderResponse.data.data.orderSummary.totalAmount
      });

      // Now check if the order appears in Ravi's received orders
      console.log('🔍 Checking if order appears in listing orders...');
      
      // Login as Ravi to check received orders
      const raviLoginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        identifier: 'ravifarmer',
        password: '123456'
      });

      if (raviLoginResponse.data.success) {
        const raviToken = raviLoginResponse.data.data.token;
        
        // Check orders for the specific listing
        const listingOrdersResponse = await axios.get(`http://localhost:5000/api/orders/listing/${raviListing._id}`, {
          headers: { 'Authorization': `Bearer ${raviToken}` }
        });

        if (listingOrdersResponse.data.success) {
          const orders = listingOrdersResponse.data.data;
          console.log('📊 Ravi has', orders.length, 'orders for this listing');
          
          if (orders.length > 0) {
            console.log('✅ Orders found:');
            orders.forEach((order, index) => {
              console.log(`  ${index + 1}. ${order.buyerDetails.name} - ${order.orderDetails.quantityWanted}t @ ₹${order.orderDetails.proposedPrice}/t`);
            });
          } else {
            console.log('❌ No orders found for Ravi\'s listing!');
          }
        } else {
          console.log('❌ Failed to fetch listing orders:', listingOrdersResponse.data.message);
        }
      }

    } else {
      console.log('❌ Failed to create buy order:', orderResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error testing order creation:', error.response?.data || error.message);
  }
}

testOrderCreation();