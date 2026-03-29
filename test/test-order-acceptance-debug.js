const http = require('http');

async function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            statusText: res.statusMessage,
            data: data ? JSON.parse(data) : null
          };
          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function testOrderAcceptance() {
  console.log('🧪 Testing order acceptance with detailed error logging...');
  
  try {
    // First, get the auth token for Prakash (farmer who needs to accept)
    console.log('🔐 Logging in as Prakash farmer...');
    
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginResponse = await makeRequest(loginOptions, {
      identifier: 'prakashfarmer',
      password: '123456'
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');

    // Now try to accept the failing order
    const orderId = '69119c9b2e08c15fdb661c3b';
    console.log(`\n📦 Attempting to accept order ${orderId}...`);

    const acceptOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/${orderId}/status`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(acceptOptions, {
      status: 'accepted',
      quantityWanted: 1 // Accept 1 ton out of the requested amount
    });

    console.log('✅ Order acceptance successful!');
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Order acceptance failed:');
    console.error('💥 Error message:', error.message);
    
    if (error.status) {
      console.error('📄 Status:', error.status);
      console.error('📄 Status Text:', error.statusText);
      console.error('📄 Response Data:', JSON.stringify(error.data, null, 2));
    }
  }
}

testOrderAcceptance();