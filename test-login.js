const http = require('http');

async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    
    const loginData = JSON.stringify({
      identifier: 'priyafactory', // username from your users.json
      password: '123456'          // password from your users.json
    });
    
    const postData = loginData;
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve({ status: res.statusCode, data: result });
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
    
    if (response.status === 200) {
      console.log('✅ Login successful!');
      console.log('Token:', response.data.data.token.substring(0, 50) + '...');
      console.log('User:', response.data.data.user.name, `(${response.data.data.user.role})`);
      console.log('\n🎯 Your test credentials work! Use these to login in the browser:');
      console.log('Username: priyafactory');
      console.log('Password: 123456');
    } else {
      console.error('❌ Login failed:');
      console.error('Status:', response.status);
      console.error('Message:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Error:', error.message);
  }
}

testLogin();