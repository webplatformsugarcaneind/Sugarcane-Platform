/**
 * Simple test to create users and test factory invite workflow
 */

const axios = require('axios');
const baseURL = 'http://localhost:5000';

async function createTestUsers() {
  console.log('🔧 Setting up test users...\n');

  try {
    // Create Factory User
    console.log('Creating factory user...');
    const factoryRegister = await axios.post(`${baseURL}/api/auth/register`, {
      username: 'testfactory1',
      email: 'factory1@test.com',
      password: 'password123',
      role: 'Factory',
      name: 'Test Factory Inc',
      companyName: 'Test Factory Inc',
      address: '123 Factory St',
      phone: '1234567890'
    });
    console.log('✅ Factory user created');

    // Create HHM User  
    console.log('Creating HHM user...');
    const hhmRegister = await axios.post(`${baseURL}/api/auth/register`, {
      username: 'testhhm1',
      email: 'hhm1@test.com', 
      password: 'password123',
      role: 'HHM',
      name: 'Test HHM User',
      phone: '0987654321',
      skills: ['Quality Control', 'Laboratory Testing']
    });
    console.log('✅ HHM user created');
    
    return {
      factory: factoryRegister.data,
      hhm: hhmRegister.data
    };

  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ Users already exist, proceeding with login...');
      return null;
    }
    throw error;
  }
}

async function testInviteWorkflow() {
  console.log('\n🧪 Testing Factory-to-HHM Invitation Workflow\n');

  try {
    // Create test users if they don't exist
    await createTestUsers();

    // Login as Factory
    console.log('1️⃣ Factory login...');
    const factoryLogin = await axios.post(`${baseURL}/api/auth/login`, {
      identifier: 'testfactory1',
      password: 'password123'
    });
    const factoryToken = factoryLogin.data.token;
    console.log('✅ Factory logged in');

    // Login as HHM
    console.log('\n2️⃣ HHM login...');
    const hhmLogin = await axios.post(`${baseURL}/api/auth/login`, {
      identifier: 'testhhm1', 
      password: 'password123'
    });
    const hhmToken = hhmLogin.data.token;
    console.log('HHM Login Response:', JSON.stringify(hhmLogin.data, null, 2));
    const hhmId = hhmLogin.data.user.id;
    console.log('✅ HHM logged in, ID:', hhmId);

    // Factory sends invitation
    console.log('\n3️⃣ Factory sending invitation...');
    const invite = await axios.post(`${baseURL}/api/contracts/invite`, {
      hhm_id: hhmId,
      role_description: 'Quality Controller',
      requirements: 'Minimum 2 years experience',
      estimated_duration: 6,
      payment_terms: 'Monthly payment of $2000',
      factory_requirements: {
        skills: ['Quality Control'],
        experience: '2+ years'
      }
    }, {
      headers: { 'Authorization': `Bearer ${factoryToken}` }
    });

    const contractId = invite.data.contract._id;
    console.log('✅ Invitation sent');
    console.log(`📄 Contract ID: ${contractId}`);
    console.log(`📋 Status: ${invite.data.contract.status}`);

    // HHM views contracts
    console.log('\n4️⃣ HHM checking contracts...');
    const contracts = await axios.get(`${baseURL}/api/contracts`, {
      headers: { 'Authorization': `Bearer ${hhmToken}` }
    });
    
    const factoryInvite = contracts.data.find(c => c.status === 'factory_invite');
    if (factoryInvite) {
      console.log('✅ Factory invitation found');
      console.log(`💼 Role: ${factoryInvite.role_description}`);
    }

    // HHM accepts invitation
    console.log('\n5️⃣ HHM accepting invitation...');
    const accept = await axios.put(`${baseURL}/api/contracts/${contractId}/accept-invite`, {}, {
      headers: { 'Authorization': `Bearer ${hhmToken}` }
    });

    console.log('✅ Invitation accepted');
    console.log(`📋 New Status: ${accept.data.contract.status}`);

    console.log('\n🎉 Factory invitation workflow test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || JSON.stringify(error.response.data)}`);
      console.error(`Data:`, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testInviteWorkflow();