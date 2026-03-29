const mongoose = require('mongoose');
require('dotenv').config();

async function checkCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📱 Connected to MongoDB\n');

    console.log('1️⃣ Listing all collections...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📋 Found collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    console.log('\n2️⃣ Checking documents in each collection...');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`📋 ${col.name}: ${count} documents`);
      
      if (col.name.toLowerCase().includes('listing') || col.name.toLowerCase().includes('crop')) {
        console.log(`   🔍 Examining ${col.name} structure...`);
        const sample = await db.collection(col.name).findOne();
        if (sample) {
          console.log(`   - Sample fields:`, Object.keys(sample));
          if (sample.status) console.log(`   - Sample status: "${sample.status}"`);
        }
      }
    }

    // Also check what the CropListing model thinks the collection name is
    const CropListing = require('./models/cropListing.model');
    console.log('\n3️⃣ Model collection name:', CropListing.collection.name);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📱 Disconnected from MongoDB');
  }
}

checkCollections();