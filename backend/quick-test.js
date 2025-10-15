const axios = require('axios');

async function quickTest() {
  try {
    // First start the server in background
    const { spawn } = require('child_process');
    console.log('🚀 Starting server...');
    
    const server = spawn('node', ['server.js'], {
      detached: true,
      stdio: 'ignore'
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🔐 Testing login...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'priya.singh@example.com',
      password: '123456'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful!');

    // Get profile
    const profileResponse = await axios.get('http://localhost:5000/api/factory/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Profile retrieved!');
    console.log('Factory Name:', profileResponse.data.profile.factoryName);
    console.log('Location:', profileResponse.data.profile.factoryLocation);
    console.log('Capacity:', profileResponse.data.profile.capacity);
    
    // Kill server
    server.kill();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error details:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

quickTest();