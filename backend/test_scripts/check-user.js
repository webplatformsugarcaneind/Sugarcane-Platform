const mongoose = require('mongoose');
const User = require('./models/user.model');

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sugarcane');
    console.log('Connected to MongoDB');

    // Find test farmer with all fields
    const testFarmer = await User.findOne({ email: 'testfarmer@example.com' }).select('+password');
    
    if (testFarmer) {
      console.log('User details:', {
        id: testFarmer._id,
        username: testFarmer.username,
        email: testFarmer.email,
        role: testFarmer.role,
        isActive: testFarmer.isActive,
        passwordExists: !!testFarmer.password,
        passwordLength: testFarmer.password?.length
      });
    } else {
      console.log('❌ Test farmer not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

checkUser();
