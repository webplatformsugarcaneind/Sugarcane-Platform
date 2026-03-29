// Debug script to test navigation and routes
const https = require('https');
const http = require('http');

// Function to test a URL
function testUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    protocol.get(url, (res) => {
      resolve({
        url: url,
        statusCode: res.statusCode,
        headers: res.headers
      });
    }).on('error', (err) => {
      reject({
        url: url,
        error: err.message
      });
    });
  });
}

async function runTests() {
  console.log('Testing frontend routes...\n');
  
  const routes = [
    'http://localhost:5173',
    'http://localhost:5173/farmer/marketplace',
    'http://localhost:5173/farmer/listing/6911f0915033172a89b86453',
    'http://localhost:5173/login'
  ];

  for (const route of routes) {
    try {
      const result = await testUrl(route);
      console.log(`✅ ${route}`);
      console.log(`   Status: ${result.statusCode}`);
      console.log(`   Content-Type: ${result.headers['content-type']}\n`);
    } catch (error) {
      console.log(`❌ ${route}`);
      console.log(`   Error: ${error.error}\n`);
    }
  }

  console.log('Testing backend API...\n');
  
  const apiRoutes = [
    'http://localhost:5000/api/listings/marketplace'
  ];

  for (const route of apiRoutes) {
    try {
      const result = await testUrl(route);
      console.log(`✅ ${route}`);
      console.log(`   Status: ${result.statusCode}`);
      console.log(`   Content-Type: ${result.headers['content-type']}\n`);
    } catch (error) {
      console.log(`❌ ${route}`);
      console.log(`   Error: ${error.error}\n`);
    }
  }
}

runTests();