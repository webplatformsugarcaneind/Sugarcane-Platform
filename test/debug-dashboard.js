const mongoose = require('mongoose');
const User = require('./models/user.model');
const Bill = require('./models/bill.model');

async function debugDashboardData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sugarcane-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔍 DEBUGGING DASHBOARD DATA');
    console.log('='.repeat(40));

    // Find deepak factory
    const factory = await User.findOne({ username: 'deepakfactory' }).populate('associatedHHMs');
    
    console.log('\n📍 Factory Info:');
    console.log(`Name: ${factory.name}`);
    console.log(`ID: ${factory._id}`);
    console.log(`Associated HHMs count: ${factory.associatedHHMs?.length || 0}`);
    
    if (factory.associatedHHMs?.length > 0) {
      factory.associatedHHMs.forEach((hhm, index) => {
        console.log(`  ${index + 1}. ${hhm.name} (${hhm.username})`);
      });
    }

    // Check bills for this factory
    console.log('\n📋 Bills for this factory:');
    const allBills = await Bill.find({ factoryId: factory._id }).populate('farmerId');
    console.log(`Total bills: ${allBills.length}`);
    
    if (allBills.length > 0) {
      allBills.forEach((bill, index) => {
        console.log(`  ${index + 1}. ${bill.farmerId.name} - ₹${bill.totalAmount} (${bill.status})`);
      });
      
      const pendingBills = allBills.filter(b => b.status === 'pending');
      const paidBills = allBills.filter(b => b.status === 'paid');
      const totalRevenue = paidBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      
      console.log(`\nPending Bills: ${pendingBills.length}`);
      console.log(`Paid Bills: ${paidBills.length}`);
      console.log(`Total Revenue: ₹${totalRevenue.toLocaleString()}`);
    }

    // Check if factory ID matches
    console.log('\n🔍 Checking Factory ID matches:');
    const billsCount = await Bill.countDocuments({ factoryId: factory._id });
    console.log(`Bills with factoryId ${factory._id}: ${billsCount}`);
    
    const pendingCount = await Bill.countDocuments({ factoryId: factory._id, status: 'pending' });
    console.log(`Pending bills with factoryId ${factory._id}: ${pendingCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

debugDashboardData();