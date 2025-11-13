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

async function testSimpleOrderAccess() {
  console.log('🧪 Testing simple order access without authentication...');
  
  try {
    const orderId = '69119c9b2e08c15fdb661c3b';
    console.log(`📦 Testing order ${orderId}...`);

    const testOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/test-orders/${orderId}/test`,
      method: 'GET'
    };

    const response = await makeRequest(testOptions);
    
    console.log('✅ Test successful!');
    console.log('📄 Status:', response.status);
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('💥 Error message:', error.message);
  }
}

testSimpleOrderAccess();