const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');

async function resetFarmerPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sugarcane');
    console.log('Connected to MongoDB');

    // Find test farmer
    const testFarmer = await User.findOne({ email: 'testfarmer@example.com' });
    
    if (testFarmer) {
      console.log('Found farmer:', testFarmer.name);
      
      // Hash new password
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      // Update password directly
      await User.findByIdAndUpdate(testFarmer._id, {
        password: hashedPassword
      });
      
      console.log('✅ Password reset successfully');
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

resetFarmerPassword();
