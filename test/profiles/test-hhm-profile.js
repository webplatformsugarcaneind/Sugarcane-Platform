const http = require('http');

async function testHHMProfile() {
  try {
    console.log('🔐 Testing HHM profile access...');
    
    // First login to get token
    const loginData = JSON.stringify({
      identifier: 'sunitahhm',
      password: '123456'
    });
    
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };
    
    const loginResponse = await new Promise((resolve, reject) => {
      const req = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });
    
    if (loginResponse.status !== 200) {
      console.error('❌ Login failed');
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, testing profile...');
    
    // Now test HHM profile endpoint
    const profileOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/hhm/profile',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const profileResponse = await new Promise((resolve, reject) => {
      const req = http.request(profileOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
    
    if (profileResponse.status === 200) {
      console.log('✅ HHM profile endpoint working!');
      console.log('HHM Name:', profileResponse.data.profile.name);
      console.log('Role:', profileResponse.data.profile.role);
      console.log('Email:', profileResponse.data.profile.email);
    } else {
      console.error('❌ Profile access failed:');
      console.error('Status:', profileResponse.status);
      console.error('Message:', profileResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHHMProfile();