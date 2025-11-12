const axios = require('axios');

async function testAPIEndpoint() {
  try {
    console.log('🔧 Testing API endpoints directly...');

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

    // Test the listing orders endpoint
    const listingId = '690ef2255c3518ac4bef3b91'; // From our database check
    console.log(`🔍 Testing endpoint: GET /api/orders/listing/${listingId}`);

    const response = await axios.get(`http://localhost:5000/api/orders/listing/${listingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 API Response Status:', response.status);
    console.log('📄 API Response Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ API Error:', error.response?.status, error.response?.statusText);
    console.error('❌ Error Message:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('🔍 Route not found - checking available routes...');
      
      // Test basic orders endpoint
      try {
        const basicResponse = await axios.get('http://localhost:5000/api/orders/received', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Basic orders endpoint works');
      } catch (basicError) {
        console.log('❌ Basic orders endpoint also fails:', basicError.response?.data);
      }
    }
  }
}

testAPIEndpoint();