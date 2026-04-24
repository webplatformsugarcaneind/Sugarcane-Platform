const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Application = require('./models/application.model');
const Schedule = require('./models/schedule.model');

dotenv.config();

const clearApplicationsAndSchedules = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');

    console.log('🗑️  Deleting all applications and schedules...\n');

    // Delete all applications
    const deletedApps = await Application.deleteMany({});
    console.log(`   ✅ Deleted ${deletedApps.deletedCount} applications`);

    // Delete all schedules
    const deletedSchedules = await Schedule.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSchedules.deletedCount} schedules`);

    console.log('\n🎉 Cleanup complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. You can now create new job schedules from the HHM interface');
    console.log('   2. Workers can apply to those schedules');
    console.log('   3. Applications will appear in "Applications Received" tab\n');

    // Verify cleanup
    const remainingApps = await Application.countDocuments();
    const remainingSchedules = await Schedule.countDocuments();
    
    console.log('🔍 Verification:');
    console.log(`   Applications remaining: ${remainingApps}`);
    console.log(`   Schedules remaining: ${remainingSchedules}\n`);

    if (remainingApps === 0 && remainingSchedules === 0) {
      console.log('✅ All data cleared successfully!\n');
    } else {
      console.log('⚠️  Some data may still exist. Please check manually.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
};

clearApplicationsAndSchedules();
