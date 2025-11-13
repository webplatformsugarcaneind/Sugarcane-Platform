const axios = require('axios');

async function testOrderAcceptanceWithLogs() {
  console.log('🧪 Testing Order Acceptance with Detailed Logging');
  
  try {
    // Step 1: Login as prakashfarmer
    console.log('\n🔑 Step 1: Login as prakashfarmer...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'prakashfarmer',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Step 2: Get received orders to find the exact pending order
    console.log('\n📋 Step 2: Getting received orders...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders/received', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Orders response status:', ordersResponse.status);
    
    if (ordersResponse.data.success && ordersResponse.data.data.length > 0) {
      const orders = ordersResponse.data.data;
      const pendingOrders = orders.filter(order => order.status === 'pending');
      
      console.log(`📊 Total orders: ${orders.length}, Pending: ${pendingOrders.length}`);
      
      if (pendingOrders.length > 0) {
        const orderToAccept = pendingOrders[0]; // Take the first pending order
        console.log(`\n🎯 Attempting to accept order: ${orderToAccept.orderId}`);
        console.log(`   From: ${orderToAccept.buyerDetails.name}`);
        console.log(`   Quantity: ${orderToAccept.orderDetails.quantityWanted} tons`);
        console.log(`   Listing ID: ${orderToAccept.listingId}`);

        // Step 3: Try to accept the order
        console.log('\n⚡ Step 3: Sending accept request...');
        
        const acceptResponse = await axios.put(
          `http://localhost:5000/api/orders/${orderToAccept.orderId}/status`,
          { status: 'accepted' },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('🎉 SUCCESS! Order accepted successfully');
        console.log('Response:', JSON.stringify(acceptResponse.data, null, 2));
        
      } else {
        console.log('⚠️  No pending orders found to accept');
      }
    } else {
      console.log('❌ Failed to get orders or no orders found');
      console.log('Response:', ordersResponse.data);
    }

  } catch (error) {
    console.error('\n❌ DETAILED ERROR ANALYSIS:');
    
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('HTTP Status Text:', error.response.statusText);
      console.error('Error Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Request URL:', error.response.config.url);
      console.error('Request Method:', error.response.config.method);
      console.error('Request Headers:', JSON.stringify(error.response.config.headers, null, 2));
      
      if (error.response.config.data) {
        console.error('Request Body:', error.response.config.data);
      }

      // Specific error code analysis
      if (error.response.status === 500) {
        console.error('\n🔍 500 ERROR ANALYSIS:');
        console.error('This is a server-side error. Possible causes:');
        console.error('1. Database connection issue');
        console.error('2. Invalid data in database');
        console.error('3. Code error in order acceptance logic');
        console.error('4. Missing or invalid listing references');
      } else if (error.response.status === 401) {
        console.error('\n🔍 401 ERROR ANALYSIS:');
        console.error('Authentication issue - token might be invalid');
      } else if (error.response.status === 403) {
        console.error('\n🔍 403 ERROR ANALYSIS:');
        console.error('Authorization issue - user might not have permission');
      }
      
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Request:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
  }
}

// Start test with delay
console.log('⏳ Starting test in 3 seconds...');
setTimeout(testOrderAcceptanceWithLogs, 3000);