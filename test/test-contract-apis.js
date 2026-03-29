const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testContractAPIs() {
  try {
    console.log('🧪 Testing Contract API Endpoints...\n');

    // 1. Test login as different users
    console.log('1️⃣ Testing login for different user types...');
    
    // Login as farmer
    const farmerLogin = await axios.post(`${API_URL}/auth/login`, {
      identifier: 'prakashfarmer',
      password: '123456'
    });
    const farmerToken = farmerLogin.data.data.token;
    console.log('✅ Farmer login successful');

    // Login as HHM  
    const hhmLogin = await axios.post(`${API_URL}/auth/login`, {
      identifier: 'sunitahhm',
      password: '123456'
    });
    const hhmToken = hhmLogin.data.data.token;
    console.log('✅ HHM login successful');

    // 2. Test farmer contract endpoints
    console.log('\n2️⃣ Testing Farmer Contract endpoints...');
    
    try {
      const farmerContracts = await axios.get(`${API_URL}/farmer-contracts/my-contracts`, {
        headers: { Authorization: `Bearer ${farmerToken}` }
      });
      console.log(`📋 Farmer contracts response:`, farmerContracts.data.data?.length || 0, 'contracts');
    } catch (error) {
      console.log(`❌ Farmer contracts error:`, error.response?.data?.message || error.message);
    }

    try {
      const hhmFarmerContracts = await axios.get(`${API_URL}/farmer-contracts/my-contracts`, {
        headers: { Authorization: `Bearer ${hhmToken}` }
      });
      console.log(`📋 HHM farmer contracts response:`, hhmFarmerContracts.data.data?.length || 0, 'contracts');
    } catch (error) {
      console.log(`❌ HHM farmer contracts error:`, error.response?.data?.message || error.message);
    }

    // 3. Test regular contract endpoints  
    console.log('\n3️⃣ Testing Regular Contract endpoints...');
    
    try {
      const hhmContracts = await axios.get(`${API_URL}/contracts/my-contracts`, {
        headers: { Authorization: `Bearer ${hhmToken}` }
      });
      console.log(`📋 HHM contracts response:`, hhmContracts.data.data?.length || 0, 'contracts');
    } catch (error) {
      console.log(`❌ HHM contracts error:`, error.response?.data?.message || error.message);
    }

    // 4. Test contract creation
    console.log('\n4️⃣ Testing Contract creation...');
    
    try {
      const newContractData = {
        farmer_id: farmerLogin.data.data.user.id,
        contract_details: {
          work_type: 'Harvesting',
          field_size: '5 acres'
        },
        duration_days: 15
      };
      
      const newContract = await axios.post(`${API_URL}/farmer-contracts/request`, newContractData, {
        headers: { Authorization: `Bearer ${farmerToken}` }
      });
      console.log('✅ Contract creation successful:', newContract.data.data._id);
    } catch (error) {
      console.log(`❌ Contract creation error:`, error.response?.data?.message || error.message);
    }

    console.log('\n✅ Contract API testing completed!');

  } catch (error) {
    console.error('❌ Error testing contract APIs:', error.response?.data || error.message);
  }
}

testContractAPIs();