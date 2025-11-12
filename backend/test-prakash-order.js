const axios = require('axios');

async function testPrakashOrderAcceptance() {
  console.log('🧪 Testing Prakash Order Acceptance');
  
  try {
    // Login as Prakash farmer (the seller who needs to accept)
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

    // Try to accept the specific pending order
    const orderId = '69119c9b2e08c15fdb661c3b'; // 1 ton order from Ravi
    console.log(`\n📋 Attempting to accept order: ${orderId} (1 ton from Ravi)`);
    
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
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

// Wait 3 seconds for server
setTimeout(testPrakashOrderAcceptance, 3000);