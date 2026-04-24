const mongoose = require('mongoose');
const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

async function checkDatabaseState() {
  try {
    await mongoose.connect('mongodb://localhost:27017/herahermarizon');
    console.log('📡 Connected to database');

    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`👥 Total users: ${totalUsers}`);

    // Check farmers specifically
    const farmers = await User.find({ role: 'Farmer' }).select('name receivedOrders sentOrders listings');
    console.log(`🌾 Farmers: ${farmers.length}`);

    // Check all orders (sent and received)
    let totalReceivedOrders = 0;
    let totalSentOrders = 0;
    let pendingReceivedOrders = 0;
    let pendingSentOrders = 0;

    farmers.forEach(farmer => {
      if (farmer.receivedOrders && farmer.receivedOrders.length > 0) {
        totalReceivedOrders += farmer.receivedOrders.length;
        pendingReceivedOrders += farmer.receivedOrders.filter(order => order.status === 'pending').length;
        console.log(`📥 ${farmer.name}: ${farmer.receivedOrders.length} received orders (${farmer.receivedOrders.filter(o => o.status === 'pending').length} pending)`);
      }
      if (farmer.sentOrders && farmer.sentOrders.length > 0) {
        totalSentOrders += farmer.sentOrders.length;
        pendingSentOrders += farmer.sentOrders.filter(order => order.status === 'pending').length;
        console.log(`📤 ${farmer.name}: ${farmer.sentOrders.length} sent orders (${farmer.sentOrders.filter(o => o.status === 'pending').length} pending)`);
      }
      if (farmer.listings && farmer.listings.length > 0) {
        console.log(`📋 ${farmer.name}: ${farmer.listings.length} embedded listings`);
        farmer.listings.forEach((listing, idx) => {
          const qty = listing.quantity_available?.value || listing.quantity_in_tons || 0;
          console.log(`   ${idx+1}. ${listing.crop_type}: ${qty} gunthas`);
        });
      }
    });

    console.log(`\n📊 Order Summary:`);
    console.log(`   Received orders: ${totalReceivedOrders} (${pendingReceivedOrders} pending)`);
    console.log(`   Sent orders: ${totalSentOrders} (${pendingSentOrders} pending)`);

    // Check CropListing collection
    const cropListings = await CropListing.find({});
    console.log(`\n📋 CropListing collection: ${cropListings.length} listings`);
    cropListings.forEach((listing, idx) => {
      const qty = listing.quantity_available?.value || listing.quantity_in_tons || 0;
      console.log(`   ${idx+1}. ${listing.crop_type}: ${qty} gunthas (ID: ${listing._id.toString().slice(-6)})`);
    });

    // Let's also check all roles
    const allUsers = await User.find({}).select('name role sentOrders receivedOrders');
    console.log(`\n👥 All users by role:`);
    const roleGroups = {};
    allUsers.forEach(user => {
      if (!roleGroups[user.role]) roleGroups[user.role] = [];
      roleGroups[user.role].push(user.name);
    });
    Object.keys(roleGroups).forEach(role => {
      console.log(`   ${role}: ${roleGroups[role].length} users (${roleGroups[role].join(', ')})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkDatabaseState();