const axios = require('axios');

async function testFailingOrder() {
  console.log('🧪 Testing the Failing Order Acceptance');
  
  try {
    // Login as prakashfarmer
    console.log('\n🔑 Login as prakashfarmer...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'prakashfarmer',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Try to accept the specific failing order
    const failingOrderId = '69119c9b2e08c15fdb661c3b'; // From the error message
    console.log(`\n📋 Attempting to accept failing order: ${failingOrderId}`);
    
    const acceptResponse = await axios.put(
      `http://localhost:5000/api/orders/${failingOrderId}/status`,
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
    console.error('\n❌ CAPTURED THE ERROR:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Wait for server to be ready
setTimeout(testFailingOrder, 3000);