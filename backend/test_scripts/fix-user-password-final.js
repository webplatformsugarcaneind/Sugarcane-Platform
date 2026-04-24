const mongoose = require('mongoose');
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');

async function fixUserPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/herahermarizon');
    console.log('📡 Connected to database');

    // Find the test user
    const testUser = await User.findOne({ username: 'ravi_farmer' });

    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('🔧 Fixing password for user:', testUser.name);

    // Create new password hash
    const hashedPassword = await bcrypt.hash('password123', 12);
    console.log('🔐 New password hash created');

    // Update the user directly in the database
    const updateResult = await User.findByIdAndUpdate(
      testUser._id,
      { 
        password: hashedPassword,
        isActive: true,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log('✅ User updated successfully');
    console.log('   Password field exists:', !!updateResult.password);
    console.log('   IsActive:', updateResult.isActive);

    // Verify the password works
    const passwordValid = await bcrypt.compare('password123', updateResult.password);
    console.log('   Password verification:', passwordValid ? '✅ Valid' : '❌ Invalid');

    // Test login immediately
    console.log('\n🧪 Testing login...');
    const axios = require('axios');
    
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        identifier: 'ravi_farmer',
        password: 'password123'
      });
      
      console.log('🎉 LOGIN SUCCESS!');
      console.log('👤 User:', loginResponse.data.user.name);
      console.log('🔑 Token received');
      
    } catch (loginError) {
      console.log('❌ Login still failing:');
      console.log('   Status:', loginError.response?.status);
      console.log('   Message:', loginError.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

fixUserPassword();