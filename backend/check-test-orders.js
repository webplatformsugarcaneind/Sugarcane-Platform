const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const User = require('./models/user.model');
    const ravi = await User.findOne({ email: 'ravi.patel@example.com' });
    
    console.log('🔍 Current Listings Quantities:');
    ravi.listings.forEach((listing, i) => {
      console.log(`  ${i+1}. ${listing.title} - ${listing.quantity_in_tons} tons`);
    });
    
    console.log('\n📦 Pending Orders:');
    const pendingOrders = ravi.receivedOrders.filter(o => o.status === 'pending');
    pendingOrders.forEach((order, i) => {
      console.log(`  ${i+1}. Order ${order.orderId} - ${order.orderDetails?.quantityWanted} tons (${order.status})`);
    });
    
    if (pendingOrders.length > 0) {
      console.log('\n✅ You can test the order acceptance now!');
      console.log('💡 Go to http://localhost:5174 and login as ravi.patel@example.com');
      console.log('📦 Navigate to My Orders to see pending orders');
      console.log('🔄 Test accepting an order to see quantity management in action');
    } else {
      console.log('\n❌ No pending orders found. Creating a test order...');
      
      // Find another user to create an order
      const buyer = await User.findOne({ 
        userType: 'farmer',
        email: { $ne: 'ravi.patel@example.com' }
      });
      
      if (buyer && ravi.listings.length > 0) {
        const listing = ravi.listings[0];
        const testOrder = {
          buyerDetails: {
            name: buyer.name,
            email: buyer.email,
            phone: buyer.phone || '+91 9876543210'
          },
          orderDetails: {
            quantityWanted: 80, // Request more than available to test partial fulfillment
            proposedPrice: listing.expected_price_per_ton,
            totalAmount: 80 * listing.expected_price_per_ton,
            deliveryLocation: 'Mumbai, Maharashtra',
            message: 'Test order to verify quantity management system',
            urgency: 'normal'
          },
          isPartialFulfillment: false,
          orderId: new mongoose.Types.ObjectId(),
          listingId: listing._id,
          farmerId: ravi._id,
          buyerId: buyer._id,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        ravi.receivedOrders.push(testOrder);
        
        // Also add to buyer's sent orders
        buyer.sentOrders.push({
          ...testOrder,
          targetFarmerName: ravi.name,
          targetFarmerEmail: ravi.email
        });
        
        await ravi.save();
        await buyer.save();
        
        console.log('✅ Test order created successfully!');
        console.log(`📋 Order ID: ${testOrder.orderId}`);
        console.log(`🌾 Listing: ${listing.title} (${listing.quantity_in_tons} tons available)`);
        console.log(`📦 Requested: ${testOrder.orderDetails.quantityWanted} tons`);
        console.log('💡 This should trigger partial fulfillment when accepted');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}).catch(console.error);
