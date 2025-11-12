const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    console.log('🔧 Fixing quantity update issue in order acceptance...\n');
    
    const User = require('./models/user.model');
    
    // Find Ravi and check his listing quantities
    const ravi = await User.findOne({ email: 'ravi.patel@example.com' });
    
    console.log('📦 Current User Listings for Ravi:');
    ravi.listings.forEach((listing, i) => {
      console.log(`  ${i+1}. ${listing.title}`);
      console.log(`     Quantity: ${listing.quantity_in_tons} tons`);
      console.log(`     Price: ₹${listing.expected_price_per_ton}/ton`);
      console.log(`     Status: ${listing.status}`);
    });
    
    console.log('\n📋 Recent Orders:');
    ravi.receivedOrders.slice(-3).forEach((order, i) => {
      console.log(`  ${i+1}. Order ${order.orderId}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Requested: ${order.orderDetails?.quantityWanted} tons`);
      console.log(`     Price: ₹${order.orderDetails?.proposedPrice}/ton`);
      console.log(`     Total: ₹${order.orderDetails?.totalAmount}`);
      if (order.isPartialFulfillment) {
        console.log(`     🔄 Partial fulfillment: ${order.originalQuantityRequested} → ${order.orderDetails?.quantityWanted} tons`);
      }
    });
    
    // Let's test a manual quantity update to make sure it works
    console.log('\n🧪 Testing manual quantity update...');
    
    if (ravi.listings.length > 0) {
      const firstListing = ravi.listings[0];
      const originalQuantity = firstListing.quantity_in_tons;
      
      console.log(`Original quantity: ${originalQuantity} tons`);
      
      // Simulate accepting a 30-ton order when listing has 50 tons
      const orderQuantity = Math.min(30, originalQuantity);
      const newQuantity = originalQuantity - orderQuantity;
      
      console.log(`Simulating order acceptance:`);
      console.log(`  Order quantity: ${orderQuantity} tons`);
      console.log(`  New listing quantity: ${newQuantity} tons`);
      
      // Update the quantity
      firstListing.quantity_in_tons = newQuantity;
      
      // Save the user
      await ravi.save();
      
      console.log(`✅ Quantity updated successfully!`);
      
      // Verify the update
      const updatedRavi = await User.findOne({ email: 'ravi.patel@example.com' });
      console.log(`🔍 Verified new quantity: ${updatedRavi.listings[0].quantity_in_tons} tons`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}).catch(console.error);