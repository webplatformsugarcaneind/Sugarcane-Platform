const mongoose = require('mongoose');
const User = require('./models/user.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sugarcane_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleHHMData = {
  managementExperience: "10 years",
  teamSize: "20-25 workers", 
  managementOperations: "Team coordination, Quality control, Task scheduling, Resource management, Safety supervision",
  servicesOffered: "Labour contracting, Field supervision, Equipment rental, Worker training, Technical consultation"
};

async function updateHHMUsers() {
  try {
    console.log('🔍 Checking HHM users in database...');
    
    // Find all HHM users
    const hhmUsers = await User.find({ role: 'HHM' });
    console.log(`📊 Found ${hhmUsers.length} HHM users`);
    
    for (const user of hhmUsers) {
      console.log(`\n👤 Checking user: ${user.name} (${user.username})`);
      
      let needsUpdate = false;
      const updates = {};
      
      // Check each required field and add if missing or empty
      if (!user.managementExperience || user.managementExperience === '') {
        updates.managementExperience = sampleHHMData.managementExperience;
        needsUpdate = true;
        console.log(`  ➕ Adding managementExperience: ${sampleHHMData.managementExperience}`);
      }
      
      if (!user.teamSize || user.teamSize === '') {
        updates.teamSize = sampleHHMData.teamSize;
        needsUpdate = true;
        console.log(`  ➕ Adding teamSize: ${sampleHHMData.teamSize}`);
      }
      
      if (!user.managementOperations || user.managementOperations === '') {
        updates.managementOperations = sampleHHMData.managementOperations;
        needsUpdate = true;
        console.log(`  ➕ Adding managementOperations: ${sampleHHMData.managementOperations}`);
      }
      
      if (!user.servicesOffered || user.servicesOffered === '') {
        updates.servicesOffered = sampleHHMData.servicesOffered;
        needsUpdate = true;
        console.log(`  ➕ Adding servicesOffered: ${sampleHHMData.servicesOffered}`);
      }
      
      // Update the user if needed
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updates, { new: true });
        console.log(`  ✅ Updated user: ${user.name}`);
      } else {
        console.log(`  ✅ User already has complete data: ${user.name}`);
      }
    }
    
    console.log('\n🎉 HHM user data update completed!');
    
    // Show final state of all HHM users
    console.log('\n📋 Final HHM Users Data:');
    const updatedHHMUsers = await User.find({ role: 'HHM' });
    updatedHHMUsers.forEach(user => {
      console.log(`\n👤 ${user.name} (${user.username}):`);
      console.log(`   📈 Management Experience: ${user.managementExperience || 'NOT SET'}`);
      console.log(`   👥 Team Size: ${user.teamSize || 'NOT SET'}`);
      console.log(`   ⚙️  Management Operations: ${user.managementOperations || 'NOT SET'}`);
      console.log(`   🛠️  Services Offered: ${user.servicesOffered || 'NOT SET'}`);
    });
    
  } catch (error) {
    console.error('💥 Error updating HHM users:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

// Run the update
updateHHMUsers();