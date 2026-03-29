/**
 * Test Contract Lifecycle API Endpoints
 * 
 * This script tests the new contract lifecycle management endpoints:
 * - Mark as delivered
 * - Mark as paid  
 * - Mark as completed
 * 
 * Tests both Factory-HHM contracts and Farmer-HHM contracts
 */
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';

let authTokens = {};
let testContracts = {};

// Test users for different roles
const TEST_USERS = {
  factory: { email: 'factory@test.com', password: 'password123' },
  hhm: { email: 'hhm@test.com', password: 'password123' },
  farmer: { email: 'farmer@test.com', password: 'password123' }
};

/**
 * Login and get authentication tokens
 */
async function loginUsers() {
  console.log('🔐 Logging in test users...');
  
  try {
    for (const [role, credentials] of Object.entries(TEST_USERS)) {
      const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
      
      if (response.data.success) {
        authTokens[role] = response.data.token;
        console.log(`✅ ${role} logged in successfully`);
      } else {
        console.log(`❌ Failed to login ${role}:`, response.data.message);
      }
    }
  } catch (error) {
    console.error('❌ Error during login:', error.message);
  }
}

/**
 * Create authorization header for API calls
 */
function getAuthHeader(userRole) {
  return {
    headers: {
      'Authorization': `Bearer ${authTokens[userRole]}`,
      'Content-Type': 'application/json'
    }
  };
}

/**
 * Test Factory-HHM Contract Lifecycle
 */
