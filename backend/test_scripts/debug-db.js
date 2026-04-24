const mongoose = require('mongoose');
const CropListing = require('./models/cropListing.model');
const User = require('./models/user.model');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('🔗 Connected to MongoDB');
  
  const farmers = await User.find({ role: 'Farmer' });
  console.log('👨‍🌾 Farmers found:', farmers.length);
  farmers.forEach(f => console.log('  -', f.name, '(' + f.email + ')'));
  
  const listings = await CropListing.find().populate('farmer_id', 'name email');
  console.log('📋 Listings found:', listings.length);
  listings.forEach((l, i) => {
    console.log(`  ${i+1}. ${l.title}`);
    console.log(`     Farmer ID: ${l.farmer_id?._id || 'NULL'}`);
    console.log(`     Farmer Name: ${l.farmer_id?.name || 'NO NAME'}`);
    console.log(`     Unit: ${l.quantity_available?.unit || 'NO UNIT'}`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});