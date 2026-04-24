const axios = require('axios');

async function testLogin() {
    try {
        console.log('🧪 Testing login with proper credentials...');
        
        const loginData = {
            identifier: 'ravi_farmer',
            password: 'ravi123'
        };
        
        console.log('📤 Sending request to http://localhost:5007/api/auth/login');
        console.log('📋 Login data:', loginData);
        
        const response = await axios.post('http://localhost:5007/api/auth/login', loginData);
        
        console.log('✅ Login successful!');
        console.log('📄 Response status:', response.status);
        console.log('👤 User data:', response.data.data);
        console.log('🎫 Token received:', response.data.token ? 'Yes' : 'No');
        console.log('🎫 Token preview:', response.data.token ? response.data.token.substring(0, 50) + '...' : 'None');
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Login failed');
            console.log('📄 Status:', error.response.status);
            console.log('💬 Message:', error.response.data.message);
            console.log('🔍 Response data:', error.response.data);
        } else if (error.request) {
            console.log('❌ No response from server');
            console.log('🔍 Request error:', error.message);
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

testLogin();