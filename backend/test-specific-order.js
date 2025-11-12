const axios = require('axios');

async function testSpecificOrderAcceptance() {
  console.log('🧪 Testing Specific Pending Order Acceptance');
  
  try {
    // Login as farmer
    console.log('\n🔑 Login as ravifarmer...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Try to accept the specific pending order
    const orderId = '69119a6a2e08c15fdb6618cb'; // From the check-current-state output
    console.log(`\n📋 Attempting to accept order: ${orderId}`);
    
    const acceptResponse = await axios.put(
      `http://localhost:5000/api/orders/${orderId}/status`, 
      { status: 'accepted' },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );

    console.log('🎉 Order acceptance successful!');
    console.log('📊 Response:', JSON.stringify(acceptResponse.data, null, 2));

  } catch (error) {
    console.error('\n❌ Error details:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Request URL:', error.response.config.url);
      console.error('Request Method:', error.response.config.method);
      console.error('Request Data:', error.response.config.data);
      console.error('Request Headers:', error.response.config.headers);
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

// Wait 3 seconds for server
setTimeout(testSpecificOrderAcceptance, 3000);