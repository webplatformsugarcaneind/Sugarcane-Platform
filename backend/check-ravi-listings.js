const mongoose = require('mongoose');
const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

require('dotenv').config();

async function checkRaviListings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
    console.log('Connected to MongoDB');

    // Find Ravi Patel user
    const raviUser = await User.findOne({ name: 'Ravi Patel' });
    
    if (!raviUser) {
      console.log('❌ Ravi Patel user not found');
      return;
    }

    console.log('✅ Ravi Patel user found:');
    console.log('- User ID:', raviUser._id);
    console.log('- Username:', raviUser.username);
    console.log('- Email:', raviUser.email);
    console.log('- Role:', raviUser.role);

    // Find all listings for Ravi
    const raviListings = await CropListing.find({ farmer_id: raviUser._id });
    
    console.log(`\n📋 Ravi's Listings (${raviListings.length} found):`);
    raviListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title}`);
      console.log(`   - ID: ${listing._id}`);
      console.log(`   - Status: ${listing.status}`);
      console.log(`   - Farmer ID: ${listing.farmer_id}`);
      console.log('');
    });

    // Check if there are any listings with different farmer_id formats
    const allListings = await CropListing.find({}).populate('farmer_id');
    console.log(`\n📊 Total listings in database: ${allListings.length}`);
    
    const raviListingsByName = allListings.filter(listing => 
      listing.farmer_id && listing.farmer_id.name === 'Ravi Patel'
    );
    
    console.log(`\n🔍 Listings associated with Ravi Patel by name: ${raviListingsByName.length}`);
    raviListingsByName.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title} - Farmer ID: ${listing.farmer_id._id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkRaviListings();