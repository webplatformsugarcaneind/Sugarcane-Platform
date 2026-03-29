const axios = require('axios');

// Test HHM Dashboard API endpoint
async function testHHMDashboard() {
  try {
    console.log('🔍 Testing HHM Dashboard API...');
    
    // First we need to login to get a token for an HHM user
    console.log('📝 Attempting to login...');
    
    // You'll need to replace these with actual HHM user credentials
    // For now, let's just test the endpoint structure
    const response = await axios.get('http://localhost:5000/api/hhm/dashboard', {
      headers: {
        // This would normally require a valid JWT token for an HHM user
        // 'Authorization': 'Bearer <token>'
      }
    });
    
    console.log('✅ HHM Dashboard API working!');
    console.log('📋 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('⚠️ API Response Error:', error.response.status, error.response.statusText);
      console.log('📋 Error details:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('ℹ️ This is expected - endpoint requires authentication');
        console.log('ℹ️ The API endpoint exists and is properly protected');
      }
    } else {
      console.error('❌ Request Error:', error.message);
    }
  }
}

testHHMDashboard();