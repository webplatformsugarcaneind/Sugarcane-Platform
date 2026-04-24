const mongoose = require('mongoose');
const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

async function createSampleOrders() {
  try {
    await mongoose.connect('mongodb://localhost:27017/herahermarizon');
    console.log('📡 Connected to database');

    // Find farmers and their listings
    const farmers = await User.find({ role: 'Farmer' }).populate('listings');
    const listings = await CropListing.find({});
    
    console.log(`🌾 Found ${farmers.length} farmers and ${listings.length} listings`);

    // Create a buyer if none exists
    let buyer = await User.findOne({ role: 'Buyer' });
    if (!buyer) {
      console.log('🛒 Creating sample buyer...');
      buyer = new User({
        name: 'Suresh Kumar',
        email: 'suresh.buyer@example.com',
        username: 'suresh_buyer',
        password: 'password123',
        phone: '+91-9876543210',
        role: 'Buyer',
        address: {
          street: '123 Market Street',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          country: 'India'
        },
        sentOrders: [],
        receivedOrders: []
      });
      await buyer.save();
      console.log('✅ Buyer created successfully');
    }

    // Create sample orders for each listing
    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      const farmer = await User.findById(listing.farmer_id);
      
      if (!farmer) {
        console.log(`⚠️  Skipping listing ${listing._id} - farmer not found`);
        continue;
      }

      const availableQuantity = listing.quantity_available?.value || listing.quantity_in_tons || 0;
      const orderQuantity = Math.min(20, availableQuantity); // Order 20 gunthas or less if not available

      if (orderQuantity <= 0) {
        console.log(`⚠️  Skipping listing ${listing.crop_type} - no quantity available`);
        continue;
      }

      console.log(`📦 Creating order for ${listing.crop_type} (${orderQuantity} gunthas)`);

      const orderId = new mongoose.Types.ObjectId();
      
      // Create order details
      const orderDetails = {
        quantityWanted: orderQuantity,
        proposedPrice: listing.price_per_gunthas || 2500,
        totalAmount: orderQuantity * (listing.price_per_gunthas || 2500),
        deliveryLocation: 'Pune Market',
        message: `I would like to purchase ${orderQuantity} gunthas of your ${listing.crop_type}`,
        urgency: 'normal'
      };

      // Add to farmer's received orders
      const receivedOrder = {
        orderId: orderId,
        buyerId: buyer._id,
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        listingId: listing._id,
        orderDetails: orderDetails,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!farmer.receivedOrders) farmer.receivedOrders = [];
      farmer.receivedOrders.push(receivedOrder);

      // Add to buyer's sent orders
      const sentOrder = {
        orderId: orderId,
        farmerId: farmer._id,
        targetFarmerName: farmer.name,
        targetFarmerEmail: farmer.email,
        listingId: listing._id,
        orderDetails: orderDetails,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!buyer.sentOrders) buyer.sentOrders = [];
      buyer.sentOrders.push(sentOrder);

      // Save both users
      await farmer.save();
      await buyer.save();

      console.log(`✅ Order created: ${orderQuantity} gunthas of ${listing.crop_type} for ₹${orderDetails.totalAmount}`);
    }

    console.log('\n🎉 Sample orders created successfully!');
    console.log('💡 Now you can test the quantity reduction by accepting orders through the API');

    // Show current status
    const updatedFarmers = await User.find({ role: 'Farmer' }).select('name receivedOrders');
    console.log('\n📋 Current pending orders:');
    updatedFarmers.forEach(farmer => {
      if (farmer.receivedOrders && farmer.receivedOrders.length > 0) {
        const pendingOrders = farmer.receivedOrders.filter(order => order.status === 'pending');
        console.log(`${farmer.name}: ${pendingOrders.length} pending orders`);
        pendingOrders.forEach((order, idx) => {
          console.log(`  ${idx + 1}. ${order.orderDetails.quantityWanted} gunthas (Order ID: ${order.orderId})`);
        });
      }
    });

  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createSampleOrders();