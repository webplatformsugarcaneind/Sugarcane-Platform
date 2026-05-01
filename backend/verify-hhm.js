/**
 * verify-hhm.js — verify DB state and simulate API response
 * Run: node verify-hhm.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sugarcane-platform');
  console.log('✅ Connected\n');

  const User = require('./models/user.model');

  // Exactly what the API query does
  const hhms = await User.find({ role: 'HHM', isActive: true })
    .select('_id name location teamSize managementExperience isActive createdAt')
    .sort({ name: 1 })
    .lean();

  console.log(`Found ${hhms.length} HHMs:\n`);
  hhms.forEach(h => {
    console.log(`Name    : ${h.name}`);
    console.log(`Location: ${h.location ?? 'NULL'}`);
    console.log(`TeamSize: ${h.teamSize ?? 'NULL'}`);
    console.log(`Exp     : ${h.managementExperience ?? 'NULL'}`);
    console.log(`isActive: ${h.isActive}`);
    console.log('─────────────────────');
  });

  await mongoose.disconnect();
}

main().catch(e => { console.error(e.message); process.exit(1); });
