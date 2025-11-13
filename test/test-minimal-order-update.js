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

async function testMinimalOrderUpdate() {
  console.log('🧪 Testing minimal order update...');
  
  try {
    // Login first
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
    console.log('✅ Login successful');

    // Test minimal order update
    const orderId = '69119c9b2e08c15fdb661c3b';
    console.log(`\n📦 Testing minimal order update for ${orderId}...`);

    const testOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/minimal-test/${orderId}/minimal-status`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await makeRequest(testOptions, {
      status: 'accepted'
    });

    console.log('✅ Minimal test successful!');
    console.log('📄 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Minimal test failed:');
    console.error('💥 Error message:', error.message);
  }
}

testMinimalOrderUpdate();