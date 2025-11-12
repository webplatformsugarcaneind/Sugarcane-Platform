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

async function testStepByStep() {
  console.log('🧪 Testing step by step...');
  
  try {
    // Step 1: Login
    console.log('🔐 Step 1: Login...');
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const loginResponse = await makeRequest(loginOptions, {
      identifier: 'prakashfarmer',
      password: '123456'
    });

    console.log('✅ Step 1 complete - Login status:', loginResponse.status);
    console.log('📄 Full login response:', JSON.stringify(loginResponse, null, 2));
    
    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const token = loginResponse.data?.data?.token;
    
    if (!token) {
      console.error('❌ No token received in login response');
      console.error('📄 Login response:', JSON.stringify(loginResponse.data, null, 2));
      throw new Error('No token in login response');
    }
    
    console.log('🔍 Received token:', token.substring(0, 50) + '...');
    console.log('🔍 Token length:', token.length);

    // Step 2: Verify token works by calling a simple protected route
    console.log('\n🔍 Step 2: Verify token with simple protected route...');
    const verifyOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/verify',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const verifyResponse = await makeRequest(verifyOptions);
    console.log('✅ Step 2 complete - Token verify status:', verifyResponse.status);

    // Step 3: Try to access farmer profile (another protected route)
    console.log('\n👨‍🌾 Step 3: Access farmer profile...');
    const profileOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/farmer/profile',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const profileResponse = await makeRequest(profileOptions);
    console.log('✅ Step 3 complete - Profile status:', profileResponse.status);

    // Step 4: Try the problematic order endpoint
    console.log('\n📦 Step 4: Test problematic order endpoint...');
    const orderId = '69119c9b2e08c15fdb661c3b';
    const orderOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/${orderId}/status`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    console.log('⚠️ About to make the order request that might crash the server...');
    const orderResponse = await makeRequest(orderOptions, {
      status: 'accepted',
      quantityWanted: 1
    });

    console.log('✅ Step 4 complete - Order status:', orderResponse.status);
    console.log('📄 Order response:', JSON.stringify(orderResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Test failed at step:');
    console.error('💥 Error message:', error.message);
  }
}

testStepByStep();