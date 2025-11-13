// Test script for FarmerContract API endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

// Test data
const loginData = {
  farmer: { identifier: 'ravifarmer', password: '123456' },
  hhm: { identifier: 'sunitahhm', password: '123456' }
};

// Helper function to login and get token
async function login(credentials) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data.token;
  } catch (error) {
    console.error('❌ Login error:', error.message);
    throw error;
  }
}

// Test farmer contract creation
async function testCreateContract() {
  console.log('\n🧪 Testing Farmer Contract Creation...');
  
  try {
    // Login as farmer
    const farmerToken = await login(loginData.farmer);
    console.log('✅ Farmer logged in successfully');
    
    // Get HHM user ID first (we need sunitahhm's ID)
    const hhmResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData.hhm)
    });
    
    const hhmData = await hhmResponse.json();
    const hhmId = hhmData.data.user.id;
    console.log('✅ HHM ID obtained:', hhmId);
    
    // Create contract request
    const contractData = {
      hhm_id: hhmId,
      contract_details: {
        farmLocation: "Nashik, Maharashtra",
        workType: "Sugarcane harvesting",
        requirements: "50 workers needed for harvesting season",
        paymentTerms: "₹500 per day per worker",
        startDate: "2024-01-15",
        endDate: "2024-02-15",
        notes: "Urgent requirement for sugarcane harvesting"
      },
      duration_days: 30,
      grace_period_days: 3
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/farmer-contracts/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      },
      body: JSON.stringify(contractData)
    });
    
    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Contract creation failed: ${errorData.message}`);
    }
    
    const contractResult = await createResponse.json();
    console.log('✅ Contract created successfully!');
    console.log('📄 Contract ID:', contractResult.data.contract.id);
    console.log('📋 Status:', contractResult.data.contract.status);
    console.log('👥 Farmer:', contractResult.data.contract.farmer_id.name);
    console.log('👨‍💼 HHM:', contractResult.data.contract.hhm_id.name);
    
    return contractResult.data.contract.id;
    
  } catch (error) {
    console.error('❌ Contract creation test failed:', error.message);
    throw error;
  }
}

// Test get my contracts
async function testGetContracts() {
  console.log('\n📊 Testing Get My Contracts...');
  
  try {
    // Login as farmer
    const farmerToken = await login(loginData.farmer);
    console.log('✅ Farmer logged in successfully');
    
    // Get contracts
    const contractsResponse = await fetch(`${BASE_URL}/api/farmer-contracts/my-contracts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${farmerToken}`
      }
    });
    
    if (!contractsResponse.ok) {
      const errorData = await contractsResponse.json();
      throw new Error(`Get contracts failed: ${errorData.message}`);
    }
    
    const contractsResult = await contractsResponse.json();
    console.log('✅ Contracts retrieved successfully!');
    console.log('📊 Total contracts:', contractsResult.data.summary.total);
    console.log('🌾 As farmer:', contractsResult.data.summary.asFarmer);
    console.log('👨‍💼 As HHM:', contractsResult.data.summary.asHHM);
    console.log('📈 Status breakdown:', contractsResult.data.summary.byStatus);
    
  } catch (error) {
    console.error('❌ Get contracts test failed:', error.message);
    throw error;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting FarmerContract API Tests...');
  
  try {
    await testCreateContract();
    await testGetContracts();
    console.log('\n🎉 All tests passed successfully!');
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Check if node-fetch is available, if not provide installation instructions
try {
  require('node-fetch');
  runTests();
} catch (error) {
  console.log('📦 node-fetch is required. Installing...');
  console.log('Run: npm install node-fetch@2');
  console.log('Then run this test again.');
}