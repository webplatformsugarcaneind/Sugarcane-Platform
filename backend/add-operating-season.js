require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

async function addOperatingSeason() {
  try {
    // Connect directly with longer timeout
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all factory users
    const factoryUsers = await User.find({ role: 'Factory' });
    console.log(`Found ${factoryUsers.length} factory users\n`);

    // Update each factory user to add operatingSeason
    let updated = 0;
    for (const factory of factoryUsers) {
      factory.operatingSeason = 'October to March';
      await factory.save();
      console.log(`✓ Added operatingSeason for: ${factory.name} (${factory.email})`);
      updated++;
    }

    console.log(`\n✅ Operating season added to all factory users!`);
    console.log(`Total factories: ${factoryUsers.length}, Updated: ${updated}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addOperatingSeason();
