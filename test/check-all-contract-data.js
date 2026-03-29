const mongoose = require('mongoose');
require('dotenv').config();

// Import all contract models
const Contract = require('./models/contract.model');
const FarmerContract = require('./models/farmerContract.model');
const User = require('./models/user.model');

async function checkAllContractData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📱 Connected to MongoDB\n');

    console.log('🔍 COMPREHENSIVE CONTRACT DATA CHECK\n');
    console.log('='.repeat(50));

    // 1. Check Contract collection
    console.log('\n1️⃣ REGULAR CONTRACTS (contracts collection)');
    console.log('-'.repeat(30));
    
    const totalContracts = await Contract.countDocuments();
    console.log('📋 Total contracts:', totalContracts);
    
    if (totalContracts > 0) {
      const contractStatuses = await Contract.distinct('status');
      console.log('📋 Contract statuses:', contractStatuses);
      
      console.log('\n📊 Contract status breakdown:');
      for (const status of contractStatuses) {
        const count = await Contract.countDocuments({ status });
        console.log(`   - ${status}: ${count}`);
      }
      
      console.log('\n📋 Sample contracts:');
      const sampleContracts = await Contract.find()
        .limit(3)
        .lean();
        
      sampleContracts.forEach((contract, index) => {
        console.log(`📋 Contract ${index + 1}:`);
        console.log(`   - ID: ${contract._id}`);
        console.log(`   - Status: ${contract.status}`);
        console.log(`   - HHM ID: ${contract.hhm_id}`);
        console.log(`   - Factory ID: ${contract.factory_id}`);
        console.log(`   - Request Details: ${contract.request_details || 'N/A'}`);
        console.log(`   - Allowance Details: ${contract.allowance_details || 'N/A'}`);
        console.log('');
      });
    }

    // 2. Check FarmerContract collection
    console.log('\n2️⃣ FARMER CONTRACTS (farmercontracts collection)');
    console.log('-'.repeat(30));
    
    const totalFarmerContracts = await FarmerContract.countDocuments();
    console.log('📋 Total farmer contracts:', totalFarmerContracts);
    
    if (totalFarmerContracts > 0) {
      const farmerContractStatuses = await FarmerContract.distinct('status');
      console.log('📋 Farmer contract statuses:', farmerContractStatuses);
      
      console.log('\n📊 Farmer contract status breakdown:');
      for (const status of farmerContractStatuses) {
        const count = await FarmerContract.countDocuments({ status });
        console.log(`   - ${status}: ${count}`);
      }
      
      console.log('\n📋 Sample farmer contracts:');
      const sampleFarmerContracts = await FarmerContract.find()
        .limit(3)
        .lean();
        
      sampleFarmerContracts.forEach((contract, index) => {
        console.log(`📋 Farmer Contract ${index + 1}:`);
        console.log(`   - ID: ${contract._id}`);
        console.log(`   - Status: ${contract.status}`);
        console.log(`   - Farmer ID: ${contract.farmer_id}`);
        console.log(`   - HHM ID: ${contract.hhm_id}`);
        console.log(`   - Duration: ${contract.duration_days} days`);
        console.log(`   - Grace Period: ${contract.grace_period_days} days`);
        console.log(`   - Payment Status: ${contract.payment_status}`);
        console.log(`   - Created: ${contract.createdAt}`);
        console.log('');
      });
    }

    // 3. Test contract data retrieval for specific users
    console.log('\n3️⃣ CONTRACT DATA RETRIEVAL BY USER');
    console.log('-'.repeat(30));
    
    // Find users with contracts
    const farmers = await User.find({ role: 'Farmer' }).limit(2);
    const hhms = await User.find({ role: 'HHM' }).limit(2);
    
    console.log(`\n📋 Testing for ${farmers.length} farmers and ${hhms.length} HHMs:`);
    
    for (const farmer of farmers) {
      const farmerContracts = await FarmerContract.find({ farmer_id: farmer._id });
      const regularContracts = await Contract.find({ hhm_id: farmer._id }); // Farmers don't have factory contracts
      
      console.log(`📋 ${farmer.name} (Farmer):`);
      console.log(`   - Farmer contracts: ${farmerContracts.length}`);
      console.log(`   - Regular contracts: ${regularContracts.length}`);
    }
    
    for (const hhm of hhms) {
      const farmerContracts = await FarmerContract.find({ hhm_id: hhm._id });
      const regularContracts = await Contract.find({ 
        $or: [
          { hhm_id: hhm._id },
          { factory_id: hhm._id }
        ]
      });
      
      console.log(`📋 ${hhm.name} (HHM):`);
      console.log(`   - Farmer contracts: ${farmerContracts.length}`);
      console.log(`   - Regular contracts: ${regularContracts.length}`);
    }

    // 4. Check contract validation and relationships
    console.log('\n4️⃣ CONTRACT DATA VALIDATION');
    console.log('-'.repeat(30));
    
    // Check for broken references
    console.log('\n🔍 Checking for broken references...');
    
    const contractsWithInvalidRefs = await Contract.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'hhm_id',
          foreignField: '_id',
          as: 'hhm'
        }
      },
      {
        $lookup: {
          from: 'users', 
          localField: 'factory_id',
          foreignField: '_id',
          as: 'factory'
        }
      },
      {
        $match: {
          $or: [
            { hhm: { $size: 0 } },
            { factory: { $size: 0 } }
          ]
        }
      }
    ]);
    
    const farmerContractsWithInvalidRefs = await FarmerContract.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'farmer_id',
          foreignField: '_id',
          as: 'farmer'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'hhm_id', 
          foreignField: '_id',
          as: 'hhm'
        }
      },
      {
        $match: {
          $or: [
            { farmer: { $size: 0 } },
            { hhm: { $size: 0 } }
          ]
        }
      }
    ]);
    
    console.log(`📋 Contracts with broken user references: ${contractsWithInvalidRefs.length}`);
    console.log(`📋 Farmer contracts with broken user references: ${farmerContractsWithInvalidRefs.length}`);
    
    if (contractsWithInvalidRefs.length > 0) {
      console.log('⚠️ Found contracts with invalid references!');
      contractsWithInvalidRefs.forEach(contract => {
        console.log(`   - Contract ${contract._id}: Missing hhm/factory`);
      });
    }
    
    if (farmerContractsWithInvalidRefs.length > 0) {
      console.log('⚠️ Found farmer contracts with invalid references!');
      farmerContractsWithInvalidRefs.forEach(contract => {
        console.log(`   - Farmer Contract ${contract._id}: Missing farmer/hhm`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Contract data check completed!');
    
  } catch (error) {
    console.error('❌ Error checking contract data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📱 Disconnected from MongoDB');
  }
}

checkAllContractData();