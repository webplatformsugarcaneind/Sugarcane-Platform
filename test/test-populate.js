require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/user.model');

const testPopulate = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    const factoryId = '695563d36ca6b32dcf2b8d7a'; // Factory with 3 HHMs
    
    console.log('\n🔍 Test 1: Find without populate');
    const factory1 = await User.findById(factoryId).select('name associatedHHMs').lean();
    console.log('Factory name:', factory1.name);
    console.log('AssociatedHHMs (raw IDs):', factory1.associatedHHMs);
    
    console.log('\n🔍 Test 2: Find with populate');
    const factory2 = await User.findById(factoryId)
      .select('name associatedHHMs')
      .populate('associatedHHMs', 'name username email phone location experience')
      .lean();
    console.log('Factory name:', factory2.name);
    console.log('AssociatedHHMs (populated):', factory2.associatedHHMs);
    
    console.log('\n🔍 Test 3: Using select to exclude then include');
    const factory3 = await User.findById(factoryId)
      .select('-password -receivedOrders -sentOrders')
      .populate('associatedHHMs', 'name username email phone location experience')
      .lean();
    console.log('Factory name:', factory3.name);
    console.log('AssociatedHHMs:', factory3.associatedHHMs);
    console.log('Has associatedHHMs field?', 'associatedHHMs' in factory3);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testPopulate();