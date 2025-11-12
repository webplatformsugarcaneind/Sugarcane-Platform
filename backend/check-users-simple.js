const mongoose = require('mongoose');
const User = require('./models/user.model');

const checkUsers = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/sugarcane-platform');
    
    console.log('🔍 Checking all users...');
    const allUsers = await User.find({}).limit(10);
    console.log(`Found ${allUsers.length} total users:`);
    allUsers.forEach(u => {
      console.log(`Username: ${u.username}, Email: ${u.email}, Role: ${u.role}`);
    });
    
    console.log('\n🔍 Checking farmer users...');
    const farmers = await User.find({ role: 'Farmer' }).limit(5);
    console.log(`Found ${farmers.length} farmers with role 'Farmer'`);
    
    const farmersLower = await User.find({ role: 'farmer' }).limit(5);
    console.log(`Found ${farmersLower.length} farmers with role 'farmer'`);
    
    console.log('\n🔍 Checking HHM users...');
    const hhms = await User.find({ role: 'HHM' }).limit(5);
    console.log(`Found ${hhms.length} HHMs with role 'HHM'`);
    
    const hhmsLower = await User.find({ role: 'hhm' }).limit(5);
    console.log(`Found ${hhmsLower.length} HHMs with role 'hhm'`);
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();