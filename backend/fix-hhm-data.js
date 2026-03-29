const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

// Connect to MongoDB using the environment variable
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleHHMData = {
  managementExperience: "10 years",
  teamSize: "20-25 workers", 
  managementOperations: "Team coordination, Quality control, Task scheduling, Resource management, Safety supervision",
  servicesOffered: "Labour contracting, Field supervision, Equipment rental, Worker training, Technical consultation"
};

async function checkAndUpdateHHMUsers() {
  try {
    console.log('🔍 Checking all users in database...');
    
    // Find all users first
    const allUsers = await User.find({});
    console.log(`📊 Found ${allUsers.length} total users`);
    
    if (allUsers.length === 0) {
      console.log('⚠️  No users found in database. Running seeder first...');
      return;
    }
    
    // Show all roles
    const roles = [...new Set(allUsers.map(u => u.role))];
    console.log('🎭 Available roles:', roles);
    
    // Find HHM users (try different variations)
    const hhmUsers = await User.find({ 
      $or: [
        { role: 'HHM' },
        { role: 'hhm' },
        { role: 'Human Resource Manager' },
        { role: 'Manager' }
      ]
    });
    
    console.log(`👨‍💼 Found ${hhmUsers.length} HHM users`);
    
    if (hhmUsers.length === 0) {
      console.log('📝 No HHM users found. Creating sample HHM users...');
      
      // Create sample HHM users with complete data
      const sampleHHMUsers = [
        {
          name: "Sunita Sharma",
          username: "sunitahhm",
          phone: "9876543211",
          email: "sunita.sharma@example.com",
          role: "HHM",
          password: "123456",
          managementExperience: "8 years",
          teamSize: "15-20 workers",
          managementOperations: "Worker coordination, Task scheduling, Quality control, Safety supervision",
          servicesOffered: "Labour contracting, Equipment rental, Field supervision, Training services"
        },
        {
          name: "Vikram Singh",
          username: "vikramhhm",
          phone: "9876543214",
          email: "vikram.singh@example.com",
          role: "HHM",
          password: "123456",
          managementExperience: "12 years",
          teamSize: "25-30 workers",
          managementOperations: "Large scale operations, Multi-field coordination, Machinery management, Budget planning",
          servicesOffered: "Complete farm management, Mechanized harvesting, Worker training, Technical consultation"
        },
        {
          name: "Sunil Kumar",
          username: "sunilhhm",
          phone: "9876543219",
          email: "sunil.kumar@example.com",
          role: "HHM",
          password: "123456",
          managementExperience: "15 years",
          teamSize: "30-35 workers",
          managementOperations: "Strategic planning, Multi-farm coordination, Technology integration, Performance monitoring",
          servicesOffered: "Enterprise farm management, Advanced mechanization, Leadership training, Business consultation"
        }
      ];
      
      for (const userData of sampleHHMUsers) {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`✅ Created HHM user: ${userData.name} (${userData.username})`);
      }
    } else {
      // Update existing HHM users
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
    }
    
    console.log('\n🎉 HHM user data update completed!');
    
    // Show final state of all HHM users
    console.log('\n📋 Final HHM Users Data:');
    const finalHHMUsers = await User.find({ role: 'HHM' });
    finalHHMUsers.forEach(user => {
      console.log(`\n👤 ${user.name} (${user.username}):`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📞 Phone: ${user.phone}`);
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
checkAndUpdateHHMUsers();
