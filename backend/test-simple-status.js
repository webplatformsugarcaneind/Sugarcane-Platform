const axios = require('axios');

async function testSimpleStatusUpdate() {
  try {
    console.log('🔍 Testing order status endpoint...');
    
    // Login as Ravi
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: '123456'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Test a simple order ID (we'll use a known order ID)
    const testOrderId = '690ef9d4a2cb399e4cc1ebe3';  // From previous test
    
    console.log(`🔍 Testing PUT /api/orders/${testOrderId}/status`);
    
    const response = await axios.put(`http://localhost:5000/api/orders/${testOrderId}/status`, 
      { status: 'accepted' },
      { 
        headers: { 'Authorization': `Bearer ${token}` },
        validateStatus: () => true  // Don't throw on 4xx/5xx errors
      }
    );

    console.log('📊 Response Status:', response.status);
    console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📄 Error Response:', error.response.data);
    }
  }
}

testSimpleStatusUpdate();