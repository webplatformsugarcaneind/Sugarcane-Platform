/**
 * Database Migration Script: Clean Operating Hours
 * 
 * This script removes individual day schedules and other deprecated fields
 * from factory operatingHours, keeping only the 'season' field.
 * 
 * Removes: monday, tuesday, wednesday, thursday, friday, saturday, sunday,
 *          daily, shift1, shift2, maintenance
 * Keeps: season
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-ecosystem');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// User model (simplified for migration)
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const cleanOperatingHours = async () => {
  try {
    console.log('🔄 Starting Operating Hours cleanup migration...');

    // Find all factory users that have operating hours
    const factories = await User.find({
      role: 'Factory',
      operatingHours: { $exists: true, $ne: null }
    });

    console.log(`📊 Found ${factories.length} factories with operating hours data`);

    let updatedCount = 0;
    
    for (const factory of factories) {
      const originalOperatingHours = factory.operatingHours;
      
      // Create new operating hours object with only season
      const newOperatingHours = {};
      
      // Keep only the season field if it exists
      if (originalOperatingHours.season) {
        newOperatingHours.season = originalOperatingHours.season;
      }
      
      // Update the factory's operating hours
      const result = await User.findByIdAndUpdate(
        factory._id,
        { 
          $set: { operatingHours: newOperatingHours }
        },
        { new: true }
      );

      if (result) {
        updatedCount++;
        console.log(`✅ Updated factory: ${factory.name || factory.factoryName || 'Unnamed'}`);
        console.log(`   - Before: ${JSON.stringify(originalOperatingHours)}`);
        console.log(`   - After: ${JSON.stringify(newOperatingHours)}`);
      }
    }

    console.log(`🎉 Migration completed successfully!`);
    console.log(`   - Total factories processed: ${factories.length}`);
    console.log(`   - Factories updated: ${updatedCount}`);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
};

const runMigration = async () => {
  try {
    await connectDB();
    await cleanOperatingHours();
    
    console.log('✅ Operating Hours cleanup migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  cleanOperatingHours,
  runMigration
};