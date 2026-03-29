const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testDashboardStats() {
  try {
    console.log('🧪 TESTING FACTORY DASHBOARD STATS');
    console.log('='.repeat(40));

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

    // Get dashboard stats
    console.log('\n📊 Step 2: Fetching dashboard statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/api/factory/dashboard-stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (statsResponse.data.success) {
      const stats = statsResponse.data.data;
      console.log('\n✅ Dashboard Stats Retrieved:');
      console.log(`👥 Active HHMs: ${stats.activeHHMs}`);
      console.log(`📋 Pending Bills: ${stats.pendingBills}`);
      console.log(`💰 Total Revenue: ₹${stats.totalRevenue.toLocaleString()}`);
      console.log(`⚙️ Active Jobs: ${stats.activeJobs}`);
      
      console.log('\n📈 Expected vs Actual:');
      console.log(`Active HHMs: Expected 3, Got ${stats.activeHHMs}`);
      console.log(`Pending Bills: Expected 2, Got ${stats.pendingBills}`);
      console.log(`Total Revenue: Expected ₹75,000, Got ₹${stats.totalRevenue.toLocaleString()}`);
      
      if (stats.activeHHMs > 0 && stats.pendingBills > 0 && stats.totalRevenue > 0) {
        console.log('\n🎉 SUCCESS: All dashboard stats are showing real data!');
      } else {
        console.log('\n⚠️ Some stats are still showing zero values');
      }
    } else {
      console.log('❌ Failed to get dashboard stats:', statsResponse.data.message);
    }

    console.log('\n' + '='.repeat(40));
    console.log('🧪 DASHBOARD STATS TEST COMPLETE');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response?.data) {
      console.error('📄 Error details:', error.response.data);
    }
  }
}

testDashboardStats();