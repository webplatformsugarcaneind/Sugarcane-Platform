const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

// Load environment variables
dotenv.config();

const testDataIntegrity = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Get all users
    const users = await User.find();
    console.log(`📊 Total users in database: ${users.length}\n`);

    // Test each role separately
    const roles = ['Farmer', 'HHM', 'Factory', 'Labour'];
    
    for (const role of roles) {
      console.log(`\n🔍 Testing ${role} users:`);
      console.log('═'.repeat(50));
      
      const roleUsers = users.filter(user => user.role === role);
      console.log(`Count: ${roleUsers.length}`);
      
      if (roleUsers.length > 0) {
        // Test first user of this role in detail
        const testUser = roleUsers[0];
        console.log(`\n📋 Detailed data for: ${testUser.name} (${testUser.username})`);
        console.log('─'.repeat(40));
        
        // Common fields for all users
        console.log(`✓ Name: ${testUser.name}`);
        console.log(`✓ Username: ${testUser.username}`);
        console.log(`✓ Email: ${testUser.email}`);
        console.log(`✓ Phone: ${testUser.phone}`);
        console.log(`✓ Role: ${testUser.role}`);
        console.log(`✓ Active: ${testUser.isActive}`);
        console.log(`✓ Created: ${testUser.createdAt}`);
        console.log(`✓ Password Hash: ${testUser.password ? 'Present' : 'Missing'}`);
        
        // Role-specific fields
        if (role === 'Farmer') {
          console.log('\n🌾 Farmer-specific fields:');
          console.log(`✓ Location: ${testUser.location || 'Not set'}`);
          console.log(`✓ Farm Size: ${testUser.farmSize || 'Not set'}`);
          console.log(`✓ Farming Experience: ${testUser.farmingExperience || 'Not set'}`);
          console.log(`✓ Farming Methods: ${testUser.farmingMethods || 'Not set'}`);
          console.log(`✓ Equipment: ${testUser.equipment || 'Not set'}`);
          console.log(`✓ Certifications: ${testUser.certifications || 'Not set'}`);
          console.log(`✓ Crop Types: ${testUser.cropTypes || 'Not set'}`);
          console.log(`✓ Irrigation Type: ${testUser.irrigationType || 'Not set'}`);
        }
        
        if (role === 'HHM') {
          console.log('\n👨‍💼 HHM-specific fields:');
          console.log(`✓ Management Experience: ${testUser.managementExperience || 'Not set'}`);
          console.log(`✓ Team Size: ${testUser.teamSize || 'Not set'}`);
          console.log(`✓ Management Operations: ${testUser.managementOperations || 'Not set'}`);
          console.log(`✓ Services Offered: ${testUser.servicesOffered || 'Not set'}`);
        }
        
        if (role === 'Factory') {
          console.log('\n🏭 Factory-specific fields:');
          console.log(`✓ Company Name: ${testUser.companyName || 'Not set'}`);
          console.log(`✓ Factory Type: ${testUser.factoryType || 'Not set'}`);
          console.log(`✓ Processing Capacity: ${testUser.processingCapacity || 'Not set'}`);
          console.log(`✓ Location: ${testUser.location || 'Not set'}`);
          console.log(`✓ Established Year: ${testUser.establishedYear || 'Not set'}`);
          console.log(`✓ Certifications: ${testUser.certifications || 'Not set'}`);
          console.log(`✓ Services Offered: ${testUser.servicesOffered || 'Not set'}`);
          console.log(`✓ Contact Person: ${testUser.contactPerson || 'Not set'}`);
        }
        
        if (role === 'Labour') {
          console.log('\n👷 Labour-specific fields:');
          console.log(`✓ Experience: ${testUser.experience || 'Not set'}`);
          console.log(`✓ Skills: ${testUser.skills || 'Not set'}`);
          console.log(`✓ Availability: ${testUser.availability || 'Not set'}`);
          console.log(`✓ Wage Rate: ${testUser.wageRate || 'Not set'}`);
          console.log(`✓ Location: ${testUser.location || 'Not set'}`);
          console.log(`✓ Work Type: ${testUser.workType || 'Not set'}`);
        }
      }
    }

    // Test data completeness
    console.log('\n\n📈 DATA COMPLETENESS REPORT:');
    console.log('═'.repeat(60));
    
    const incompleteUsers = [];
    
    users.forEach(user => {
      const missing = [];
      
      // Check required fields
      if (!user.name) missing.push('name');
      if (!user.username) missing.push('username');
      if (!user.email) missing.push('email');
      if (!user.phone) missing.push('phone');
      if (!user.role) missing.push('role');
      if (!user.password) missing.push('password');
      
      // Role-specific required fields
      if (user.role === 'Farmer') {
        if (!user.location) missing.push('location');
        if (!user.farmSize) missing.push('farmSize');
        if (!user.farmingExperience) missing.push('farmingExperience');
      }
      
      if (user.role === 'HHM') {
        if (!user.managementExperience) missing.push('managementExperience');
        if (!user.teamSize) missing.push('teamSize');
      }
      
      if (user.role === 'Factory') {
        if (!user.companyName) missing.push('companyName');
        if (!user.factoryType) missing.push('factoryType');
      }
      
      if (user.role === 'Labour') {
        if (!user.experience) missing.push('experience');
        if (!user.skills) missing.push('skills');
      }
      
      if (missing.length > 0) {
        incompleteUsers.push({
          user: `${user.name} (${user.username})`,
          missing: missing
        });
      }
    });
    
    if (incompleteUsers.length === 0) {
      console.log('✅ All users have complete data!');
    } else {
      console.log(`⚠️  Found ${incompleteUsers.length} users with incomplete data:`);
      incompleteUsers.forEach(item => {
        console.log(`   - ${item.user}: Missing ${item.missing.join(', ')}`);
      });
    }

    // Summary by role
    console.log('\n📊 SUMMARY BY ROLE:');
    console.log('═'.repeat(40));
    roles.forEach(role => {
      const count = users.filter(user => user.role === role).length;
      console.log(`${role}: ${count} users`);
    });

    console.log('\n✅ Data integrity test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the test
testDataIntegrity();