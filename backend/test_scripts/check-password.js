const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const User = require('./models/user.model');
    const bcrypt = require('bcryptjs');
    
    const prakash = await User.findOne({ username: 'prakashfarmer' }).select('+password');
    console.log('🔍 Prakash user found:');
    console.log('Username:', prakash.username);
    console.log('Email:', prakash.email);
    console.log('isActive:', prakash.isActive);
    console.log('Has password:', !!prakash.password);
    
    // Test password verification
    const testPasswords = ['password123', '123456', 'prakashfarmer', 'Password123', 'password'];
    
    for (const testPass of testPasswords) {
      const isValid = await bcrypt.compare(testPass, prakash.password);
      console.log(`Password "${testPass}": ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}).catch(console.error);
