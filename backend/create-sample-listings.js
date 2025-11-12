const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const CropListing = require('./models/cropListing.model');
const User = require('./models/user.model');

const createSampleListings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to MongoDB');

    // Check if we have any farmers
    const farmers = await User.find({ role: 'Farmer' }).limit(5);
    
    if (farmers.length === 0) {
      console.log('❌ No farmers found. Please create farmer users first.');
      process.exit(1);
    }

    console.log(`👨‍🌾 Found ${farmers.length} farmers`);

    // Sample listings data
    const sampleListings = [
      {
        title: 'Premium Sugarcane Harvest 2025',
        crop_variety: 'Sugarcane Premium',
        quantity_in_tons: 50,
        expected_price_per_ton: 2500,
        harvest_availability_date: new Date('2025-12-15'),
        location: 'Mumbai, Maharashtra',
        description: 'High quality sugarcane with excellent sugar content. Ready for immediate processing.',
        status: 'active',
        farmer_id: farmers[0]._id
      },
      {
        title: 'Organic Sugarcane - Bulk Sale',
        crop_variety: 'Organic Sugarcane',
        quantity_in_tons: 75,
        expected_price_per_ton: 3000,
        harvest_availability_date: new Date('2025-11-20'),
        location: 'Pune, Maharashtra',
        description: 'Certified organic sugarcane, perfect for premium sugar production.',
        status: 'active',
        farmer_id: farmers[1] ? farmers[1]._id : farmers[0]._id
      },
      {
        title: 'Fresh Harvest Sugarcane',
        crop_variety: 'Traditional Sugarcane',
        quantity_in_tons: 25,
        expected_price_per_ton: 2200,
        harvest_availability_date: new Date('2025-11-30'),
        location: 'Nashik, Maharashtra',
        description: 'Freshly harvested traditional variety sugarcane. Excellent for juice production.',
        status: 'active',
        farmer_id: farmers[2] ? farmers[2]._id : farmers[0]._id
      },
      {
        title: 'Large Scale Sugarcane Supply',
        crop_variety: 'Commercial Grade',
        quantity_in_tons: 100,
        expected_price_per_ton: 2800,
        harvest_availability_date: new Date('2025-12-01'),
        location: 'Kolhapur, Maharashtra',
        description: 'Large scale commercial grade sugarcane available for bulk purchase.',
        status: 'active',
        farmer_id: farmers[3] ? farmers[3]._id : farmers[0]._id
      }
    ];

    // Clear existing listings
    await CropListing.deleteMany({});
    console.log('🧹 Cleared existing listings');

    // Create new sample listings
    const createdListings = await CropListing.create(sampleListings);
    console.log(`✅ Created ${createdListings.length} sample listings`);

    // Display created listings
    createdListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - ${listing.quantity_in_tons}t @ ₹${listing.expected_price_per_ton}/t`);
    });

    console.log('🎉 Sample data creation completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating sample listings:', error);
    process.exit(1);
  }
};

createSampleListings();