const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Load Mongoose models
const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sugarcane-ecosystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Read the JSON data files
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
);

// Function to create sample listings with proper farmer references
const createSampleListingsWithValidFarmers = async (farmers) => {
  console.log('📋 Creating sample crop listings...'.blue);
  
  if (farmers.length === 0) {
    console.log('⚠️  No farmers found, skipping listing creation'.yellow);
    return;
  }

  // Modern crop listings using new schema
  const sampleListings = [
    {
      farmer_id: farmers[0]._id,
      status: 'active',
      title: 'Premium Co 86032 Sugarcane - Certified Quality',
      sugarcane_variety: 'Co 86032',
      seed_quality: {
        disease_free_status: 'Certified Disease-Free',
        certification_details: 'Maharashtra Agricultural Development Trust certified'
      },
      crop_age: 10,
      germination_percentage: 95,
      seed_type: '3-Bud Setts',
      quantity_available: {
        value: 50,
        unit: 'gunthas'
      },
      price_details: {
        price_per_unit: 2800,
        price_negotiable: true,
        minimum_order_quantity: 5
      },
      delivery_location: 'Nashik, Maharashtra',
      delivery_timeframe: {
        available_from: new Date('2026-03-10'),
        available_until: new Date('2026-12-30'),
        preferred_delivery_time: 'Morning (6AM-12PM)'
      },
      farm_images: [
        {
          url: '/uploads/farms/sample-sugarcane-1.jpg',
          caption: 'Healthy Co 86032 variety crop',
          image_type: 'crop_closeup'
        }
      ]
    },
    {
      farmer_id: farmers[1] ? farmers[1]._id : farmers[0]._id,
      status: 'active',
      title: 'Organic Co 0238 Sugarcane - Premium Grade',
      sugarcane_variety: 'Co 0238',
      seed_quality: {
        disease_free_status: 'Tested Healthy',
        certification_details: 'Organic India certified, pesticide-free'
      },
      crop_age: 8,
      germination_percentage: 92,
      seed_type: '2-Bud Setts',
      quantity_available: {
        value: 75,
        unit: 'gunthas'
      },
      price_details: {
        price_per_unit: 3200,
        price_negotiable: true,
        minimum_order_quantity: 10
      },
      delivery_location: 'Pune, Maharashtra',
      delivery_timeframe: {
        available_from: new Date('2026-03-15'),
        available_until: new Date('2026-12-15'),
        preferred_delivery_time: 'Flexible'
      },
      farm_images: [
        {
          url: '/uploads/farms/sample-organic-1.jpg',
          caption: 'Organic Co 0238 ready for harvest',
          image_type: 'farm_overview'
        }
      ]
    },
    {
      farmer_id: farmers[2] ? farmers[2]._id : farmers[0]._id,
      status: 'active',
      title: 'High-Yield Co 62175 Variety - Bulk Available',
      sugarcane_variety: 'Co 62175',
      seed_quality: {
        disease_free_status: 'Standard Quality',
        certification_details: ''
      },
      crop_age: 12,
      germination_percentage: 88,
      seed_type: 'Mixed Setts',
      quantity_available: {
        value: 120,
        unit: 'gunthas'
      },
      price_details: {
        price_per_unit: 2600,
        price_negotiable: false,
        minimum_order_quantity: 20
      },
      delivery_location: 'Kolhapur, Maharashtra',
      delivery_timeframe: {
        available_from: new Date('2026-03-20'),
        available_until: new Date('2026-12-25'),
        preferred_delivery_time: 'Afternoon (12PM-6PM)'
      }
    },
    {
      farmer_id: farmers[3] ? farmers[3]._id : farmers[0]._id,
      status: 'active',
      title: 'Fresh Co 06022 - Direct from Farm',
      sugarcane_variety: 'Co 06022',
      seed_quality: {
        disease_free_status: 'Certified Disease-Free',
        certification_details: 'Government agricultural officer verified'
      },
      crop_age: 9,
      germination_percentage: 93,
      seed_type: '3-Bud Setts',
      quantity_available: {
        value: 35,
        unit: 'gunthas'
      },
      price_details: {
        price_per_unit: 2900,
        price_negotiable: true,
        minimum_order_quantity: 5
      },
      delivery_location: 'Sangli, Maharashtra',
      delivery_timeframe: {
        available_from: new Date('2026-03-25'),
        available_until: new Date('2026-12-20'),
        preferred_delivery_time: 'Morning (6AM-12PM)'
      }
    }
  ];

  try {
    // Clear existing crop listings first
    await CropListing.deleteMany({});
    console.log('🧹 Cleared existing crop listings'.yellow);
    
    // Create new listings
    const createdListings = await CropListing.create(sampleListings);
    console.log(`✅ Created ${createdListings.length} sample crop listings`.green);
    
    // Display created listings with farmer info
    for (let i = 0; i < createdListings.length; i++) {
      const listing = createdListings[i];
      const farmer = farmers.find(f => f._id.toString() === listing.farmer_id.toString());
      console.log(`  ${i + 1}. "${listing.title}" - ${listing.quantity_available.value}${listing.quantity_available.unit}`.cyan);
      console.log(`     Farmer: ${farmer?.name || 'Unknown'} (${farmer?.email || 'No email'})`.gray);
      console.log(`     Price: ₹${listing.price_details.price_per_unit}/${listing.quantity_available.unit}`.gray);
    }
    
  } catch (error) {
    console.error('❌ Error creating sample listings:', error.message);
  }
};

// Function to import data into the database
const importData = async () => {
  try {
    console.log('🗑  Cleaning up existing data...'.yellow);
    
    // Clear existing data to prevent duplicates
    await User.deleteMany();
    await CropListing.deleteMany(); // Also clear listings to prevent orphaned references

    console.log('👥 Importing users data...'.blue);
    
    // Insert users (including Factory role users with profile data)
    const createdUsers = await User.create(users);
    console.log('✅ Users imported successfully'.green);
    
    // Count users by role
    const farmerUsers = createdUsers.filter(user => user.role === 'Farmer');
    const factoryUsers = createdUsers.filter(user => user.role === 'Factory');
    const hhmUsers = createdUsers.filter(user => user.role === 'HHM');
    const labourUsers = createdUsers.filter(user => user.role === 'Labour');
    
    console.log(`👨‍🌾 Farmers created: ${farmerUsers.length}`.cyan);
    console.log(`🏭 Factories created: ${factoryUsers.length}`.cyan);
    console.log(`👥 HHMs created: ${hhmUsers.length}`.cyan);
    console.log(`👷 Labour users created: ${labourUsers.length}`.cyan);

    // Create sample crop listings with proper farmer references
    if (farmerUsers.length > 0) {
      await createSampleListingsWithValidFarmers(farmerUsers);
    } else {
      console.log('⚠️  No farmers found, skipping crop listing creation'.yellow);
    }

    console.log('\n🎉 Data Successfully Imported!'.green.inverse);
    console.log('📝 Includes: Users + Sample Crop Listings with valid farmer references'.yellow);
    console.log('✅ No orphaned listings created - "Unknown Farmer" issue prevented!'.green);
    process.exit();
  } catch (err) {
    console.error(`❌ Import Error: ${err}`.red.inverse);
    process.exit(1);
  }
};

// Function to destroy all data in the collections
const destroyData = async () => {
  try {
    console.log('🗑  Destroying all data...'.red);
    
    await User.deleteMany();
    await CropListing.deleteMany(); // Also destroy crop listings

    console.log('✅ Data Successfully Destroyed!'.red.inverse);
    console.log('📝 Note: Both users and crop listings have been cleared'.yellow);
    process.exit();
  } catch (err) {
    console.error(`❌ Destroy Error: ${err}`.red.inverse);
    process.exit(1);
  }
};

// Logic to run the correct function based on command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}