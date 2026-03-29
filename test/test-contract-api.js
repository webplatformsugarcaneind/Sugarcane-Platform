const mongoose = require('mongoose');
const Contract = require('./models/contract.model');
const User = require('./models/user.model');

// Test the Contract model
async function testContractModel() {
  try {
    console.log('🧪 Testing Contract Model...');
    
    // Check if model exports correctly
    console.log('✅ Contract model imported successfully');
    console.log('📋 Schema paths:', Object.keys(Contract.schema.paths));
    
    // Check schema validation
    const requiredFields = ['hhm_id', 'factory_id', 'status', 'initiated_by'];
    const schemaFields = Object.keys(Contract.schema.paths);
    
    requiredFields.forEach(field => {
      if (schemaFields.includes(field)) {
        console.log(`✅ Required field '${field}' exists in schema`);
      } else {
        console.log(`❌ Required field '${field}' missing from schema`);
      }
    });
    
    // Check enum values for status
    const statusEnum = Contract.schema.paths.status.enumValues;
    console.log('📊 Status enum values:', statusEnum);
    
    // Check enum values for initiated_by
    const initiatedByEnum = Contract.schema.paths.initiated_by.enumValues;
    console.log('👤 Initiated by enum values:', initiatedByEnum);
    
    // Test static methods exist
    const staticMethods = [
      'findByHHM',
      'findByFactory', 
      'findActiveContract',
      'findExpired',
      'findExpiringSoon'
    ];
    
    staticMethods.forEach(method => {
      if (typeof Contract[method] === 'function') {
        console.log(`✅ Static method '${method}' exists`);
      } else {
        console.log(`❌ Static method '${method}' missing`);
      }
    });
    
    console.log('✅ Contract model test completed successfully!');
    
  } catch (error) {
    console.error('❌ Contract model test failed:', error.message);
  }
}

// Test the controller functions
async function testControllerImports() {
  try {
    console.log('🧪 Testing Contract Controller...');
    
    const controller = require('./controllers/contract.controller');
    
    const expectedFunctions = [
      'createContractRequest',
      'respondToContract',
      'finalizeContract',
      'getMyContracts',
      'getContractById',
      'extendContract',
      'cancelContract',
      'getContractStats'
    ];
    
    expectedFunctions.forEach(funcName => {
      if (typeof controller[funcName] === 'function') {
        console.log(`✅ Controller function '${funcName}' exists`);
      } else {
        console.log(`❌ Controller function '${funcName}' missing`);
      }
    });
    
    console.log('✅ Contract controller test completed successfully!');
    
  } catch (error) {
    console.error('❌ Contract controller test failed:', error.message);
  }
}

// Test the routes
async function testRouteImports() {
  try {
    console.log('🧪 Testing Contract Routes...');
    
    const routes = require('./routes/contract.routes');
    console.log('✅ Contract routes imported successfully');
    console.log('📋 Route type:', typeof routes);
    
    console.log('✅ Contract routes test completed successfully!');
    
  } catch (error) {
    console.error('❌ Contract routes test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Contract API Tests...\n');
  
  await testContractModel();
  console.log('');
  
  await testControllerImports();
  console.log('');
  
  await testRouteImports();
  console.log('');
  
  console.log('🎉 All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testContractModel,
  testControllerImports,
  testRouteImports,
  runAllTests
};