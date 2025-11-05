const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane_platform';

async function fixIndexes() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('invitations');

        console.log('\n🔍 Current indexes:');
        const indexes = await collection.indexes();
        indexes.forEach(idx => {
            console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
            if (idx.partialFilterExpression) {
                console.log(`    Partial filter:`, JSON.stringify(idx.partialFilterExpression, null, 2));
            }
        });

        // Drop the problematic workerId_scheduleId index
        console.log('\n🗑️  Dropping workerId_scheduleId index...');
        try {
            await collection.dropIndex('workerId_1_scheduleId_1');
            console.log('✓ Dropped workerId_1_scheduleId_1');
        } catch (err) {
            if (err.code === 27) {
                console.log('  Index does not exist, skipping');
            } else {
                throw err;
            }
        }

        // Create NEW compound index with invitationType as first field
        // This completely separates hhm-to-worker and factory-to-hhm invitations
        console.log('\n✨ Creating new compound index: invitationType + workerId + scheduleId...');
        await collection.createIndex(
            { invitationType: 1, workerId: 1, scheduleId: 1 },
            {
                unique: true,
                name: 'invitationType_1_workerId_1_scheduleId_1',
                partialFilterExpression: {
                    invitationType: 'hhm-to-worker',
                    workerId: { $type: 'objectId' },
                    scheduleId: { $type: 'objectId' }
                }
            }
        );
        console.log('✓ Created invitationType_1_workerId_1_scheduleId_1 index');

        console.log('\n✅ Final indexes:');
        const finalIndexes = await collection.indexes();
        finalIndexes.forEach(idx => {
            console.log(`  - ${idx.name}:`, JSON.stringify(idx.key));
            if (idx.partialFilterExpression) {
                console.log(`    Partial filter:`, JSON.stringify(idx.partialFilterExpression, null, 2));
            }
        });

        console.log('\n✅ Index fix complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixIndexes();
