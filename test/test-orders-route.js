const axios = require('axios');

async function testOrdersRoute() {
  try {
    console.log('🔧 Testing orders routes...');

    // Login as Ravi to get token
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
    console.log('✅ Login successful');

    // Test basic orders endpoints
    console.log('📥 Testing /api/orders/received...');
    try {
      const receivedResponse = await axios.get('http://localhost:5000/api/orders/received', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Received orders endpoint works:', receivedResponse.data.message);
      console.log('📊 Orders count:', receivedResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Received orders endpoint failed:', error.response?.data?.message || error.message);
    }

    // Test the listing orders endpoint
    const listingId = '690ef2255c3518ac4bef3b91';
    console.log(`🔍 Testing /api/orders/listing/${listingId}...`);
    
    try {
      const listingResponse = await axios.get(`http://localhost:5000/api/orders/listing/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Listing orders endpoint works:', listingResponse.data.message);
      console.log('📊 Orders for this listing:', listingResponse.data.data?.length || 0);
      if (listingResponse.data.data && listingResponse.data.data.length > 0) {
        console.log('🎯 Sample order:', JSON.stringify(listingResponse.data.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Listing orders endpoint failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testOrdersRoute();