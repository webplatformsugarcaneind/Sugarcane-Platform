const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/user.model');

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to MongoDB');

    const farmers = await User.find({ role: 'Farmer' }).select('username email');
    console.log('👨‍🌾 Available Farmers:');
    farmers.forEach(farmer => {
      console.log(`  - ${farmer.username} (${farmer.email})`);
    });
    
    console.log('\n💡 You can login with any of these farmers using password: password123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
};

checkUsers();