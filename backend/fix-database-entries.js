const mongoose = require('mongoose');
const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

// MongoDB connection string - you can modify this to match your setup
const MONGODB_URI = 'mongodb://localhost:27017/sugarcane-platform';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n💡 To fix database connection:');
    console.log('1. Make sure MongoDB is running: mongod --dbpath "your-db-path"');
    console.log('2. Or start MongoDB service: net start MongoDB');
    console.log('3. Update MONGODB_URI in this script if needed\n');
    process.exit(1);
  }
};

const checkAndFixDatabase = async () => {
  try {
    await connectDB();
    console.log('\n📋 === DATABASE HEALTH CHECK & FIX ===\n');

    // 1. Check existing farmers
    console.log('1️⃣ Checking existing farmers...');
    const farmers = await User.find({ role: 'Farmer' }, 'name username email location');
    console.log(`   📊 Found ${farmers.length} farmers in database:`);
    
    if (farmers.length === 0) {
      console.log('   ⚠️ No farmers found! Creating sample farmers...');
      await createSampleFarmers();
    } else {
      farmers.forEach((farmer, index) => {
        console.log(`   ${index + 1}. ${farmer.name || 'NO NAME'} (@${farmer.username}) - ${farmer.location || 'No location'}`);
      });
    }

    // 2. Check existing listings
    console.log('\n2️⃣ Checking existing crop listings...');
    const listings = await CropListing.find().populate('farmer_id', 'name username email location');
    console.log(`   📊 Found ${listings.length} listings in database:`);
    
    if (listings.length === 0) {
      console.log('   ⚠️ No listings found! Creating sample listings...');
      await createSampleListings();
    } else {
      let fixedCount = 0;
      for (let i = 0; i < listings.length; i++) {
        const listing = listings[i];
        const farmerName = listing.farmer_id?.name || 'Unknown Farmer';
        console.log(`   ${i + 1}. "${listing.title}" by ${farmerName} - ${listing.quantity_in_tons} tons`);
        
        // Check if farmer_id is valid
        if (!listing.farmer_id || !listing.farmer_id.name) {
          console.log(`      ⚠️ Invalid farmer reference! Attempting to fix...`);
          
          // Try to assign to first available farmer
          const firstFarmer = farmers[0];
          if (firstFarmer) {
            await CropListing.findByIdAndUpdate(listing._id, {
              farmer_id: firstFarmer._id
            });
            console.log(`      ✅ Fixed: Assigned to farmer ${firstFarmer.name}`);
            fixedCount++;
          }
        }
      }
      
      if (fixedCount > 0) {
        console.log(`   🔧 Fixed ${fixedCount} listings with invalid farmer references`);
      }
    }

    // 3. Test marketplace API endpoint
    console.log('\n3️⃣ Testing marketplace data fetch...');
    const marketplaceListings = await CropListing.find({ status: 'active' })
      .populate('farmer_id', 'name username email location phone')
      .sort({ createdAt: -1 });
    
    console.log(`   📊 Marketplace API would return ${marketplaceListings.length} active listings:`);
    marketplaceListings.forEach((listing, index) => {
      const farmer = listing.farmer_id;
      console.log(`   ${index + 1}. "${listing.title}" by ${farmer?.name || 'Unknown'} (${farmer?.username || 'no-username'})`);
    });

    // 4. Summary and recommendations
    console.log('\n📈 === SUMMARY & RECOMMENDATIONS ===');
    console.log(`✅ Farmers in database: ${farmers.length}`);
    console.log(`✅ Total listings: ${listings.length}`);
    console.log(`✅ Active marketplace listings: ${marketplaceListings.length}`);
    
    if (farmers.length > 0 && marketplaceListings.length > 0) {
      console.log('\n🎉 Database looks good! Frontend should display:');
      console.log('   - Farmer names instead of "Unknown Farmer"');
      console.log('   - View Profile buttons working');
      console.log('   - Contact seller functionality');
      
      console.log('\n🔗 Next steps:');
      console.log('   1. Make sure backend server is running on port 5000');
      console.log('   2. Make sure frontend is running on port 5174');
      console.log('   3. Check browser console for any JavaScript errors');
    } else {
      console.log('\n⚠️ Issues found - creating sample data...');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
};

const createSampleFarmers = async () => {
  const sampleFarmers = [
    {
      username: 'raghav_farmer',
      name: 'Raghav Patel',
      email: 'raghav.patel@farmer.com',
      phone: '+91 98765 43210',
      location: 'Pune, Maharashtra',
      role: 'Farmer',
      password: '$2b$12$hashedpassword', // This should be properly hashed in real scenario
      isActive: true
    },
    {
      username: 'priya_agriculture',
      name: 'Priya Sharma',
      email: 'priya.sharma@agriculture.com',
      phone: '+91 87654 32109',
      location: 'Nashik, Maharashtra',
      role: 'Farmer',
      password: '$2b$12$hashedpassword',
      isActive: true
    },
    {
      username: 'kumar_sugarcane',
      name: 'Kumar Singh',
      email: 'kumar.singh@sugarcane.com',
      phone: '+91 76543 21098',
      location: 'Kolhapur, Maharashtra',
      role: 'Farmer',
      password: '$2b$12$hashedpassword',
      isActive: true
    }
  ];

  console.log('   🌱 Creating sample farmers...');
  const createdFarmers = await User.insertMany(sampleFarmers);
  console.log(`   ✅ Created ${createdFarmers.length} sample farmers`);
  return createdFarmers;
};

const createSampleListings = async () => {
  // Get available farmers
  const farmers = await User.find({ role: 'Farmer' }).limit(3);
  
  if (farmers.length === 0) {
    console.log('   ❌ No farmers available to create listings');
    return;
  }

  const sampleListings = [
    {
      farmer_id: farmers[0]._id,
      title: 'Premium Sugarcane - Co 86032 Variety',
      crop_variety: 'Co 86032',
      quantity_in_tons: 15.5,
      expected_price_per_ton: 3200,
      harvest_availability_date: new Date('2025-12-15'),
      location: 'Pune, Maharashtra',
      description: 'High-quality sugarcane with excellent sugar content. Grown with organic farming methods.',
      status: 'active'
    },
    {
      farmer_id: farmers[1]._id,
      title: 'Fresh Harvest Sugarcane - Co 238',
      crop_variety: 'Co 238',
      quantity_in_tons: 22.0,
      expected_price_per_ton: 2950,
      harvest_availability_date: new Date('2025-11-25'),
      location: 'Nashik, Maharashtra',
      description: 'Recently harvested premium sugarcane ready for immediate delivery.',
      status: 'active'
    },
    {
      farmer_id: farmers[2]._id,
      title: 'Bulk Sugarcane Supply - Co 62175',
      crop_variety: 'Co 62175',
      quantity_in_tons: 45.0,
      expected_price_per_ton: 3100,
      harvest_availability_date: new Date('2025-12-01'),
      location: 'Kolhapur, Maharashtra',
      description: 'Large quantity available for bulk buyers. Excellent for sugar mills.',
      status: 'active'
    }
  ];

  if (farmers.length >= 2) {
    sampleListings.push({
      farmer_id: farmers[1]._id,
      title: 'Organic Sugarcane - Co 0233',
      crop_variety: 'Co 0233',
      quantity_in_tons: 18.5,
      expected_price_per_ton: 3350,
      harvest_availability_date: new Date('2025-12-10'),
      location: 'Nashik, Maharashtra',
      description: 'Certified organic sugarcane with premium quality and high yield.',
      status: 'active'
    });
  }

  console.log('   🌾 Creating sample listings...');
  const createdListings = await CropListing.insertMany(sampleListings);
  console.log(`   ✅ Created ${createdListings.length} sample listings`);
  return createdListings;
};

// Run the check
checkAndFixDatabase();