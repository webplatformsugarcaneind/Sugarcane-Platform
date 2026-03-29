const axios = require('axios');

async function testQuantityManagementAPI() {
  try {
    console.log('🔍 Testing Quantity Management API...\n');

    const baseURL = 'http://localhost:5000/api';

    // First, let's login as a farmer to get a token
    console.log('1️⃣ Attempting to login as farmer...');
    
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      identifier: 'prakash.joshi@example.com', // Using the farmer we know exists
      password: 'password123'
    }).catch(error => {
      console.log('Login failed, trying alternative farmer...');
      return axios.post(`${baseURL}/auth/login`, {
        identifier: 'ravi.patel@example.com',
        password: 'password123'
      });
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed. Cannot test API functionality.');
      return;
    }

    const token = loginResponse.data.token;
    const farmer = loginResponse.data.user;
    console.log(`✅ Logged in as: ${farmer.name} (${farmer.email})`);

    // Set up axios with authentication
    const authHeaders = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Get farmer's orders to see current state
    console.log('\n2️⃣ Fetching farmer received orders...');
    const ordersResponse = await axios.get(`${baseURL}/orders/received`, authHeaders);
    
    console.log(`📦 Found ${ordersResponse.data.orders.length} received orders`);
    
    if (ordersResponse.data.orders.length === 0) {
      console.log('❌ No orders found to test. Please create some orders first.');
      return;
    }

    // Find a pending order to test
    const pendingOrder = ordersResponse.data.orders.find(order => order.status === 'pending');
    
    if (!pendingOrder) {
      console.log('❌ No pending orders found to test acceptance.');
      return;
    }

    console.log(`\n3️⃣ Testing order acceptance...`);
    console.log(`📋 Order Details:`);
    console.log(`   Order ID: ${pendingOrder._id}`);
    console.log(`   Crop: ${pendingOrder.crop}`);
    console.log(`   Requested Quantity: ${pendingOrder.quantity} tons`);
    console.log(`   Price per ton: $${pendingOrder.pricePerTon}`);
    console.log(`   Total Price: $${pendingOrder.totalPrice}`);
    console.log(`   Buyer: ${pendingOrder.buyerName} (${pendingOrder.buyerEmail})`);

    // Test accepting the order
    console.log(`\n4️⃣ Accepting order...`);
    const acceptResponse = await axios.put(
      `${baseURL}/orders/${pendingOrder._id}/status`,
      { status: 'accepted' },
      authHeaders
    );

    if (acceptResponse.data.success) {
      console.log('✅ Order accepted successfully!');
      console.log(`📊 Result:`);
      console.log(`   Status: ${acceptResponse.data.message}`);
      
      if (acceptResponse.data.order.isPartialFulfillment) {
        console.log(`   🔄 Partial Fulfillment Detected:`);
        console.log(`     - Original Requested: ${acceptResponse.data.order.originalQuantityRequested} tons`);
        console.log(`     - Actual Fulfilled: ${acceptResponse.data.order.quantity} tons`);
        console.log(`     - Adjusted Price: $${acceptResponse.data.order.totalPrice}`);
      } else {
        console.log(`   ✅ Full Fulfillment: ${acceptResponse.data.order.quantity} tons`);
      }

      console.log(`\n📈 Inventory Impact:`);
      if (acceptResponse.data.listingRemoved) {
        console.log(`   🗑️ Listing removed (quantity depleted)`);
      } else if (acceptResponse.data.listingUpdated) {
        console.log(`   📦 Listing quantity updated`);
        console.log(`     - Remaining: ${acceptResponse.data.remainingQuantity} tons`);
      }

    } else {
      console.log('❌ Order acceptance failed:', acceptResponse.data.message);
    }

    // Check updated orders
    console.log(`\n5️⃣ Verifying order status update...`);
    const updatedOrdersResponse = await axios.get(`${baseURL}/orders/received`, authHeaders);
    const updatedOrder = updatedOrdersResponse.data.orders.find(o => o._id === pendingOrder._id);
    
    if (updatedOrder) {
      console.log(`✅ Order status verified: ${updatedOrder.status}`);
      if (updatedOrder.isPartialFulfillment) {
        console.log(`   🔄 Partial fulfillment confirmed`);
        console.log(`   📊 Original requested: ${updatedOrder.originalQuantityRequested} tons`);
        console.log(`   📊 Actually fulfilled: ${updatedOrder.quantity} tons`);
      }
    }

  } catch (error) {
    console.error('❌ API Test Error:', error.response?.data || error.message);
  }
}

// Run the test
testQuantityManagementAPI();