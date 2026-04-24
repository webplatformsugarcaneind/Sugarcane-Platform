require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

async function testQuantityUpdate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB - Testing quantity update...\n');

    // Find a farmer with active listings
    const farmer = await User.findOne({ 
      role: 'Farmer',
      'listings.0': { $exists: true } 
    });

    if (!farmer) {
      console.log('❌ No farmer with listings found');
      return;
    }

    console.log(`👤 Testing with farmer: ${farmer.name}`);
    console.log(`📋 Farmer has ${farmer.listings.length} listings in User.listings`);

    // Also check CropListing collection
    const cropListings = await CropListing.find({ farmer_id: farmer._id });
    console.log(`📋 Farmer has ${cropListings.length} listings in CropListing collection\n`);

    // Display current quantities
    console.log('📊 Current quantities:');
    farmer.listings.forEach((listing, i) => {
      const quantity = listing.quantity_available?.value || listing.quantity_in_tons || 0;
      console.log(`  ${i+1}. "${listing.title}": ${quantity} tons (${listing.quantity_available ? 'quantity_available' : 'quantity_in_tons'})`);
    });

    cropListings.forEach((listing, i) => {
      const quantity = listing.quantity_available?.value || listing.quantity_in_tons || 0;
      console.log(`  CropListing ${i+1}. "${listing.title}": ${quantity} tons`);
    });

    // Simulate creating an order
    if (farmer.listings.length > 0) {
      const testListing = farmer.listings[0];
      const originalQuantity = testListing.quantity_available?.value || testListing.quantity_in_tons || 0;
      
      if (originalQuantity > 5) {
        console.log(`\n🧪 Simulating order for 5 tons from listing "${testListing.title}"`);
        console.log(`📦 Original quantity: ${originalQuantity} tons`);
        
        const newQuantity = originalQuantity - 5;
        
        // Update embedded listing
        testListing.quantity_in_tons = newQuantity;
        if (testListing.quantity_available) {
          testListing.quantity_available.value = newQuantity;
        }

        await farmer.save();
        console.log(`✅ Updated embedded listing quantity to ${newQuantity} tons`);
        
        // Update CropListing collection if it exists
        const cropListing = await CropListing.findById(testListing._id);
        if (cropListing) {
          const updateFields = { 
            quantity_in_tons: newQuantity 
          };
          
          if (cropListing.quantity_available) {
            updateFields['quantity_available.value'] = newQuantity;
          }
          
          await CropListing.findByIdAndUpdate(testListing._id, updateFields);
          console.log(`✅ Updated CropListing collection quantity to ${newQuantity} tons`);
          
          // Verify update
          const updatedListing = await CropListing.findById(testListing._id);
          const finalQuantity = updatedListing.quantity_available?.value || updatedListing.quantity_in_tons || 0;
          console.log(`🔍 Verification: Final quantity is ${finalQuantity} tons`);
        }
        
        console.log(`\n📈 Order simulation complete! Quantity reduced from ${originalQuantity} to ${newQuantity} tons`);
      } else {
        console.log(`\n⚠️  Cannot test - listing has only ${originalQuantity} tons (need at least 5 for test)`);
      }
    }

    console.log('\n🏁 Test completed!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testQuantityUpdate();