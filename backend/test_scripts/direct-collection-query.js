const mongoose = require('mongoose');
require('dotenv').config();

async function directCollectionQuery() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📱 Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collection = db.collection('croplistings');

    console.log('1️⃣ Direct collection query - all documents...');
    const allDocs = await collection.find({}).toArray();
    console.log('📋 Total documents:', allDocs.length);

    console.log('\n2️⃣ Status breakdown...');
    const statusCount = {};
    allDocs.forEach(doc => {
      const status = doc.status || 'undefined';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`📋 ${status}: ${count}`);
    });

    console.log('\n3️⃣ Active documents...');
    const activeDocuments = await collection.find({ status: 'active' }).toArray();
    console.log('📋 Active count:', activeDocuments.length);

    activeDocuments.forEach((doc, index) => {
      console.log(`📋 Active ${index + 1}:`);
      console.log(`   - Title: ${doc.title}`);
      console.log(`   - Crop: ${doc.crop_variety}`);
      console.log(`   - Price: ${doc.expected_price_per_ton}`);
      console.log(`   - Quantity: ${doc.quantity_in_tons}`);
      console.log(`   - Farmer ID: ${doc.farmer_id}`);
      console.log('');
    });

    console.log('4️⃣ Testing the exact query from the marketplace endpoint...');
    const marketplaceQuery = { status: 'active' };
    const marketplaceDocs = await collection.find(marketplaceQuery)
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
    
    console.log('📋 Marketplace query result count:', marketplaceDocs.length);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📱 Disconnected from MongoDB');
  }
}

directCollectionQuery();