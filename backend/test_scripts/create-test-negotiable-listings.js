require('dotenv').config();
const mongoose = require('mongoose');
const CropListing = require('./models/cropListing.model');
const User = require('./models/user.model');

async function createTestListing() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB - Creating test listing...\n');

    // Find a farmer to assign the listing to
    const farmer = await User.findOne({ role: 'Farmer' });
    
    if (!farmer) {
      console.log('❌ No farmer found in database');
      return;
    }

    // Create a listing with proper price_per_unit and negotiable=false
    const newListing = new CropListing({
      farmer_id: farmer._id,
      title: 'Test Fixed Price Sugarcane',
      sugarcane_variety: 'Co 0238',
      status: 'active',
      seed_type: '3-Bud Setts',
      crop_age: 8,
      germination_percentage: 85,
      quantity_in_tons: 30,
      delivery_location: 'Pune, Maharashtra',
      location: 'Pune',
      harvest_availability_date: new Date(Date.now() + (15 * 24 * 60 * 60 * 1000)), // 15 days from now
      price_details: {
        price_per_unit: 2500, // Proper price that should be used
        price_negotiable: false, // Should NOT show (Negotiable)
        minimum_order_quantity: 8
      },
      quantity_available: {
        value: 30,
        unit: 'gunthas'
      }
    });

    await newListing.save();
    console.log('✅ Created test listing with fixed price (should NOT show negotiable)');
    
    // Also create one more listing with negotiable=true for comparison
    const negotiableListing = new CropListing({
      farmer_id: farmer._id,
      title: 'Test Negotiable Price Sugarcane',
      sugarcane_variety: 'Co 62175',
      status: 'active',
      seed_type: '2-Bud Setts',
      crop_age: 10,
      germination_percentage: 90,
      quantity_in_tons: 40,
      delivery_location: 'Mumbai, Maharashtra',
      location: 'Mumbai',
      harvest_availability_date: new Date(Date.now() + (10 * 24 * 60 * 60 * 1000)), // 10 days from now
      price_details: {
        price_per_unit: 3000, // Proper price that should be used
        price_negotiable: true, // SHOULD show (Negotiable)
        minimum_order_quantity: 15
      },
      quantity_available: {
        value: 40,
        unit: 'gunthas'
      }
    });

    await negotiableListing.save();
    console.log('✅ Created test listing with negotiable price (should show negotiable)');

    console.log('\n🎯 Now we have both test cases:');
    console.log('  📦 Test Fixed Price Sugarcane - should NOT show (Negotiable)');
    console.log('  📦 Test Negotiable Price Sugarcane - should show (Negotiable)');
    console.log('\n💡 Visit the marketplace to see the difference!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestListing();