const axios = require('axios');
const mongoose = require('mongoose');

async function testOrderAcceptance() {
  console.log('🧪 Testing Order Acceptance Flow');
  
  try {
    // Step 1: Login as farmer
    console.log('\n🔑 Step 1: Login as farmer...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Step 2: Get received orders
    console.log('\n📋 Step 2: Fetching received orders...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders/received', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Orders response:', ordersResponse.data);

    if (!ordersResponse.data.success || !ordersResponse.data.data || ordersResponse.data.data.length === 0) {
      console.log('⚠️  No orders found. Creating a test order first...');
      
      // Create a test order (you might need to do this manually or via another script)
      console.log('💡 Please create a test order via the frontend or another script first');
      return;
    }

    const orders = ordersResponse.data.data;
    console.log(`📦 Found ${orders.length} orders`);

    // Find a pending order to test with
    const pendingOrder = orders.find(order => order.status === 'pending');
    
    if (!pendingOrder) {
      console.log('⚠️  No pending orders found to test with');
      console.log('📋 Available orders:');
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. Order ${order.orderId} - Status: ${order.status}`);
      });
      return;
    }

    console.log(`🎯 Testing with order: ${pendingOrder.orderId}`);
    console.log(`   Quantity: ${pendingOrder.orderDetails.quantityWanted} tons`);
    console.log(`   Listing ID: ${pendingOrder.listingId}`);

    // Step 3: Try to accept the order
    console.log('\n✅ Step 3: Attempting to accept order...');
    
    const acceptResponse = await axios.put(
      `http://localhost:5000/api/orders/${pendingOrder.orderId}/status`, 
      { status: 'accepted' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('🎉 Order acceptance successful!');
    console.log('📊 Response:', acceptResponse.data);

  } catch (error) {
    console.error('\n❌ Error in test:', error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
      url: error.response.config.url,
      method: error.response.config.method
    } : error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5000');
    }
  }
}

// Wait for server to be ready
setTimeout(testOrderAcceptance, 3000);