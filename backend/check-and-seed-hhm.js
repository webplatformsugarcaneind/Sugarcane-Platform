/**
 * check-and-seed-hhm.js
 * 
 * Run: node check-and-seed-hhm.js
 * 
 * 1. Connects to MongoDB
 * 2. Prints all HHM users with their current field values
 * 3. For HHMs missing location / teamSize / managementExperience,
 *    seeds placeholder values so the card shows real data instead
 *    of "Profile details not filled"
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sugarcane-platform';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI);

  const User = require('./models/user.model');

  // ── 1. Show all HHMs with their current fields ──────────────────────────────
  const hhms = await User.find({ role: 'HHM' })
    .select('name location teamSize managementExperience isActive')
    .lean();

  console.log('\n── Current HHM records ──────────────────────────────────────');
  hhms.forEach((h, i) => {
    console.log(`\n[${i + 1}] ${h.name} (${h._id})`);
    console.log(`    location           : ${h.location            ?? '❌ EMPTY'}`);
    console.log(`    teamSize           : ${h.teamSize            ?? '❌ EMPTY'}`);
    console.log(`    managementExperience: ${h.managementExperience ?? '❌ EMPTY'}`);
    console.log(`    isActive           : ${h.isActive}`);
  });

  // ── 2. Count how many are missing data ──────────────────────────────────────
  const missing = hhms.filter(h => !h.location || !h.teamSize || !h.managementExperience);
  console.log(`\n⚠️  ${missing.length} of ${hhms.length} HHMs have incomplete profile data.\n`);

  if (missing.length === 0) {
    console.log('✅ All HHMs have profile data. No seeding needed.');
    await mongoose.disconnect();
    return;
  }

  // ── 3. Seed sample data for HHMs missing fields ─────────────────────────────
  // These are realistic placeholder values — update with real data later via profile edit.
  const sampleLocations = [
    'Suryapet, Telangana',
    'Nalgonda, Telangana',
    'Karimnagar, Telangana',
    'Warangal, Telangana',
    'Khammam, Telangana',
    'Nizamabad, Telangana',
  ];

  let updated = 0;
  for (let i = 0; i < missing.length; i++) {
    const h = missing[i];
    const patch = {};

    if (!h.location) {
      patch.location = sampleLocations[i % sampleLocations.length];
    }
    if (!h.teamSize) {
      // Assign a realistic team size between 8 and 25
      patch.teamSize = String(8 + ((i * 7) % 18));
    }
    if (!h.managementExperience) {
      patch.managementExperience = String(2 + (i % 8)); // 2–9 years experience
    }

    await User.findByIdAndUpdate(h._id, patch);
    console.log(`✏️  Updated ${h.name}:`, patch);
    updated++;
  }

  console.log(`\n✅ Seeded ${updated} HHM records.`);
  console.log('   HHMs can update their real values via their profile edit page.\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
