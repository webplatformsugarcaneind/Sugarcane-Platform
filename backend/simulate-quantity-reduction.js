const mongoose = require('mongoose');
const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

async function simulateOrderAcceptance() {
  try {
    await mongoose.connect('mongodb://localhost:27017/herahermarizon');
    console.log('📡 Connected to database');

    console.log('🧪 DEMONSTRATING AUTOMATIC QUANTITY REDUCTION');
    console.log('==============================================');

    // Find the farmer and their orders
    const farmer = await User.findOne({ username: 'ravi_farmer' });
    if (!farmer) {
      console.log('❌ Farmer not found');
      return;
    }

    console.log(`\n👨‍🌾 Farmer: ${farmer.name}`);

    // Check current crop listing quantities BEFORE order acceptance
    console.log('\n📊 BEFORE ORDER ACCEPTANCE:');
    const listing = await CropListing.findOne({ farmer_id: farmer._id });
    if (listing) {
      const quantity = listing.quantity_available?.value || listing.quantity_in_tons || 0;
      console.log(`   📦 Listing: "${listing.title}"`);
      console.log(`   📊 Available quantity: ${quantity} gunthas`);
      console.log(`   💰 Price: ₹${listing.price_details?.price_per_unit || listing.expected_price_per_ton}/gunthas`);
    }

    // Check pending orders
    const pendingOrders = farmer.receivedOrders.filter(order => order.status === 'pending');
    if (pendingOrders.length === 0) {
      console.log('❌ No pending orders found');
      return;
    }

    const order = pendingOrders[0];
    console.log(`\n📥 PENDING ORDER:`);
    console.log(`   🛒 Buyer: ${order.buyerDetails.name}`);
    console.log(`   📦 Quantity requested: ${order.orderDetails.quantityWanted} gunthas`);
    console.log(`   💰 Price offered: ₹${order.orderDetails.proposedPrice}/gunthas`);
    console.log(`   💵 Total amount: ₹${order.orderDetails.totalAmount}`);

    // SIMULATE ORDER ACCEPTANCE (This mimics the PUT /api/orders/:orderId/status endpoint)
    console.log('\n⚡ SIMULATING ORDER ACCEPTANCE...');
    console.log('   (This demonstrates the same logic as PUT /api/orders/:orderId/status)');

    const orderIndex = farmer.receivedOrders.findIndex(o => o.orderId.toString() === order.orderId.toString());
    
    // Check quantity availability (same logic as the API)
    const availableQuantity = listing.quantity_available?.value || listing.quantity_in_tons || 0;
    const requestedQuantity = order.orderDetails.quantityWanted;
    
    console.log(`\n🔍 QUANTITY CHECK:`);
    console.log(`   📊 Available: ${availableQuantity} gunthas`);
    console.log(`   📦 Requested: ${requestedQuantity} gunthas`);

    if (availableQuantity <= 0) {
      console.log('❌ Out of stock!');
      return;
    }

    let finalQuantity = requestedQuantity;
    let isPartialFulfillment = false;

    // Check if partial fulfillment needed
    if (requestedQuantity > availableQuantity) {
      finalQuantity = availableQuantity;
      isPartialFulfillment = true;
      console.log(`⚠️  PARTIAL FULFILLMENT: Can only provide ${finalQuantity} gunthas`);
    } else {
      console.log(`✅ FULL FULFILLMENT: Can provide all ${finalQuantity} gunthas`);
    }

    // Update order details
    farmer.receivedOrders[orderIndex].status = 'accepted';
    farmer.receivedOrders[orderIndex].orderDetails.quantityWanted = finalQuantity;
    farmer.receivedOrders[orderIndex].orderDetails.totalAmount = finalQuantity * order.orderDetails.proposedPrice;
    farmer.receivedOrders[orderIndex].isPartialFulfillment = isPartialFulfillment;
    farmer.receivedOrders[orderIndex].originalQuantityRequested = requestedQuantity;
    farmer.receivedOrders[orderIndex].updatedAt = new Date();

    // REDUCE LISTING QUANTITY (the key feature!)
    const newQuantity = availableQuantity - finalQuantity;
    console.log(`\n🔄 QUANTITY UPDATE:`);
    console.log(`   📊 ${availableQuantity} - ${finalQuantity} = ${newQuantity} gunthas remaining`);

    if (newQuantity <= 0) {
      // Remove listing if quantity becomes 0
      await CropListing.findByIdAndDelete(listing._id);
      console.log(`🗑️  Listing removed (quantity depleted)`);
    } else {
      // Update listing quantity
      const updateFields = {
        'quantity_available.value': newQuantity,
        quantity_in_tons: newQuantity  // Keep legacy field synchronized
      };
      await CropListing.findByIdAndUpdate(listing._id, updateFields);
      console.log(`📝 Listing quantity updated to ${newQuantity} gunthas`);
    }

    // Save farmer's updated orders
    await farmer.save();
    
    console.log('\n✅ ORDER ACCEPTED & QUANTITY REDUCED!');

    // Show final status
    console.log('\n📊 AFTER ORDER ACCEPTANCE:');
    
    const updatedListing = await CropListing.findById(listing._id);
    if (updatedListing) {
      const updatedQuantity = updatedListing.quantity_available?.value || updatedListing.quantity_in_tons || 0;
      console.log(`   📦 Listing: "${updatedListing.title}"`);
      console.log(`   📊 NEW available quantity: ${updatedQuantity} gunthas`);
    } else {
      console.log(`   📦 Listing: REMOVED (sold out)`);
    }

    const acceptedOrder = farmer.receivedOrders[orderIndex];
    console.log(`\n📥 ORDER STATUS:`);
    console.log(`   📋 Status: ${acceptedOrder.status}`);
    console.log(`   📦 Final quantity: ${acceptedOrder.orderDetails.quantityWanted} gunthas`);
    console.log(`   💵 Final amount: ₹${acceptedOrder.orderDetails.totalAmount}`);
    if (acceptedOrder.isPartialFulfillment) {
      console.log(`   ⚠️  Partial fulfillment (requested ${acceptedOrder.originalQuantityRequested} gunthas)`);
    }

    console.log('\n🎉 DEMONSTRATION COMPLETED!');
    console.log('\n🔧 THE SYSTEM AUTOMATICALLY:');
    console.log('   ✅ Checks quantity availability');
    console.log('   ✅ Handles partial fulfillment when needed');
    console.log('   ✅ Reduces listing quantity by accepted amount');
    console.log('   ✅ Removes listings when quantity reaches 0');
    console.log('   ✅ Updates both quantity fields for compatibility');
    console.log('   ✅ Saves all changes to database');

    console.log('\n💡 This same logic runs in the API endpoint:');
    console.log('   PUT /api/orders/:orderId/status (lines 448-680 in orders.routes.js)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

simulateOrderAcceptance();