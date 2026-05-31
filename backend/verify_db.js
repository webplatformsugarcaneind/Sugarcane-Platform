require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Announcement = require('./models/announcement.model');
const Application = require('./models/application.model');
const Contract = require('./models/contract.model');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');
    const counts = await Promise.all([
      Announcement.countDocuments(),
      Application.countDocuments(),
      Contract.countDocuments()
    ]);
    console.log('📊 Document counts:');
    console.log('  Announcements:', counts[0]);
    console.log('  Applications:', counts[1]);
    console.log('  Contracts:', counts[2]);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

verify();
