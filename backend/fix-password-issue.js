const mongoose = require('mongoose');
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');

async function checkUserPassword() {
  try {
    await mongoose.connect('mongodb://localhost:27017/herahermarizon');
    console.log('📡 Connected to database');

    // Find the test user with password field
    const testUser = await User.findOne({ username: 'ravi_farmer' });

    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('✅ Test user found:');
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Role: ${testUser.role}`);
    console.log(`   Password field exists: ${testUser.password ? 'Yes' : 'No'}`);
    console.log(`   Password field type: ${typeof testUser.password}`);
    console.log(`   Password field length: ${testUser.password ? testUser.password.length : 0}`);
    
    if (testUser.password) {
      console.log(`   Password starts with: ${testUser.password.substring(0, 10)}...`);
      
      // Test password comparison
      try {
        const isValid = await bcrypt.compare('password123', testUser.password);
        console.log(`   Password verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      } catch (bcryptError) {
        console.error('❌ Bcrypt comparison error:', bcryptError.message);
        
        // Try recreating the password hash
        console.log('🔧 Attempting to fix password...');
        const newPasswordHash = await bcrypt.hash('password123', 12);
        testUser.password = newPasswordHash;
        await testUser.save();
        console.log('✅ Password updated with new hash');
      }
    } else {
      console.log('🔧 Password field is missing - creating new password...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      testUser.password = hashedPassword;
      await testUser.save();
      console.log('✅ Password created and saved');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkUserPassword();