const mongoose = require('mongoose');
const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

// MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/sugarcane-platform';

const fixFarmerNames = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check current farmer data
    console.log('\n📋 Current farmer data:');
    const farmers = await User.find({ role: 'Farmer' });
    farmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ID: ${farmer._id}`);
      console.log(`   Username: ${farmer.username}`);
      console.log(`   Name: ${farmer.name || 'NO NAME'}`);
      console.log(`   Email: ${farmer.email}`);
      console.log('   ---');
    });

    // Fix farmers without proper names
    console.log('\n🔧 Fixing farmer names...');
    const updates = [];

    // Update farmers with proper names based on their usernames
    const farmerUpdates = [
      { username: 'ravifarmer', name: 'Ravi Patel', phone: '+91 98765 43210' },
      { username: 'prakashfarmer', name: 'Prakash Joshi', phone: '+91 87654 32109', location: 'Pune, Maharashtra' },
      { username: 'testframer', name: 'Test Farmer', phone: '+91 76543 21098' }
    ];

    for (const update of farmerUpdates) {
      const result = await User.updateOne(
        { username: update.username, role: 'Farmer' },
        { 
          $set: { 
            name: update.name,
            phone: update.phone,
            ...(update.location && { location: update.location })
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated farmer ${update.username} -> ${update.name}`);
        updates.push(update.username);
      } else {
        console.log(`⚠️ No updates made for ${update.username}`);
      }
    }

    // Verify the updates
    console.log('\n📊 Updated farmer data:');
    const updatedFarmers = await User.find({ role: 'Farmer' });
    updatedFarmers.forEach((farmer, index) => {
      console.log(`${index + 1}. ${farmer.name} (@${farmer.username})`);
      console.log(`   Email: ${farmer.email}`);
      console.log(`   Phone: ${farmer.phone || 'Not set'}`);
      console.log(`   Location: ${farmer.location || 'Not set'}`);
      console.log('   ---');
    });

    // Test marketplace query with population
    console.log('\n🧪 Testing marketplace query with population...');
    const marketplaceTest = await CropListing.find({ status: 'active' })
      .populate('farmer_id', 'name username email phone location')
      .limit(3);
    
    console.log('📋 Sample populated listings:');
    marketplaceTest.forEach((listing, index) => {
      const farmer = listing.farmer_id;
      console.log(`${index + 1}. "${listing.title}"`);
      console.log(`   Farmer Object: ${farmer ? 'Found' : 'NOT FOUND'}`);
      if (farmer) {
        console.log(`   Name: ${farmer.name || 'NO NAME'}`);
        console.log(`   Username: ${farmer.username}`);
        console.log(`   Email: ${farmer.email}`);
      }
      console.log('   ---');
    });

    console.log('\n🎉 Farmer name fix completed!');
    console.log(`📊 Updated ${updates.length} farmer names`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
};

fixFarmerNames();