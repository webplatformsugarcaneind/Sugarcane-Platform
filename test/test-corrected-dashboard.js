const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCorrectedDashboard() {
  try {
    console.log('🧪 TESTING CORRECTED FACTORY DASHBOARD');
    console.log('='.repeat(45));

    // Login as factory
    console.log('\n📝 Step 1: Logging in as factory...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'deepakfactory',
      password: '123456'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Logged in as Deepak Sharma');

    // Get corrected dashboard stats
    console.log('\n📊 Step 2: Fetching corrected dashboard stats...');
    const statsResponse = await axios.get(`${BASE_URL}/api/factory/dashboard-stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (statsResponse.data.success) {
      const stats = statsResponse.data.data;
      console.log('\n✅ Corrected Dashboard Stats:');
      console.log('━'.repeat(40));
      console.log(`👥 Active HHMs: ${stats.activeHHMs}`);
      console.log(`💰 Factory Revenue: ₹${stats.totalRevenue.toLocaleString()} (Coming Soon)`);
      console.log(`🏭 Sugar Production: ${stats.productionVolume} MT (Coming Soon)`);
      console.log(`📦 Customer Orders: ${stats.totalOrders} (Coming Soon)`);
      console.log('━'.repeat(40));
      
      console.log('\n📋 What was REMOVED (incorrect metrics):');
      console.log('❌ Pending Bills: Those were factory costs, not revenue metrics');
      console.log('❌ Total Revenue from Bills: Those were sugarcane purchase costs');
      console.log('❌ Active Jobs: Not relevant for factory dashboard');
      
      console.log('\n🎯 What we SHOULD track for factory revenue:');
      console.log('• Sugar sales to customers/distributors');
      console.log('• Ethanol/byproduct sales');
      console.log('• Processing fees charged');
      console.log('• Export revenue');
      
      console.log('\n🚀 Ready for proper revenue tracking implementation!');
    } else {
      console.log('❌ Failed to get dashboard stats:', statsResponse.data.message);
    }

    console.log('\n' + '='.repeat(45));
    console.log('🧪 CORRECTED DASHBOARD TEST COMPLETE');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response?.data) {
      console.error('📄 Error details:', error.response.data);
    }
  }
}

testCorrectedDashboard();