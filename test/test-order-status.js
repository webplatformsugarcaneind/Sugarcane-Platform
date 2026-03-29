const axios = require('axios');

async function testOrderStatusUpdate() {
  try {
    console.log('🔍 Testing order status update functionality...');
    
    // 1. Login as Ravi (seller)
    console.log('🔐 Logging in as Ravi...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: '123456'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // 2. Get Ravi's received orders
    console.log('📬 Fetching Ravi\'s received orders...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders/received', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const orders = ordersResponse.data.data;
    console.log(`✅ Found ${orders.length} received orders`);

    if (orders.length === 0) {
      console.log('ℹ️  No orders to test with');
      return;
    }

    // 3. Test accepting the first pending order
    const pendingOrder = orders.find(order => order.status === 'pending');
    
    if (!pendingOrder) {
      console.log('ℹ️  No pending orders to test with');
      console.log('📋 Available orders:');
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. Order ${order.orderId} - Status: ${order.status}`);
      });
      return;
    }

    console.log(`\n📦 Testing with order: ${pendingOrder.orderId}`);
    console.log(`   Buyer: ${pendingOrder.buyerDetails?.name}`);
    console.log(`   Current Status: ${pendingOrder.status}`);

    // 4. Test accepting the order
    console.log('\n✅ Testing ACCEPT order...');
    const acceptResponse = await axios.put(`http://localhost:5000/api/orders/${pendingOrder.orderId}/status`, 
      { status: 'accepted' },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (acceptResponse.data.success) {
      console.log('✅ Order accepted successfully!');
      console.log('📊 Response:', acceptResponse.data.message);
    }

    // 5. Verify the status change
    console.log('\n🔍 Verifying status change...');
    const verifyResponse = await axios.get('http://localhost:5000/api/orders/received', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const updatedOrder = verifyResponse.data.data.find(order => 
      order.orderId === pendingOrder.orderId
    );

    if (updatedOrder) {
      console.log(`✅ Order status verified: ${updatedOrder.status}`);
    } else {
      console.log('❌ Order not found in verification');
    }

    // 6. Test rejecting functionality (reset to pending first for demo)
    console.log('\n❌ Testing REJECT order...');
    const rejectResponse = await axios.put(`http://localhost:5000/api/orders/${pendingOrder.orderId}/status`, 
      { status: 'rejected' },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (rejectResponse.data.success) {
      console.log('❌ Order rejected successfully!');
      console.log('📊 Response:', rejectResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testOrderStatusUpdate();