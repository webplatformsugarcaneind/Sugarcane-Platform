const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

dotenv.config();

const checkAllOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to MongoDB');

    console.log('\n👨‍🌾 PRAKASH FARMER ORDERS:');
    const prakash = await User.findOne({ username: 'prakashfarmer' });
    if (prakash) {
      console.log(`📥 Received Orders: ${prakash.receivedOrders ? prakash.receivedOrders.length : 0}`);
      if (prakash.receivedOrders && prakash.receivedOrders.length > 0) {
        prakash.receivedOrders.slice(-3).forEach((order, index) => {
          console.log(`   ${index + 1}. Order ${order.orderId} from ${order.buyerDetails.name} - ${order.orderDetails.quantityWanted} tons (${order.status})`);
        });
      }
      
      console.log(`📤 Sent Orders: ${prakash.sentOrders ? prakash.sentOrders.length : 0}`);
      if (prakash.sentOrders && prakash.sentOrders.length > 0) {
        prakash.sentOrders.slice(-3).forEach((order, index) => {
          console.log(`   ${index + 1}. Order ${order.orderId} to ${order.targetFarmerName} - ${order.orderDetails.quantityWanted} tons (${order.status})`);
        });
      }
      
      console.log(`📦 Listings: ${prakash.listings ? prakash.listings.length : 0}`);
      if (prakash.listings && prakash.listings.length > 0) {
        prakash.listings.forEach((listing, index) => {
          console.log(`   ${index + 1}. ${listing.crop_variety} - ${listing.quantity_in_tons} tons (ID: ${listing._id})`);
        });
      }
    }

    console.log('\n👨‍🌾 RAVI FARMER ORDERS:');
    const ravi = await User.findOne({ username: 'ravifarmer' });
    if (ravi) {
      console.log(`📥 Received Orders: ${ravi.receivedOrders ? ravi.receivedOrders.length : 0}`);
      if (ravi.receivedOrders && ravi.receivedOrders.length > 0) {
        ravi.receivedOrders.slice(-3).forEach((order, index) => {
          console.log(`   ${index + 1}. Order ${order.orderId} from ${order.buyerDetails.name} - ${order.orderDetails.quantityWanted} tons (${order.status})`);
        });
      }
      
      console.log(`📤 Sent Orders: ${ravi.sentOrders ? ravi.sentOrders.length : 0}`);
      if (ravi.sentOrders && ravi.sentOrders.length > 0) {
        ravi.sentOrders.slice(-3).forEach((order, index) => {
          console.log(`   ${index + 1}. Order ${order.orderId} to ${order.targetFarmerName} - ${order.orderDetails.quantityWanted} tons (${order.status})`);
        });
      }
      
      console.log(`📦 Listings: ${ravi.listings ? ravi.listings.length : 0}`);
      if (ravi.listings && ravi.listings.length > 0) {
        ravi.listings.forEach((listing, index) => {
          console.log(`   ${index + 1}. ${listing.crop_variety} - ${listing.quantity_in_tons} tons (ID: ${listing._id})`);
        });
      }
    }

    console.log('\n📋 RECENT PENDING ORDERS:');
    const allUsers = await User.find({
      $or: [
        { 'receivedOrders.status': 'pending' },
        { 'sentOrders.status': 'pending' }
      ]
    });

    for (const user of allUsers) {
      if (user.receivedOrders) {
        const pending = user.receivedOrders.filter(order => order.status === 'pending');
        pending.forEach(order => {
          console.log(`🔄 ${user.name} has pending order: ${order.orderId} from ${order.buyerDetails.name} (${order.orderDetails.quantityWanted} tons)`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkAllOrders();
