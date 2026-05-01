/**
 * add-hhm.js — adds a 4th HHM user to the database
 * Run: node add-hhm.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sugarcane-platform');
  console.log('✅ Connected to MongoDB\n');

  const User = require('./models/user.model');

  // Check existing HHMs
  const existing = await User.find({ role: 'HHM' }).select('name').lean();
  console.log(`Current HHMs (${existing.length}):`, existing.map(h => h.name).join(', '));

  if (existing.length >= 4) {
    console.log('\n✅ Already 4 or more HHMs exist. No action needed.');
    await mongoose.disconnect();
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Hhm@1234', salt);

  const newHHM = await User.create({
    name: 'Arjun Reddy',
    username: 'arjunhhm',
    phone: '8812345670',
    email: 'arjun.reddy.hhm@gmail.com',
    password: hashedPassword,
    role: 'HHM',
    isActive: true,
    location: 'Medak, Telangana',
    teamSize: '20-25 workers',
    managementExperience: '10 years',
    managementOperations: 'Sugarcane harvesting and transport coordination',
  });

  console.log(`\n✅ New HHM created:`);
  console.log(`   Name    : ${newHHM.name}`);
  console.log(`   Email   : ${newHHM.email}`);
  console.log(`   Location: ${newHHM.location}`);
  console.log(`   TeamSize: ${newHHM.teamSize}`);
  console.log(`   Exp     : ${newHHM.managementExperience}`);
  console.log(`   Password: Hhm@1234 (change after first login)`);

  const total = await User.countDocuments({ role: 'HHM' });
  console.log(`\n📊 Total HHMs now: ${total}`);

  await mongoose.disconnect();
  console.log('🔌 Done.');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
