/**
 * update-hhm-stats.js
 * Seeding seasonsCompleted and reliabilityRating for existing HHM users
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sugarcane-platform';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI);

  const User = require('./models/user.model');

  // Define realistic stats for HHM users
  const updates = [
    { name: 'Sunil Kumar', seasonsCompleted: 10, reliabilityRating: 9 },
    { name: 'Sunita Sharma', seasonsCompleted: 5, reliabilityRating: 8 },
    { name: 'Vikram Singh', seasonsCompleted: 8, reliabilityRating: 9 },
    { name: 'Arjun Reddy', seasonsCompleted: 7, reliabilityRating: 8 }
  ];

  for (const update of updates) {
    const res = await User.findOneAndUpdate(
      { name: update.name, role: 'HHM' },
      { 
        seasonsCompleted: update.seasonsCompleted, 
        reliabilityRating: update.reliabilityRating 
      },
      { new: true }
    );
    if (res) {
      console.log(`✏️ Updated stats for ${update.name}: seasonsCompleted=${res.seasonsCompleted}, reliabilityRating=${res.reliabilityRating}`);
    } else {
      console.log(`⚠️ HHM ${update.name} not found in DB`);
    }
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
