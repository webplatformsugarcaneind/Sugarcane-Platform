const https = require('https');
const http = require('http');

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => reject(error));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAuthentication() {
  console.log('🚀 Starting Authentication API Tests...\n');

  // Test 1: User Registration
  console.log('1️⃣ Testing User Registration...');
  try {
    const registerOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const userData = {
      name: 'John Doe',
      username: 'johndoe',
      phone: '+1234567890',
      email: 'john@example.com',
      role: 'Farmer',
      password: 'securepass123'
    };

    const registerResponse = await makeRequest(registerOptions, userData);
    console.log(`Status: ${registerResponse.statusCode}`);
    console.log('Response:', JSON.stringify(registerResponse.body, null, 2));
    
    if (registerResponse.statusCode === 201) {
      console.log('✅ Registration successful!\n');
      
      // Store token for later use
      const token = registerResponse.body.data.token;
      
      // Test 2: User Login
      console.log('2️⃣ Testing User Login...');
      const loginOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const loginData = {
        identifier: 'johndoe',
        password: 'securepass123'
      };

      const loginResponse = await makeRequest(loginOptions, loginData);
      console.log(`Status: ${loginResponse.statusCode}`);
      console.log('Response:', JSON.stringify(loginResponse.body, null, 2));
      
      if (loginResponse.statusCode === 200) {
        console.log('✅ Login successful!\n');
        
        // Test 3: Token Verification
        console.log('3️⃣ Testing Token Verification...');
        const verifyOptions = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/auth/verify',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const verifyResponse = await makeRequest(verifyOptions);
        console.log(`Status: ${verifyResponse.statusCode}`);
        console.log('Response:', JSON.stringify(verifyResponse.body, null, 2));
        
        if (verifyResponse.statusCode === 200) {
          console.log('✅ Token verification successful!\n');
        } else {
          console.log('❌ Token verification failed!\n');
        }
      } else {
        console.log('❌ Login failed!\n');
      }
    } else {
      console.log('❌ Registration failed!\n');
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  console.log('🏁 Authentication tests completed!');
}

// Run the tests
testAuthentication();