/**
 * update-hhm-locations.js — updates all HHM locations to Maharashtra districts
 * Run: node update-hhm-locations.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const maharashtraLocations = [
  'Nashik, Maharashtra',
  'Kolhapur, Maharashtra',
  'Solapur, Maharashtra',
  'Ahmednagar, Maharashtra',
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sugarcane-platform');
  console.log('✅ Connected\n');

  const User = require('./models/user.model');
  const hhms = await User.find({ role: 'HHM' }).sort({ name: 1 });

  console.log(`Found ${hhms.length} HHMs. Updating locations...\n`);

  for (let i = 0; i < hhms.length; i++) {
    const newLocation = maharashtraLocations[i % maharashtraLocations.length];
    await User.findByIdAndUpdate(hhms[i]._id, { location: newLocation });
    console.log(`✏️  ${hhms[i].name}  →  ${newLocation}`);
  }

  console.log('\n✅ All HHM locations updated to Maharashtra.');
  await mongoose.disconnect();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
