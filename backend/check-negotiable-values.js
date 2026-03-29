const mongoose = require('mongoose');
const CropListing = require('./models/cropListing.model');
require('dotenv').config();

/**
 * Script to check negotiable price values in the database
 * This helps debug why "(Negotiable)" is showing when it shouldn't
 */

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-ecosystem')
.then(async () => {
  console.log('🔍 Connected to MongoDB - Checking negotiable price values...\n');
  
  try {
    // Get all listings with price_details
    const listings = await CropListing.find({}).select('_id title price_details').lean();
    
    console.log(`📋 Found ${listings.length} listings. Analyzing price_details...\n`);
    
    listings.forEach((listing, index) => {
      console.log(`${index + 1}. "${listing.title}" (${listing._id})`);
     
      if (listing.price_details) {
        console.log('   price_details:', JSON.stringify(listing.price_details, null, 2));
        
        // Check all possible negotiable properties
        const negotiableProps = [
          'price_negotiable',
          'negotiable', 
          'is_negotiable',
          'priceNegotiable'
        ];
        
        negotiableProps.forEach(prop => {
          if (listing.price_details.hasOwnProperty(prop)) {
            const value = listing.price_details[prop];
            console.log(`   • ${prop}: ${JSON.stringify(value)} (type: ${typeof value})`);
            
            // Test the condition used in frontend
            const isTrue = value === true;
            console.log(`   • ${prop} === true: ${isTrue}`);
          }
        });
      } else {
        console.log('   price_details: null/undefined');
      }
      
      console.log('');
    });
    
    // Update any string values to proper booleans
    console.log('🔧 Checking for string boolean values that need fixing...');
    
    const stringBooleanListings = await CropListing.find({
      $or: [
        { 'price_details.price_negotiable': 'true' },
        { 'price_details.price_negotiable': 'false' },
        { 'price_details.negotiable': 'true' },
        { 'price_details.negotiable': 'false' },
        { 'price_details.is_negotiable': 'true' },
        { 'price_details.is_negotiable': 'false' }
      ]
    });
    
    if (stringBooleanListings.length > 0) {
      console.log(`⚠️  Found ${stringBooleanListings.length} listings with string boolean values:`);
      
      stringBooleanListings.forEach(listing => {
        console.log(`   • "${listing.title}": ${JSON.stringify(listing.price_details)}`);
      });
      
      console.log('\n🛠️  Would you like to fix these? (Run fix-boolean-values.js)');
    } else {
      console.log('✅ No string boolean values found');
    }
    
    console.log('\n🏁 Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
})
.catch(err => {
  console.error('❌ Database connection error:', err);
  process.exit(1);
});