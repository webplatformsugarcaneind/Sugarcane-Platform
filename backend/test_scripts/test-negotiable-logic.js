require('dotenv').config();
const mongoose = require('mongoose');
const CropListing = require('./models/cropListing.model');

async function testNegotiableLogic() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB - Testing negotiable logic...\n');

    // Get all listings (without population to avoid schema errors)
    const listings = await CropListing.find();

    console.log(`📋 Testing ${listings.length} listings...\n`);

    for (const listing of listings) {
      const basePricePerTon = listing.price_details?.base_price_per_ton;
      const pricePerUnit = listing.price_details?.price_per_unit;
      const expectedPricePerTon = listing.expected_price_per_ton;
      
      // Determine actual price source (same logic as frontend)
      let actualPrice = 0;
      let priceSource = 'none';
      
      if (basePricePerTon && basePricePerTon > 0) {
        actualPrice = basePricePerTon;
        priceSource = 'base_price_per_ton';
      } else if (pricePerUnit && pricePerUnit > 0) {
        actualPrice = pricePerUnit;
        priceSource = 'price_per_unit';
      } else if (expectedPricePerTon && expectedPricePerTon > 0) {
        actualPrice = expectedPricePerTon;
        priceSource = 'expected_price_per_ton';
      }

      // Check if should show negotiable (same logic as frontend)
      const shouldShowNegotiable = (priceSource === 'base_price_per_ton' || priceSource === 'price_per_unit') &&
                                  (listing.price_details?.price_negotiable === true ||
                                   listing.price_details?.negotiable === true ||
                                   listing.price_details?.is_negotiable === true);

      console.log(`📦 "${listing.title}" (${listing.farmer_id || 'No farmer ID'})`);
      console.log(`   💰 Price: ₹${actualPrice}/ton (from ${priceSource})`);
      console.log(`   🔍 Price sources:`, {
        base_price_per_ton: basePricePerTon,
        price_per_unit: pricePerUnit,
        expected_price_per_ton: expectedPricePerTon
      });
      console.log(`   🏷️  Negotiable flags:`, {
        price_negotiable: listing.price_details?.price_negotiable,
        negotiable: listing.price_details?.negotiable,
        is_negotiable: listing.price_details?.is_negotiable
      });
      console.log(`   ✅ Should show "(Negotiable)": ${shouldShowNegotiable ? 'YES' : 'NO'}`);
      console.log('   ---');
    }

    console.log('\n🏁 Test completed!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testNegotiableLogic();