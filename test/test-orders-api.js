const axios = require('axios');

async function testOrdersAPI() {
  try {
    console.log('🔍 Testing Orders API...\n');

    const baseURL = 'http://localhost:5000/api';

    // Test login first
    console.log('1️⃣ Login as Ravi...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      identifier: 'ravifarmer',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    console.log('📊 Login Response:', JSON.stringify(loginResponse.data, null, 2));

    const token = loginResponse.data.token || loginResponse.data.data?.token;
    const user = loginResponse.data.user || loginResponse.data.data?.user;
    console.log(`✅ Logged in successfully`);
    if (user) {
      console.log(`   User: ${user.name} (${user.email})`);
    }

    // Test orders/received API
    console.log('\n2️⃣ Testing /api/orders/received...');
    const ordersResponse = await axios.get(`${baseURL}/orders/received`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 API Response:', JSON.stringify(ordersResponse.data, null, 2));

    if (ordersResponse.data.success) {
      const orders = ordersResponse.data.data || ordersResponse.data.orders || [];
      console.log(`\n✅ Found ${orders.length} orders`);
      
      orders.forEach((order, i) => {
        console.log(`\n📦 Order ${i + 1}:`);
        console.log(`   ID: ${order._id || order.orderId}`);
        console.log(`   Status: ${order.status}`);
        console.log(`   Buyer: ${order.buyerDetails?.name || order.buyerName || 'N/A'}`);
        console.log(`   Quantity: ${order.orderDetails?.quantityWanted || order.quantity || 'N/A'} tons`);
        console.log(`   Price: ₹${order.orderDetails?.proposedPrice || order.pricePerTon || 'N/A'}/ton`);
        console.log(`   Total: ₹${order.orderDetails?.totalAmount || order.totalPrice || 'N/A'}`);
      });
    } else {
      console.log('❌ API failed:', ordersResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testOrdersAPI();