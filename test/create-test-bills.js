const mongoose = require('mongoose');
const User = require('./models/user.model');
const Bill = require('./models/bill.model');

async function createTestBills() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sugarcane-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find deepak factory and farmers
    const factory = await User.findOne({ username: 'deepakfactory' });
    const farmer1 = await User.findOne({ username: 'prakashfarmer' });
    const farmer2 = await User.findOne({ username: 'ravifarmer' });

    if (!factory) {
      throw new Error('Factory user not found');
    }

    console.log(`📍 Factory: ${factory.name} (${factory.username})`);

    // Clear existing bills for this factory
    await Bill.deleteMany({ factoryId: factory._id });
    console.log('🗑️ Cleared existing bills');

    // Create test bills
    const testBills = [];

    if (farmer1) {
      testBills.push({
        factoryId: factory._id,
        farmerId: farmer1._id,
        cropQuantity: 1000, // 1000 kg
        totalAmount: 25000, // ₹25,000
        status: 'paid',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date()
      });

      testBills.push({
        factoryId: factory._id,
        farmerId: farmer1._id,
        cropQuantity: 1500, // 1500 kg
        totalAmount: 37500, // ₹37,500
        status: 'pending', // Pending
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date()
      });
    }

    if (farmer2) {
      testBills.push({
        factoryId: factory._id,
        farmerId: farmer2._id,
        cropQuantity: 2000, // 2000 kg
        totalAmount: 50000, // ₹50,000
        status: 'paid',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date()
      });

      testBills.push({
        factoryId: factory._id,
        farmerId: farmer2._id,
        cropQuantity: 800, // 800 kg
        totalAmount: 20000, // ₹20,000
        status: 'pending', // Pending
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date()
      });
    }

    // Create bills in database
    for (const billData of testBills) {
      const bill = new Bill(billData);
      await bill.save();
      
      const farmer = await User.findById(billData.farmerId);
      console.log(`✅ Created ${billData.status} bill: ${farmer.name} - ₹${billData.totalAmount.toLocaleString()}`);
    }

    // Show summary
    console.log(`\n📊 DASHBOARD PREVIEW:`);
    
    const paidBills = testBills.filter(b => b.status === 'paid');
    const pendingBills = testBills.filter(b => b.status === 'pending');
    const totalRevenue = paidBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    
    console.log(`💰 Total Revenue: ₹${totalRevenue.toLocaleString()} (from ${paidBills.length} paid bills)`);
    console.log(`📋 Pending Bills: ${pendingBills.length}`);
    console.log(`👥 Active HHMs: 3 (from existing associations)`);

    console.log(`\n🎉 Created ${testBills.length} test bills for dashboard stats!`);

  } catch (error) {
    console.error('❌ Error creating test bills:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

createTestBills();