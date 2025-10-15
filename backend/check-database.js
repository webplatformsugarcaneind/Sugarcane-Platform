const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking database for factory users...');
    
    // Find all factory users
    const factoryUsers = await User.find({ role: 'Factory' });
    
    console.log(`📊 Found ${factoryUsers.length} factory users:`);
    
    factoryUsers.forEach((user, index) => {
      console.log(`\n👨‍💼 Factory User ${index + 1}:`);
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Username:', user.username);
      console.log('Email:', user.email);
      console.log('Factory Name:', user.factoryName);
      console.log('Factory Location:', user.factoryLocation);
      console.log('Capacity:', user.capacity);
      console.log('Experience:', user.experience);
      console.log('Specialization:', user.specialization);
      console.log('Contact Info:', user.contactInfo);
      console.log('Operating Hours:', user.operatingHours);
    });
    
    // Check specifically for priyafactory
    const priyaUser = await User.findOne({ username: 'priyafactory' });
    if (priyaUser) {
      console.log('\n🎯 Priya Factory User Details:');
      console.log('Full object:', JSON.stringify(priyaUser, null, 2));
    } else {
      console.log('\n❌ Priya factory user not found');
    }
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabaseData();