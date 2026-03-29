const mongoose = require('mongoose');
const CropListing = require('./models/cropListing.model');
const User = require('./models/user.model');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('🔗 Connected to MongoDB');
  
  // Check all users and their roles
  const allUsers = await User.find({});
  console.log('👥 All users found:');
  allUsers.forEach(u => console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`));
  
  // Check farmers specifically
  const farmers = await User.find({ role: 'Farmer' });
  console.log('\n👨‍🌾 Farmers with role "Farmer":', farmers.length);
  
  // Check listings without population
  const listingsRaw = await CropListing.find({});
  console.log('\n📋 Raw Listings:');
  listingsRaw.forEach((l, i) => {
    console.log(`  ${i+1}. ${l.title}`);
    console.log(`     farmer_id: ${l.farmer_id} (${typeof l.farmer_id})`);
  });
  
  // Check listings with population attempt
  console.log('\n🔍 Trying to populate farmer_id...');
  const listingsPopulated = await CropListing.find({}).populate('farmer_id', 'name email role');
  listingsPopulated.forEach((l, i) => {
    console.log(`  ${i+1}. ${l.title}`);
    console.log(`     farmer_id populated: ${l.farmer_id ? 'YES' : 'NO'}`);
    if (l.farmer_id) {
      console.log(`     farmer name: ${l.farmer_id.name}`);
      console.log(`     farmer role: ${l.farmer_id.role}`);
    }
  });
  
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});