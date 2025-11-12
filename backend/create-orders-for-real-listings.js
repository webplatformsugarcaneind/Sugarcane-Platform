const mongoose = require('mongoose');
const User = require('./models/user.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sugarcane-platform')
.then(() => {
  console.log('✅ Connected to MongoDB');
  createOrdersForRaviListings();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function createOrdersForRaviListings() {
  try {
    console.log('🔄 Creating orders for Ravi\'s actual listings...');

    // Find Ravi Patel
    const raviPatel = await User.findOne({ username: 'ravifarmer' });
    if (!raviPatel) {
      console.log('❌ Ravi Patel not found!');
      process.exit(1);
    }
    console.log('✅ Found Ravi Patel:', raviPatel.name);

    // Check his listings
    if (!raviPatel.listings || raviPatel.listings.length === 0) {
      console.log('❌ Ravi has no listings!');
      process.exit(1);
    }

    console.log('📋 Ravi has', raviPatel.listings.length, 'listings');

    // Find other farmers to create orders from
    const otherFarmers = await User.find({ 
      role: 'Farmer',
      _id: { $ne: raviPatel._id }
    }).limit(3);

    if (otherFarmers.length === 0) {
      console.log('❌ No other farmers found to create orders from!');
      process.exit(1);
    }
    console.log('✅ Found other farmers:', otherFarmers.map(f => f.name));

    // Clear any existing received orders
    await User.findByIdAndUpdate(raviPatel._id, {
      $set: { receivedOrders: [] }
    });

    // Clear any existing sent orders from other farmers
    for (const farmer of otherFarmers) {
      await User.findByIdAndUpdate(farmer._id, {
        $set: { sentOrders: [] }
      });
    }

    // Get the first listing to create orders for
    const targetListing = raviPatel.listings[0];
    const listingId = targetListing._id.toString();
    console.log('🎯 Creating orders for listing:', targetListing.title);

    // Sample orders to create
    const sampleOrders = [
      {
        buyerName: 'Amit Kumar',
        buyerEmail: 'amit.farmer@gmail.com', 
        buyerPhone: '+91 9876543211',
        quantityWanted: 30,
        proposedPrice: 2600,
        deliveryLocation: 'Mumbai, Maharashtra',
        message: 'I need high quality sugarcane for my sugar mill. Please let me know if this quantity is available.',
        urgency: 'high'
      },
      {
        buyerName: 'Suresh Patil',
        buyerEmail: 'suresh.patil@outlook.com',
        buyerPhone: '+91 9876543212', 
        quantityWanted: 20,
        proposedPrice: 2700,
        deliveryLocation: 'Pune, Maharashtra',
        message: 'Looking for fresh sugarcane. Can we discuss the quality and harvest date?',
        urgency: 'normal'
      },
      {
        buyerName: 'Rajesh Sharma',
        buyerEmail: 'rajesh.sugar@yahoo.com',
        buyerPhone: '+91 9876543213',
        quantityWanted: 50,
        proposedPrice: 2550,
        deliveryLocation: 'Aurangabad, Maharashtra',
        message: 'Bulk order for my processing unit. Need delivery within 2 weeks. Are you able to provide?',
        urgency: 'urgent'
      }
    ];

    // Create orders using the actual listing ID
    for (let i = 0; i < sampleOrders.length && i < otherFarmers.length; i++) {
      const buyer = otherFarmers[i % otherFarmers.length]; // Use modulo in case we have fewer farmers
      const orderData = sampleOrders[i];

      const buyOrder = {
        orderId: new mongoose.Types.ObjectId(),
        listingId: listingId, // Use actual listing ID
        farmerId: raviPatel._id,
        buyerId: buyer._id,
        buyerDetails: {
          name: orderData.buyerName,
          email: orderData.buyerEmail,
          phone: orderData.buyerPhone
        },
        orderDetails: {
          quantityWanted: orderData.quantityWanted,
          proposedPrice: orderData.proposedPrice,
          totalAmount: orderData.quantityWanted * orderData.proposedPrice,
          deliveryLocation: orderData.deliveryLocation,
          message: orderData.message,
          urgency: orderData.urgency
        },
        status: 'pending',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
        updatedAt: new Date()
      };

      // Add order to Ravi's received orders
      await User.findByIdAndUpdate(raviPatel._id, {
        $push: { receivedOrders: buyOrder }
      });

      // Add order to buyer's sent orders
      await User.findByIdAndUpdate(buyer._id, {
        $push: { 
          sentOrders: {
            ...buyOrder,
            targetFarmerName: raviPatel.name,
            targetFarmerEmail: raviPatel.email
          }
        }
      });

      console.log(`✅ Created order from ${orderData.buyerName} to Ravi Patel for ₹${orderData.quantityWanted * orderData.proposedPrice}`);
    }

    // Verify orders were created
    const updatedRavi = await User.findById(raviPatel._id);
    console.log('📊 Ravi now has', updatedRavi.receivedOrders ? updatedRavi.receivedOrders.length : 0, 'received orders');

    console.log('🎉 Sample orders created successfully!');
    console.log(`📋 Orders created for listing: ${targetListing.title}`);
    console.log(`🆔 Listing ID: ${listingId}`);
    console.log('🔗 Now test at: http://localhost:5177');
    console.log('👆 Login as Ravi (ravifarmer/123456) and view your listing details!');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating orders:', error);
    process.exit(1);
  }
}