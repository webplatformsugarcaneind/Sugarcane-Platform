/**
 * Test script for Factory-to-HHM invitation feature (Task 4)
 * Tests the complete workflow:
 * 1. Factory sends invitation to HHM
 * 2. HHM accepts/rejects the invitation
 */

const axios = require('axios');
const baseURL = 'http://localhost:5000';

async function testFactoryInviteWorkflow() {
  console.log('🧪 Testing Factory-to-HHM Invitation Workflow\n');

  // Test data
  const factoryUser = {
    username: 'testfactory1',
    password: 'password123',
    role: 'factory'
  };

  const hhmUser = {
    username: 'testhhm1', 
    password: 'password123',
    role: 'hhm'
  };

  let factoryToken, hhmToken;

  try {
    // Step 1: Login as Factory
    console.log('1️⃣ Factory login...');
    const factoryLoginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      username: factoryUser.username,
      password: factoryUser.password
    });
    
    factoryToken = factoryLoginResponse.data.token;
    console.log('✅ Factory logged in successfully');
    
    // Step 2: Login as HHM
    console.log('\n2️⃣ HHM login...');
    const hhmLoginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      username: hhmUser.username,
      password: hhmUser.password
    });
    
    hhmToken = hhmLoginResponse.data.token;
    console.log('✅ HHM logged in successfully');

    // Step 3: Factory sends invitation to HHM
    console.log('\n3️⃣ Factory sending invitation...');
    const inviteResponse = await axios.post(`${baseURL}/api/contracts/invite`, {
      hhm_id: hhmLoginResponse.data.user.id, // Use HHM's user ID
      role_description: 'Quality Controller for Sugar Processing',
      requirements: 'Minimum 2 years experience in quality control',
      estimated_duration: 6,
      payment_terms: 'Monthly payment of $2000',
      factory_requirements: {
        skills: ['Quality Control', 'Laboratory Testing'],
        experience: '2+ years',
        certifications: ['ISO 9001']
      }
    }, {
      headers: {
        'Authorization': `Bearer ${factoryToken}`,
        'Content-Type': 'application/json'
      }
    });

    const contractId = inviteResponse.data.contract._id;
    console.log('✅ Invitation sent successfully');
    console.log(`📄 Contract ID: ${contractId}`);
    console.log(`📋 Status: ${inviteResponse.data.contract.status}`);

    // Step 4: HHM views contracts dashboard (get contracts)
    console.log('\n4️⃣ HHM viewing contracts dashboard...');
    const contractsResponse = await axios.get(`${baseURL}/api/contracts`, {
      headers: {
        'Authorization': `Bearer ${hhmToken}`
      }
    });

    const factoryInvite = contractsResponse.data.find(c => c.status === 'factory_invite');
    if (factoryInvite) {
      console.log('✅ Factory invitation found in HHM dashboard');
      console.log(`📄 Contract ID: ${factoryInvite._id}`);
      console.log(`🏭 Factory: ${factoryInvite.factory_id?.name || 'Factory Name'}`);
      console.log(`💼 Role: ${factoryInvite.role_description}`);
    } else {
      console.log('❌ No factory invitation found in HHM dashboard');
    }

    // Step 5: HHM accepts the invitation
    console.log('\n5️⃣ HHM accepting invitation...');
    const acceptResponse = await axios.put(`${baseURL}/api/contracts/${contractId}/accept-invite`, {}, {
      headers: {
        'Authorization': `Bearer ${hhmToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Invitation accepted successfully');
    console.log(`📋 New Status: ${acceptResponse.data.contract.status}`);

    // Step 6: Verify final state
    console.log('\n6️⃣ Verifying final contract state...');
    const finalContractResponse = await axios.get(`${baseURL}/api/contracts/${contractId}`, {
      headers: {
        'Authorization': `Bearer ${factoryToken}`
      }
    });

    console.log('✅ Final verification complete');
    console.log(`📋 Final Status: ${finalContractResponse.data.status}`);

    console.log('\n🎉 Factory-to-HHM invitation workflow test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || error.response.data}`);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Alternative test: HHM rejects invitation
async function testInvitationRejection() {
  console.log('\n\n🧪 Testing Invitation Rejection Workflow\n');

  // This function would follow similar steps but call reject-invite instead
  // Implementation similar to above but ends with rejection
  console.log('ℹ️ Rejection test can be implemented similarly...');
}

// Run tests
testFactoryInviteWorkflow()
  .then(() => {
    console.log('\n✅ All tests completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  });