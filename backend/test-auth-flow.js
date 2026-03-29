const axios = require('axios');

async function testFullAuthFlow() {
    try {
        console.log('🧪 Testing complete authentication flow...\n');
        
        // Step 1: Test login
        console.log('📤 Step 1: Testing login...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            identifier: 'ravi_farmer',
            password: 'ravi123'
        });
        
        console.log('✅ Login successful!');
        console.log('👤 User:', loginResponse.data.data.name);
        console.log('🎫 Token received:', loginResponse.data.token ? 'Yes' : 'No');
        
        const token = loginResponse.data.token;
        
        // Step 2: Test API call with token
        console.log('\n📤 Step 2: Testing authenticated API call...');
        const listingsResponse = await axios.get('http://localhost:5000/api/listings/marketplace', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Marketplace API call successful!');
        console.log('📋 Listings count:', listingsResponse.data.data.length);
        
        console.log('\n🎉 Authentication flow is working correctly!');
        console.log('✅ Frontend should now be able to:');
        console.log('   - Login with credentials: ravi_farmer / ravi123');
        console.log('   - Access marketplace listings');
        console.log('   - Show proper login UI when not authenticated');
        
    } catch (error) {
        if (error.response) {
            console.log('❌ Request failed');
            console.log('📄 Status:', error.response.status);
            console.log('💬 Message:', error.response.data.message || error.response.data);
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

testFullAuthFlow();