const mongoose = require('mongoose');
const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');
const bcrypt = require('bcryptjs');

async function createTestData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/herahermarizon');
    console.log('📡 Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await CropListing.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create a farmer
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const farmer = new User({
      name: 'Ravi Patel',
      email: 'ravi.patel@example.com',
      username: 'ravi_farmer',
      password: hashedPassword,
      phone: '+91-9876543210',
      role: 'Farmer',
      address: {
        street: 'Farm Road 123',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        country: 'India'
      },
      receivedOrders: [],
      sentOrders: [],
      listings: []
    });

    await farmer.save();
    console.log('✅ Farmer created:', farmer.name);

    // Create an HHM user to act as a buyer (since there's no 'Buyer' role)
    const buyer = new User({
      name: 'Suresh Kumar', 
      email: 'suresh.kumar@example.com',
      username: 'suresh_hhm',
      password: hashedPassword,
      phone: '+91-9876543211',
      role: 'HHM', // Using HHM as buyer since Buyer role doesn't exist
      address: {
        street: 'Market Street 456',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      receivedOrders: [],
      sentOrders: []
    });

    await buyer.save();
    console.log('✅ Buyer (HHM) created:', buyer.name);

    // Create a crop listing
    const listing = new CropListing({
      farmer_id: farmer._id,
      title: 'Premium Co 86032 Sugarcane - Ready for Harvest',
      sugarcane_variety: 'Co 86032',
      quantity_available: { 
        value: 40, 
        unit: 'gunthas' 
      },
      price_details: {
        price_per_unit: 2800,
        price_negotiable: false,
        minimum_order_quantity: 5
      },
      delivery_location: 'Katraj, Pune',
      delivery_timeframe: {
        available_from: new Date(),
        available_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        preferred_delivery_time: 'Morning (6AM-12PM)'
      },
      status: 'active',
      
      // Legacy fields for compatibility
      crop_variety: 'Co 86032',
      quantity_in_tons: 40, // Same as gunthas now
      expected_price_per_ton: 2800,
      location: 'Katraj, Pune, Maharashtra',
      description: 'Premium quality Co 86032 sugarcane variety ready for harvest. Disease-free and certified quality.',
      harvest_availability_date: new Date()
    });

    await listing.save();
    console.log('✅ Crop listing created:', listing.title, '- 40 gunthas');

    // Create a sample order
    const orderId = new mongoose.Types.ObjectId();
    const orderQuantity = 15; // Order 15 gunthas out of 40 available
    
    const orderDetails = {
      quantityWanted: orderQuantity,
      proposedPrice: listing.price_details.price_per_unit,
      totalAmount: orderQuantity * listing.price_details.price_per_unit,
      deliveryLocation: 'Pune Market',
      message: `I would like to purchase ${orderQuantity} gunthas of your ${listing.title}`,
      urgency: 'normal'
    };

    // Add to farmer's received orders
    farmer.receivedOrders.push({
      orderId: orderId,
      listingId: listing._id.toString(),
      farmerId: farmer._id,
      buyerId: buyer._id,
      buyerDetails: {
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone
      },
      orderDetails: orderDetails,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add to buyer's sent orders  
    buyer.sentOrders.push({
      orderId: orderId,
      listingId: listing._id.toString(),
      farmerId: farmer._id,
      buyerId: buyer._id,
      buyerDetails: {
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone
      },
      targetFarmerName: farmer.name,
      targetFarmerEmail: farmer.email,
      orderDetails: orderDetails,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await farmer.save();
    await buyer.save();

    console.log('✅ Sample order created: 15 gunthas requested from 40 gunthas available');
    console.log(`📋 Order ID: ${orderId}`);
    console.log(`🌾 Farmer ID: ${farmer._id}`);
    console.log(`🛒 Buyer ID: ${buyer._id}`);
    console.log(`📦 Listing ID: ${listing._id}`);

    console.log('\n🎉 Test data created successfully!');
    console.log('💡 Now you can test the quantity reduction by accepting the order');
    console.log(`📝 Use API: PUT /api/orders/${orderId}/status`);
    console.log(`   Body: {"status": "accepted"}`);
    console.log(`   Header: Authorization with farmer's token`);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`   ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.connection.close();
  }
}

createTestData();