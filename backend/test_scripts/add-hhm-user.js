const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addAdditionalHHMUser() {
  try {
    console.log('🔍 Adding additional HHM user with rich sample data...');
    
    // Check if user already exists
    const existingUser = await User.findOne({ username: 'sunilhhm' });
    
    if (existingUser) {
      console.log('👤 User sunilhhm already exists, updating with complete data...');
      
      const updatedUser = await User.findByIdAndUpdate(existingUser._id, {
        managementExperience: "15 years",
        teamSize: "30-35 workers",
        managementOperations: "Strategic planning, Multi-farm coordination, Technology integration, Performance monitoring, Budget management",
        servicesOffered: "Enterprise farm management, Advanced mechanization, Leadership training, Business consultation, Technology advisory"
      }, { new: true });
      
      console.log('✅ Updated existing user with complete data');
      
    } else {
      console.log('👤 Creating new HHM user: Sunil Kumar...');
      
      const newHHMUser = new User({
        name: "Sunil Kumar",
        username: "sunilhhm",
        phone: "9876543219",
        email: "sunil.kumar@example.com",
        role: "HHM",
        password: "123456",
        managementExperience: "15 years",
        teamSize: "30-35 workers",
        managementOperations: "Strategic planning, Multi-farm coordination, Technology integration, Performance monitoring, Budget management",
        servicesOffered: "Enterprise farm management, Advanced mechanization, Leadership training, Business consultation, Technology advisory"
      });
      
      await newHHMUser.save();
      console.log('✅ Created new HHM user: Sunil Kumar');
    }
    
    // Show all HHM users
    console.log('\n📋 All HHM Users in Database:');
    const allHHMUsers = await User.find({ role: 'HHM' });
    
    allHHMUsers.forEach((user, index) => {
      console.log(`\n🏅 HHM User ${index + 1}: ${user.name} (${user.username})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📞 Phone: ${user.phone}`);
      console.log(`   📈 Management Experience: ${user.managementExperience}`);
      console.log(`   👥 Team Size: ${user.teamSize}`);
      console.log(`   ⚙️  Management Operations: ${user.managementOperations}`);
      console.log(`   🛠️  Services Offered: ${user.servicesOffered}`);
    });
    
    console.log(`\n🎉 Database now contains ${allHHMUsers.length} HHM users with complete data!`);
    
  } catch (error) {
    console.error('💥 Error adding HHM user:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

// Run the script
addAdditionalHHMUser();
