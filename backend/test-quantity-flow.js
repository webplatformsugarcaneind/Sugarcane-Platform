const mongoose = require('mongoose');
require('dotenv').config();

async function testQuantityUpdateFlow() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB\n');

    const User = require('./models/user.model');
    
    // Get Ravi's current listings and orders
    const ravi = await User.findOne({ email: 'ravi.patel@example.com' });
    
    console.log('📦 Current Listings Before Order Acceptance:');
    ravi.listings.forEach((listing, i) => {
      console.log(`  ${i+1}. ${listing.title}`);
      console.log(`     ID: ${listing._id}`);
      console.log(`     Quantity: ${listing.quantity_in_tons} tons`);
      console.log(`     Price: ₹${listing.expected_price_per_ton}/ton`);
      console.log(`     Status: ${listing.status}\n`);
    });
    
    console.log('📋 Pending Orders:');
    const pendingOrders = ravi.receivedOrders.filter(order => order.status === 'pending');
    pendingOrders.forEach((order, i) => {
      console.log(`  ${i+1}. Order ID: ${order.orderId}`);
      console.log(`     Buyer: ${order.buyerDetails?.name || 'N/A'}`);
      console.log(`     Listing ID: ${order.listingId}`);
      console.log(`     Requested: ${order.orderDetails?.quantityWanted} tons`);
      console.log(`     Price: ₹${order.orderDetails?.proposedPrice}/ton`);
      console.log(`     Total: ₹${order.orderDetails?.totalAmount}\n`);
      
      // Find corresponding listing
      const listing = ravi.listings.find(l => l._id.toString() === order.listingId.toString());
      if (listing) {
        console.log(`     📋 Matching Listing: "${listing.title}"`);
        console.log(`     📊 Available: ${listing.quantity_in_tons} tons`);
        
        if (order.orderDetails?.quantityWanted > listing.quantity_in_tons) {
          console.log(`     ⚠️  PARTIAL FULFILLMENT: Can only provide ${listing.quantity_in_tons} tons`);
          console.log(`     🗑️  Listing will be REMOVED (quantity = 0)`);
        } else if (order.orderDetails?.quantityWanted === listing.quantity_in_tons) {
          console.log(`     ✅ EXACT FULFILLMENT: Full quantity requested`);
          console.log(`     🗑️  Listing will be REMOVED (quantity = 0)`);
        } else {
          const remaining = listing.quantity_in_tons - order.orderDetails?.quantityWanted;
          console.log(`     ✅ FULL FULFILLMENT: ${order.orderDetails?.quantityWanted} tons`);
          console.log(`     📝 Listing will be UPDATED to ${remaining} tons`);
        }
      } else {
        console.log(`     ❌ No matching listing found!`);
      }
      console.log();
    });
    
    if (pendingOrders.length > 0) {
      console.log('🎯 TEST SCENARIOS AVAILABLE:');
      console.log('1. Go to http://localhost:5174/');
      console.log('2. Login as: ravifarmer / 123456');
      console.log('3. Click "My Orders" button');
      console.log('4. Accept a pending order');
      console.log('5. Check "My Listing" to verify quantity updates');
      console.log('\n💡 Expected Behavior:');
      console.log('- If order quantity >= listing quantity → Listing REMOVED');
      console.log('- If order quantity < listing quantity → Listing UPDATED with remaining quantity');
    } else {
      console.log('❌ No pending orders found. Create some orders first to test.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testQuantityUpdateFlow();