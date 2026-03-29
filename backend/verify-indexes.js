const mongoose = require('mongoose');
require('dotenv').config();

const checkIndexes = async () => {
    try {
        console.log('🔧 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('invitations');

        console.log('\n📋 Current indexes on invitations collection:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`\n✓ ${index.name}:`);
            console.log(`  Key:`, JSON.stringify(index.key));
            if (index.unique) console.log(`  Unique: true`);
            if (index.sparse) console.log(`  Sparse: true`);
            if (index.partialFilterExpression) {
                console.log(`  Partial filter:`, JSON.stringify(index.partialFilterExpression, null, 2));
            }
        });

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

checkIndexes();
