const http = require('http');

// Simple test without axios
console.log('🔧 Testing basic server connection...');

const healthCheck = http.get('http://localhost:5000/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ Server is accessible');
    console.log('📊 Health check response:', data);
    
    // Now test login
    testLogin();
  });
});

healthCheck.on('error', (err) => {
  console.log('❌ Cannot connect to server:', err.message);
});

function testLogin() {
  const postData = JSON.stringify({
    identifier: 'ravifarmer',
    password: '123456'
  });

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

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      if (response.success && response.data.token) {
        console.log('✅ Login successful');
        testOrdersEndpoint(response.data.token);
      } else {
        console.log('❌ Login failed:', response.message);
      }
    });
  });

  req.on('error', (err) => {
    console.log('❌ Login request error:', err.message);
  });

  req.write(postData);
  req.end();
}

function testOrdersEndpoint(token) {
  const listingId = '690ef2255c3518ac4bef3b91';
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/orders/listing/${listingId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('📊 Orders endpoint status:', res.statusCode);
      console.log('📄 Orders endpoint response:', data);
    });
  });

  req.on('error', (err) => {
    console.log('❌ Orders request error:', err.message);
  });

  req.end();
}