const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

dotenv.config();

const debugSpecificOrder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to MongoDB');

    const failingOrderId = '69119c9b2e08c15fdb661c3b';
    console.log(`\n🔍 Debugging Order: ${failingOrderId}`);

    // Find Prakash and the specific order
    const prakash = await User.findOne({ username: 'prakashfarmer' });
    if (!prakash) {
      console.log('❌ Prakash farmer not found');
      return;
    }

    const order = prakash.receivedOrders.find(o => o.orderId.toString() === failingOrderId);
    if (!order) {
      console.log('❌ Order not found in Prakash received orders');
      return;
    }

    console.log('\n📋 Order Details:');
    console.log('Order ID:', order.orderId);
    console.log('Buyer ID:', order.buyerId);
    console.log('Buyer ID Type:', typeof order.buyerId);
    console.log('Is Valid ObjectId:', mongoose.Types.ObjectId.isValid(order.buyerId));
    console.log('Listing ID:', order.listingId);
    console.log('Status:', order.status);
    
    // Check if buyerId exists as a user
    console.log('\n👤 Checking Buyer:');
    try {
      const buyer = await User.findById(order.buyerId);
      console.log('Buyer found:', buyer ? 'YES ✅' : 'NO ❌');
      if (buyer) {
        console.log('Buyer name:', buyer.name);
        console.log('Buyer has sentOrders:', buyer.sentOrders ? 'YES ✅' : 'NO ❌');
        if (buyer.sentOrders) {
          console.log('SentOrders count:', buyer.sentOrders.length);
        }
      }
    } catch (buyerError) {
      console.error('❌ Error finding buyer:', buyerError.message);
    }

    // Check raw order structure
    console.log('\n🔍 Raw Order Object:');
    console.log(JSON.stringify(order, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

debugSpecificOrder();