const mongoose = require('mongoose');
const User = require('./models/user.model');

async function checkUserFields() {
  try {
    await mongoose.connect('mongodb://localhost:27017/herahermarizon');
    console.log('📡 Connected to database');

    // Find the test user
    const testUser = await User.findOne({ username: 'ravi_farmer' });

    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('✅ Complete user record:');
    console.log('   _id:', testUser._id);
    console.log('   name:', testUser.name);
    console.log('   username:', testUser.username);
    console.log('   email:', testUser.email);
    console.log('   phone:', testUser.phone);
    console.log('   role:', testUser.role);
    console.log('   isActive:', testUser.isActive);
    console.log('   password exists:', !!testUser.password);
    console.log('   createdAt:', testUser.createdAt);
    console.log('   updatedAt:', testUser.updatedAt);

    // Check if isActive field is missing and set it
    if (testUser.isActive === undefined || testUser.isActive === null) {
      console.log('🔧 Setting isActive to true...');
      testUser.isActive = true;
      await testUser.save();
      console.log('✅ User updated with isActive: true');
    }

    // Also check for other required fields that might be missing
    const requiredFields = ['name', 'username', 'email', 'phone', 'role', 'password'];
    const missingFields = requiredFields.filter(field => !testUser[field]);
    
    if (missingFields.length > 0) {
      console.log('⚠️  Missing required fields:', missingFields);
    } else {
      console.log('✅ All required fields are present');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkUserFields();