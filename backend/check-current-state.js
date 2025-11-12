const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const User = require('./models/user.model');
    const ravi = await User.findOne({ email: 'ravi.patel@example.com' });
    
    console.log('📦 Current Listings:');
    ravi.listings.forEach((listing, i) => {
      console.log(`${i+1}. ${listing.title} - ${listing.quantity_in_tons} tons (ID: ${listing._id})`);
    });
    
    console.log('\n📋 All Orders (last 5):');
    ravi.receivedOrders.slice(-5).forEach((order, i) => {
      console.log(`${i+1}. ${order.buyerDetails?.name} - ${order.orderDetails?.quantityWanted} tons (${order.status})`);
      console.log(`   Order ID: ${order.orderId}, Listing ID: ${order.listingId}`);
    });
    
    // Check if any orders are still pending
    const pendingOrders = ravi.receivedOrders.filter(o => o.status === 'pending');
    console.log(`\n🔍 Pending Orders: ${pendingOrders.length}`);
    
    if (pendingOrders.length === 0) {
      console.log('\n💡 Creating a new test order for debugging...');
      
      // Create a simple test order
      const testOrder = {
        buyerDetails: {
          name: "Test Buyer",
          email: "test@example.com",
          phone: "+91 9999999999"
        },
        orderDetails: {
          quantityWanted: 10, // Small amount to test update
          proposedPrice: 2500,
          totalAmount: 25000,
          deliveryLocation: "Test Location",
          message: "Test order for debugging quantity update",
          urgency: "normal"
        },
        isPartialFulfillment: false,
        orderId: new mongoose.Types.ObjectId(),
        listingId: ravi.listings[0]._id, // Use first listing
        farmerId: ravi._id,
        buyerId: ravi._id, // Self for testing
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      ravi.receivedOrders.push(testOrder);
      await ravi.save();
      
      console.log('✅ Test order created!');
      console.log(`   Order ID: ${testOrder.orderId}`);
      console.log(`   Quantity: ${testOrder.orderDetails.quantityWanted} tons`);
      console.log(`   Target Listing: ${ravi.listings[0].title} (${ravi.listings[0].quantity_in_tons} tons)`);
      console.log(`   Expected Result: ${ravi.listings[0].quantity_in_tons - testOrder.orderDetails.quantityWanted} tons remaining`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}).catch(console.error);