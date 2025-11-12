const axios = require('axios');

async function debugOrderAcceptance() {
  console.log('🔍 Debugging Order Acceptance Issue');
  
  try {
    // Step 1: Test login
    console.log('\n🔑 Step 1: Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: 'password123'
    });

    console.log('Login response:', loginResponse.data);

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received');

    // Step 2: Test simple API with authentication  
    console.log('\n📋 Step 2: Testing authenticated endpoint...');
    const receivedOrdersResponse = await axios.get('http://localhost:5000/api/orders/received', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Received orders response status:', receivedOrdersResponse.status);
    console.log('Received orders data:', receivedOrdersResponse.data);

    // Step 3: Check if there are pending orders
    if (receivedOrdersResponse.data.success && receivedOrdersResponse.data.data.length > 0) {
      const orders = receivedOrdersResponse.data.data;
      const pendingOrder = orders.find(order => order.status === 'pending');
      
      if (pendingOrder) {
        console.log(`\n📦 Found pending order: ${pendingOrder.orderId}`);
        console.log('Order details:', JSON.stringify({
          orderId: pendingOrder.orderId,
          status: pendingOrder.status,
          quantity: pendingOrder.orderDetails?.quantityWanted,
          listingId: pendingOrder.listingId
        }, null, 2));
        
        // Step 4: Test the problematic endpoint
        console.log('\n⚡ Step 4: Testing order status update...');
        
        const updateResponse = await axios.put(
          `http://localhost:5000/api/orders/${pendingOrder.orderId}/status`,
          { status: 'accepted' },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Order update successful!');
        console.log('Update response:', JSON.stringify(updateResponse.data, null, 2));
        
      } else {
        console.log('⚠️  No pending orders found to test with');
      }
    } else {
      console.log('⚠️  No orders found or API error');
    }

  } catch (error) {
    console.error('\n❌ Error occurred:');
    
    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Error Response:', JSON.stringify(error.response.data, null, 2));
      console.error('Request URL:', error.response.config.url);
      console.error('Request Method:', error.response.config.method);
      
      if (error.response.config.data) {
        console.error('Request Data:', error.response.config.data);
      }
      
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

// Start test after server is ready
setTimeout(debugOrderAcceptance, 3000);