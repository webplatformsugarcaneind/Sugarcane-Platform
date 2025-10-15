const axios = require('axios');

// Minimal test - just check if server is responding
async function minimal() {
    try {
        console.log('Checking server health...');
        const healthResponse = await axios.get('http://localhost:5000/api/health');
        console.log('✅ Server health:', healthResponse.status);
    } catch (error) {
        console.error('❌ Server health check failed:', error.message);
    }
}

minimal();