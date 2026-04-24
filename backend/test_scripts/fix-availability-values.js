const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sugarcane-platform');

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function updateAvailabilityValues() {
  try {
    console.log('🔍 Checking and fixing availability values...\n');
    
    // Find all users with availability field
    const users = await User.find({ availability: { $exists: true } });
    console.log('📊 Total users with availability field:', users.length);
    
    // Check current availability values
    const availabilityStats = {};
    users.forEach(user => {
      const status = user.availability || 'undefined';
      availabilityStats[status] = (availabilityStats[status] || 0) + 1;
    });
    
    console.log('📋 Current availability distribution:');
    Object.entries(availabilityStats).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count} users`);
    });
    
    // Find users with "Busy" status and update them to "Unavailable"
    const busyUsers = await User.find({ availability: 'Busy' });
    if (busyUsers.length > 0) {
      console.log(`\n🔧 Found ${busyUsers.length} users with "Busy" status, updating to "Unavailable"...`);
      
      const updateResult = await User.updateMany(
        { availability: 'Busy' },
        { $set: { availability: 'Unavailable' } }
      );
      
      console.log('✅ Updated', updateResult.modifiedCount, 'users from "Busy" to "Unavailable"');
    } else {
      console.log('\n✅ No users found with "Busy" status');
    }
    
    // Verify final state
    console.log('\n🔍 Final verification...');
    const finalStats = await User.aggregate([
      { $match: { availability: { $exists: true } } },
      { $group: { _id: '$availability', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('📊 Final availability distribution:');
    finalStats.forEach(stat => {
      console.log(`  - ${stat._id}: ${stat.count} users`);
    });
    
    // Check for any invalid values
    const invalidUsers = await User.find({ 
      availability: { 
        $exists: true, 
        $nin: ['Available', 'Unavailable'] 
      } 
    });
    
    if (invalidUsers.length > 0) {
      console.log('\n⚠️  Found users with invalid availability values:');
      invalidUsers.forEach(user => {
        console.log(`  - ${user.name || user.username}: "${user.availability}"`);
      });
      
      // Fix invalid values
      console.log('\n🔧 Fixing invalid availability values...');
      const fixResult = await User.updateMany(
        { 
          availability: { 
            $exists: true, 
            $nin: ['Available', 'Unavailable'] 
          } 
        },
        { $set: { availability: 'Available' } }
      );
      
      console.log('✅ Fixed', fixResult.modifiedCount, 'users with invalid availability values');
    } else {
      console.log('\n✅ All availability values are valid');
    }
    
    console.log('\n🎉 Availability field cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

updateAvailabilityValues();