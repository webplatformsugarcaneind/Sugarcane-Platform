const mongoose = require('mongoose');
const User = require('./models/user.model');

async function checkCurrentOrders() {
  try {
    console.log('🔍 Checking current orders in database...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sugarcane-platform');
    console.log('✅ Connected to MongoDB');

    // Find Ravi
    const ravi = await User.findOne({ username: 'ravifarmer' });
    if (!ravi) {
      console.log('❌ Ravi not found');
      process.exit(1);
    }

    console.log('👤 Ravi found:', ravi.name);
    console.log('📋 Listings count:', ravi.listings ? ravi.listings.length : 0);
    console.log('📬 Received orders count:', ravi.receivedOrders ? ravi.receivedOrders.length : 0);

    if (ravi.listings && ravi.listings.length > 0) {
      console.log('\n📋 Ravi\'s listings:');
      ravi.listings.forEach((listing, index) => {
        console.log(`  ${index + 1}. ${listing.title} (ID: ${listing._id})`);
      });
    }

    if (ravi.receivedOrders && ravi.receivedOrders.length > 0) {
      console.log('\n📬 Ravi\'s received orders:');
      ravi.receivedOrders.forEach((order, index) => {
        console.log(`  ${index + 1}. From: ${order.buyerDetails.name}`);
        console.log(`      Listing ID: ${order.listingId}`);
        console.log(`      Amount: ₹${order.orderDetails.totalAmount}`);
        console.log(`      Status: ${order.status}`);
      });

      // Check if any orders match the listing IDs
      const listingIds = ravi.listings.map(l => l._id.toString());
      const matchingOrders = ravi.receivedOrders.filter(order => 
        listingIds.includes(order.listingId)
      );

      console.log(`\n🎯 Orders matching current listings: ${matchingOrders.length}`);
      if (matchingOrders.length > 0) {
        matchingOrders.forEach((order, index) => {
          const matchingListing = ravi.listings.find(l => l._id.toString() === order.listingId);
          console.log(`  ${index + 1}. Order for "${matchingListing?.title || 'Unknown'}" from ${order.buyerDetails.name}`);
        });
      }
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error checking orders:', error);
    process.exit(1);
  }
}

checkCurrentOrders();