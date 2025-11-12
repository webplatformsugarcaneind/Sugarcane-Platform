const mongoose = require('mongoose');
const User = require('./models/user.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sugarcane-platform')
.then(() => {
  console.log('✅ Connected to MongoDB');
  createListingsForRavi();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function createListingsForRavi() {
  try {
    console.log('🔄 Creating listings for Ravi...');

    // Find Ravi Patel
    const raviPatel = await User.findOne({ username: 'ravifarmer' });
    if (!raviPatel) {
      console.log('❌ Ravi Patel not found!');
      process.exit(1);
    }
    console.log('✅ Found Ravi Patel:', raviPatel.name);

    // Clear existing listings
    await User.findByIdAndUpdate(raviPatel._id, {
      $set: { listings: [] }
    });

    // Sample listings to add to Ravi's profile
    const sampleListings = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Premium Sugarcane Harvest 2025',
        crop_variety: 'Sugarcane Premium',
        quantity_in_tons: 50,
        expected_price_per_ton: 2500,
        harvest_availability_date: new Date('2025-12-15'),
        location: 'Nashik, Maharashtra',
        description: 'Premium quality sugarcane, perfect for sugar production. Grown with organic farming methods.',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Organic Sugarcane - Bulk Sale',
        crop_variety: 'Organic Sugarcane',
        quantity_in_tons: 75,
        expected_price_per_ton: 3000,
        harvest_availability_date: new Date('2025-11-30'),
        location: 'Nashik, Maharashtra',
        description: 'Certified organic sugarcane, ideal for premium sugar and jaggery production.',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Fresh Harvest Sugarcane',
        crop_variety: 'Fresh Sugarcane',
        quantity_in_tons: 25,
        expected_price_per_ton: 2200,
        harvest_availability_date: new Date('2025-11-20'),
        location: 'Nashik, Maharashtra',
        description: 'Freshly harvested sugarcane with high sugar content. Ready for immediate delivery.',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Large Scale Sugarcane Supply',
        crop_variety: 'Bulk Sugarcane',
        quantity_in_tons: 100,
        expected_price_per_ton: 2800,
        harvest_availability_date: new Date('2025-12-01'),
        location: 'Nashik, Maharashtra',
        description: 'Large quantity sugarcane supply for industrial use. Competitive pricing for bulk orders.',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Add listings to Ravi's profile
    await User.findByIdAndUpdate(raviPatel._id, {
      $push: { 
        listings: { $each: sampleListings }
      }
    });

    console.log('✅ Created 4 sample listings for Ravi');
    
    // Verify listings were created
    const updatedRavi = await User.findById(raviPatel._id);
    console.log('📊 Ravi now has', updatedRavi.listings ? updatedRavi.listings.length : 0, 'listings');

    sampleListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - ${listing.quantity_in_tons}t @ ₹${listing.expected_price_per_ton}/t`);
    });

    console.log('🎉 Listings creation completed successfully!');
    console.log('📋 First listing ID for testing:', sampleListings[0]._id.toString());

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating listings:', error);
    process.exit(1);
  }
}