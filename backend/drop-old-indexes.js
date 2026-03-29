const mongoose = require('mongoose');
require('dotenv').config();

const dropOldIndexes = async () => {
    try {
        console.log('🔧 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('invitations');

        console.log('\n📋 Current indexes:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key), index.partialFilterExpression ? `(partial: ${JSON.stringify(index.partialFilterExpression)})` : '');
        });

        // Drop the old workerId_1_scheduleId_1 index that doesn't have partialFilterExpression
        try {
            console.log('\n🗑️  Dropping old workerId_1_scheduleId_1 index...');
            await collection.dropIndex('workerId_1_scheduleId_1');
            console.log('✅ Old index dropped successfully');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️  Index doesn\'t exist (already dropped)');
            } else {
                console.log('⚠️  Error dropping index:', error.message);
            }
        }

        // Drop the old factoryId_1_hhmId_1 index if it exists without partialFilterExpression
        try {
            console.log('\n🗑️  Dropping old factoryId_1_hhmId_1 index...');
            await collection.dropIndex('factoryId_1_hhmId_1');
            console.log('✅ Old index dropped successfully');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️  Index doesn\'t exist (already dropped)');
            } else {
                console.log('⚠️  Error dropping index:', error.message);
            }
        }

        console.log('\n📋 Updated indexes:');
        const updatedIndexes = await collection.indexes();
        updatedIndexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key), index.partialFilterExpression ? `(partial: ${JSON.stringify(index.partialFilterExpression)})` : '');
        });

        console.log('\n✅ Index cleanup complete!');
        console.log('ℹ️  Now restart the server to recreate the indexes with correct partial filters');

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

dropOldIndexes();
