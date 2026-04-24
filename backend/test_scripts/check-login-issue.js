const mongoose = require('mongoose');
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');

async function checkDatabaseAndLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/herahermarizon');
    console.log('📡 Connected to database');

    // Check if users exist
    const totalUsers = await User.countDocuments();
    console.log(`👥 Total users in database: ${totalUsers}`);

    if (totalUsers === 0) {
      console.log('❌ No users found in database - this explains the login failure!');
      console.log('🔧 Need to create test users...');
      return;
    }

    // Find the test user
    const testUser = await User.findOne({
      $or: [
        { username: 'ravi_farmer' },
        { email: 'ravi.patel@example.com' }
      ]
    });

    if (!testUser) {
      console.log('❌ Test user "ravi_farmer" not found in database');
      console.log('📋 Available users:');
      const allUsers = await User.find({}).select('name username email role');
      allUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.username}) - ${user.role}`);
      });
    } else {
      console.log('✅ Test user found:');
      console.log(`   Name: ${testUser.name}`);
      console.log(`   Username: ${testUser.username}`);
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Role: ${testUser.role}`);
      
      // Test password verification
      const isValidPassword = await bcrypt.compare('password123', testUser.password);
      console.log(`   Password 'password123' valid: ${isValidPassword ? '✅' : '❌'}`);
      
      if (!isValidPassword) {
        console.log('⚠️  Password verification failed - this could be the issue!');
      }
    }

    // Test login endpoint directly
    console.log('\n🧪 Testing login endpoint...');
    const axios = require('axios');
    
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        username: 'ravi_farmer',
        password: 'password123'
      });
      
      console.log('✅ Login endpoint test successful!');
      console.log('👤 User:', loginResponse.data.user?.name);
      console.log('🔑 Token received:', loginResponse.data.token ? 'Yes' : 'No');
      
    } catch (loginError) {
      console.log('❌ Login endpoint test failed:');
      console.log('   Status:', loginError.response?.status);
      console.log('   Message:', loginError.response?.data?.message || loginError.message);
      console.log('   Full response:', loginError.response?.data);
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkDatabaseAndLogin();