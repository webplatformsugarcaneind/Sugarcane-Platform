const axios = require('axios');

async function testServer() {
    try {
        console.log('🏥 Testing server health...');
        const health = await axios.get('http://localhost:5000/api/health');
        console.log('✅ Health check:', health.data);
        
        console.log('\n🧪 Testing auth endpoint...');
        const authTest = await axios.post('http://localhost:5000/api/auth/login', {
            identifier: 'ravi_farmer',
            password: 'ravi123'
        });
        
        console.log('✅ Auth test:', authTest.data);
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server is not running or not responding');
        } else if (error.response) {
            console.log('❌ Server responded with error:');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data);
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }
}

testServer();