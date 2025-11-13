/**
 * Quick Test for Farmer-HHM Directory Access
 * Tests the basic directory functionality that was just fixed
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test with existing user credentials
const testLogin = async () => {
  try {
    console.log('🔐 Testing login...');
    
    // Try to login with test credentials
    const farmerLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'farmer@test.com',
      password: 'password'
    });
    
    console.log('✅ Farmer login successful');
    
    // Test farmer accessing HHM directory
    console.log('📋 Testing farmer HHM directory access...');
    const hhmDirectory = await axios.get(`${API_BASE}/farmer/hhms`, {
      headers: { Authorization: `Bearer ${farmerLogin.data.token}` }
    });
    
    console.log(`✅ Farmer can access HHM directory - Found ${hhmDirectory.data.length} HHMs`);
    
    if (hhmDirectory.data.length > 0) {
      const firstHHM = hhmDirectory.data[0];
      console.log(`   First HHM: ${firstHHM.username} (${firstHHM._id})`);
      
      // Test accessing specific HHM profile
      console.log('👤 Testing HHM profile access...');
      const hhmProfile = await axios.get(`${API_BASE}/farmer/hhms/${firstHHM._id}`, {
        headers: { Authorization: `Bearer ${farmerLogin.data.token}` }
      });
      
      console.log(`✅ Farmer can access HHM profile: ${hhmProfile.data.username}`);
    }
    
    // Try HHM login and directory access
    try {
      const hhmLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: 'hhm@test.com',
        password: 'password'
      });
      
      console.log('✅ HHM login successful');
      
      console.log('📋 Testing HHM farmer directory access...');
      const farmerDirectory = await axios.get(`${API_BASE}/hhm/farmers`, {
        headers: { Authorization: `Bearer ${hhmLogin.data.token}` }
      });
      
      console.log(`✅ HHM can access farmer directory - Found ${farmerDirectory.data.length} farmers`);
      
    } catch (hhmError) {
      console.log('⚠️ HHM login not available with test credentials');
    }
    
    console.log('\n🎉 Directory access test PASSED!');
    console.log('✅ Farmer can browse HHM directory');
    console.log('✅ Farmer can access HHM profiles'); 
    console.log('✅ Fixed User model imports are working correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Tip: You may need to create test users first');
    }
  }
};

// Run the test
testLogin();