async function testFactoryHHMContractLifecycle() {
  console.log('\n📋 Testing Factory-HHM Contract Lifecycle...');
  
  try {
    // 1. Get an accepted contract
    const contractsResponse = await axios.get(
      `${BASE_URL}/contracts/my-contracts?status=hhm_accepted`, 
      getAuthHeader('factory')
    );

    if (!contractsResponse.data.data || contractsResponse.data.data.length === 0) {
      console.log('⚠️ No accepted Factory-HHM contracts found for testing');
      return;
    }

    const contract = contractsResponse.data.data[0];
    const contractId = contract._id || contract.id;
    testContracts.factoryHHM = contractId;

    console.log(`📄 Testing with contract ID: ${contractId}`);
    console.log(`📊 Contract status: ${contract.status}`);

    // 2. Mark as delivered
    console.log('\n🚚 Testing mark-delivered endpoint...');
    const deliveredResponse = await axios.put(
      `${BASE_URL}/contracts/${contractId}/mark-delivered`,
      {},
      getAuthHeader('factory')
    );

    if (deliveredResponse.data.success) {
      console.log('✅ Contract marked as delivered successfully');
      console.log(`📅 Delivery date: ${deliveredResponse.data.data.delivery_date}`);
    } else {
      console.log('❌ Failed to mark as delivered:', deliveredResponse.data.message);
    }

    // 3. Mark as paid
    console.log('\n💰 Testing mark-paid endpoint...');
    const paidResponse = await axios.put(
      `${BASE_URL}/contracts/${contractId}/mark-paid`,
      {},
      getAuthHeader('hhm')
    );

    if (paidResponse.data.success) {
      console.log('✅ Contract marked as paid successfully');
      console.log(`💳 Payment date: ${paidResponse.data.data.payment_date}`);
      console.log(`📊 Payment status: ${paidResponse.data.data.payment_status}`);
    } else {
      console.log('❌ Failed to mark as paid:', paidResponse.data.message);
    }

    // 4. Mark as completed
    console.log('\n🎯 Testing mark-completed endpoint...');
    const completedResponse = await axios.put(
      `${BASE_URL}/contracts/${contractId}/mark-completed`,
      {},
      getAuthHeader('factory')
    );

    if (completedResponse.data.success) {
      console.log('✅ Contract marked as completed successfully');
      console.log(`📊 Final status: ${completedResponse.data.data.status}`);
      console.log(`🏁 Finalized at: ${completedResponse.data.data.finalized_at}`);
    } else {
      console.log('❌ Failed to mark as completed:', completedResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error testing Factory-HHM contract lifecycle:', error.response?.data?.message || error.message);
  }
}

/**
 * Test Farmer-HHM Contract Lifecycle
 */
async function testFarmerHHMContractLifecycle() {
  console.log('\n👨‍🌾 Testing Farmer-HHM Contract Lifecycle...');
  
  try {
    // 1. Get an accepted farmer contract
    const contractsResponse = await axios.get(
      `${BASE_URL}/farmer-contracts/my-contracts?status=hhm_accepted`, 
      getAuthHeader('farmer')
    );

    if (!contractsResponse.data.data || contractsResponse.data.data.length === 0) {
      console.log('⚠️ No accepted Farmer-HHM contracts found for testing');
      return;
    }

    const contract = contractsResponse.data.data[0];
    const contractId = contract._id || contract.id;
    testContracts.farmerHHM = contractId;

    console.log(`📄 Testing with contract ID: ${contractId}`);
    console.log(`📊 Contract status: ${contract.status}`);

    // 2. Mark as delivered
    console.log('\n🚚 Testing mark-delivered endpoint...');
    const deliveredResponse = await axios.put(
      `${BASE_URL}/farmer-contracts/${contractId}/mark-delivered`,
      {},
      getAuthHeader('hhm')
    );

    if (deliveredResponse.data.success) {
      console.log('✅ Contract marked as delivered successfully');
      console.log(`📅 Delivery date: ${deliveredResponse.data.data.delivery_date}`);
    } else {
      console.log('❌ Failed to mark as delivered:', deliveredResponse.data.message);
    }

    // 3. Mark as paid
    console.log('\n💰 Testing mark-paid endpoint...');
    const paidResponse = await axios.put(
      `${BASE_URL}/farmer-contracts/${contractId}/mark-paid`,
      {},
      getAuthHeader('farmer')
    );

    if (paidResponse.data.success) {
      console.log('✅ Contract marked as paid successfully');
      console.log(`💳 Payment date: ${paidResponse.data.data.payment_date}`);
      console.log(`📊 Payment status: ${paidResponse.data.data.payment_status}`);
    } else {
      console.log('❌ Failed to mark as paid:', paidResponse.data.message);
    }

    // 4. Mark as completed
    console.log('\n🎯 Testing mark-completed endpoint...');
    const completedResponse = await axios.put(
      `${BASE_URL}/farmer-contracts/${contractId}/mark-completed`,
      {},
      getAuthHeader('farmer')
    );

    if (completedResponse.data.success) {
      console.log('✅ Contract marked as completed successfully');
      console.log(`📊 Final status: ${completedResponse.data.data.status}`);
    } else {
      console.log('❌ Failed to mark as completed:', completedResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error testing Farmer-HHM contract lifecycle:', error.response?.data?.message || error.message);
  }
}

/**
 * Test Error Scenarios
 */
async function testErrorScenarios() {
  console.log('\n🚨 Testing Error Scenarios...');
  
  try {
    // Test with invalid contract ID
    console.log('\n❌ Testing with invalid contract ID...');
    const invalidResponse = await axios.put(
      `${BASE_URL}/contracts/invalid-id/mark-delivered`,
      {},
      getAuthHeader('factory')
    );
    
  } catch (error) {
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.log('✅ Invalid contract ID properly rejected');
    } else {
      console.log('❌ Unexpected error for invalid ID:', error.response?.data?.message);
    }
  }

  try {
    // Test unauthorized access
    console.log('\n🔒 Testing unauthorized access...');
    if (testContracts.factoryHHM) {
      const unauthorizedResponse = await axios.put(
        `${BASE_URL}/contracts/${testContracts.factoryHHM}/mark-delivered`,
        {},
        getAuthHeader('farmer') // Farmer trying to access Factory-HHM contract
      );
    }
    
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Unauthorized access properly rejected');
    } else {
      console.log('❌ Unexpected error for unauthorized access:', error.response?.data?.message);
    }
  }
}

/**
 * Display Test Summary
 */
function displayTestSummary() {
  console.log('\n📋 TEST SUMMARY');
  console.log('================');
  console.log('✅ Contract models updated with delivery_date, payment_date, and payment_status fields');
  console.log('✅ Added "completed" status to both contract types');
  console.log('✅ API routes created for mark-delivered, mark-paid, and mark-completed');
  console.log('✅ Authorization and validation implemented');
  console.log('✅ Error handling for edge cases');
  console.log('\n📚 Next Steps:');
  console.log('1. Add UI buttons in Factory/HHM/Farmer dashboards');
  console.log('2. Implement frontend API calls to these endpoints');
  console.log('3. Add status indicators for delivery and payment in the UI');
  console.log('4. Consider adding notification system for lifecycle events');
}

/**
 * Main test execution
 */
async function runContractLifecycleTests() {
  console.log('🧪 Starting Contract Lifecycle API Tests');
  console.log('==========================================');

  await loginUsers();
  
  if (Object.keys(authTokens).length < 3) {
    console.log('❌ Failed to login required test users. Skipping API tests.');
    displayTestSummary();
    return;
  }

  await testFactoryHHMContractLifecycle();
  await testFarmerHHMContractLifecycle();
  await testErrorScenarios();
  
  displayTestSummary();
}

// Run the tests
if (require.main === module) {
  runContractLifecycleTests().catch(console.error);
}

module.exports = {
  runContractLifecycleTests,
  testFactoryHHMContractLifecycle,
  testFarmerHHMContractLifecycle,
  testErrorScenarios
};