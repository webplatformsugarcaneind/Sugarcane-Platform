const mongoose = require('mongoose');
const User = require('./models/user.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sugarcane-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  createSampleOrders();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function createSampleOrders() {
  try {
    console.log('🔄 Creating sample orders...');

    // Find Ravi Patel (listing owner)
    const raviPatel = await User.findOne({ username: 'ravifarmer' });
    if (!raviPatel) {
      console.log('❌ Ravi Patel not found!');
      process.exit(1);
    }
    console.log('✅ Found Ravi Patel:', raviPatel.name);

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

    // Check Ravi's listings
    console.log('📋 Ravi listings count:', raviPatel.listings ? raviPatel.listings.length : 0);
    const listing = raviPatel.listings && raviPatel.listings[0];
    if (!listing) {
      console.log('❌ Ravi has no listings!');
      // Let's create a sample listing ID for testing
      const sampleListingId = new mongoose.Types.ObjectId().toString();
      console.log('🔄 Using sample listing ID for testing:', sampleListingId);
      
      // Sample orders to create with the sample listing ID
      await createOrdersForListing(raviPatel, otherFarmers, sampleListingId, 'Sample Sugarcane Listing');
      return;
    }

    const listingId = listing._id.toString();
    console.log('📋 Creating orders for listing:', listing.title);

    await createOrdersForListing(raviPatel, otherFarmers, listingId, listing.title);

  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
    process.exit(1);
  }
}

async function createOrdersForListing(raviPatel, otherFarmers, listingId, listingTitle) {
    // Sample orders to create
    const sampleOrders = [
      {
        buyerName: 'Amit Kumar',
        buyerEmail: 'amit.farmer@gmail.com', 
        buyerPhone: '+91 9876543211',
        quantityWanted: 50,
        proposedPrice: 2800,
        deliveryLocation: 'Mumbai, Maharashtra',
        message: 'I need high quality sugarcane for my sugar mill. Please let me know if this quantity is available.',
        urgency: 'high'
      },
      {
        buyerName: 'Suresh Patil',
        buyerEmail: 'suresh.patil@outlook.com',
        buyerPhone: '+91 9876543212', 
        quantityWanted: 30,
        proposedPrice: 3000,
        deliveryLocation: 'Pune, Maharashtra',
        message: 'Looking for fresh sugarcane. Can we discuss the quality and harvest date?',
        urgency: 'normal'
      },
      {
        buyerName: 'Rajesh Sharma',
        buyerEmail: 'rajesh.sugar@yahoo.com',
        buyerPhone: '+91 9876543213',
        quantityWanted: 100,
        proposedPrice: 2900,
        deliveryLocation: 'Aurangabad, Maharashtra',
        message: 'Bulk order for my processing unit. Need delivery within 2 weeks. Are you able to provide?',
        urgency: 'urgent'
      }
    ];

    // Create orders and assign them to other farmers as buyers
    for (let i = 0; i < sampleOrders.length && i < otherFarmers.length; i++) {
      const buyer = otherFarmers[i];
      const orderData = sampleOrders[i];

      const buyOrder = {
        orderId: new mongoose.Types.ObjectId(),
        listingId: listingId,
        farmerId: raviPatel._id, // Seller farmer ID
        buyerId: buyer._id, // Buyer farmer ID
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

      console.log(`✅ Created order from ${orderData.buyerName} to Ravi Patel`);
    }

    console.log('🎉 Sample orders created successfully!');
    console.log(`📊 Created ${sampleOrders.length} orders for listing: ${listingTitle}`);
    console.log('🔗 Now test at: http://localhost:5177');
    console.log('👆 Login as Ravi (ravifarmer/123456) and view your listing details!');

    process.exit(0);
}
