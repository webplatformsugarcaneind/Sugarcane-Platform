const mongoose = require('mongoose');
const User = require('./models/user.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sugarcane_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkAllUsers() {
  try {
    console.log('🔍 Checking all users in database...');
    
    // Find all users
    const allUsers = await User.find({});
    console.log(`📊 Found ${allUsers.length} total users`);
    
    // Group by role
    const roleGroups = {};
    allUsers.forEach(user => {
      const role = user.role || 'undefined';
      if (!roleGroups[role]) {
        roleGroups[role] = [];
      }
      roleGroups[role].push(user);
    });
    
    console.log('\n📋 Users by role:');
    Object.keys(roleGroups).forEach(role => {
      console.log(`\n🎭 Role: ${role} (${roleGroups[role].length} users)`);
      roleGroups[role].forEach(user => {
        console.log(`   👤 ${user.name} (${user.username}) - ${user.email}`);
        
        // Check for HHM-specific fields
        if (role.toLowerCase().includes('hhm') || role.toLowerCase().includes('manager')) {
          console.log(`     📈 Management Experience: ${user.managementExperience || 'NOT SET'}`);
          console.log(`     👥 Team Size: ${user.teamSize || 'NOT SET'}`);
          console.log(`     ⚙️  Management Operations: ${user.managementOperations || 'NOT SET'}`);
          console.log(`     🛠️  Services Offered: ${user.servicesOffered || 'NOT SET'}`);
        }
      });
    });
    
  } catch (error) {
    console.error('💥 Error checking users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

// Run the check
checkAllUsers();
