const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
    try {
        console.log('🔧 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('invitations');

        console.log('\n📋 Dropping ALL existing indexes except _id...');
        await collection.dropIndexes();
        console.log('✅ All indexes dropped');

        console.log('\n📋 Creating new indexes with proper constraints...');

        // 1. Prevent duplicate worker invitations for same schedule (only for hhm-to-worker type)
        // CRITICAL: Use $exists and $type to exclude null/undefined values
        await collection.createIndex(
            { workerId: 1, scheduleId: 1 },
            {
                name: 'workerId_1_scheduleId_1_partial',
                unique: true,
                partialFilterExpression: {
                    invitationType: 'hhm-to-worker',
                    workerId: { $exists: true, $type: 'objectId' },
                    scheduleId: { $exists: true, $type: 'objectId' }
                }
            }
        );
        console.log('✅ Created workerId_scheduleId index with partial filter');

        // 2. Prevent duplicate factory invitations to same HHM (only for factory-to-hhm type)
        await collection.createIndex(
            { factoryId: 1, hhmId: 1 },
            {
                name: 'factoryId_1_hhmId_1_partial',
                unique: true,
                partialFilterExpression: {
                    invitationType: 'factory-to-hhm',
                    factoryId: { $type: 'objectId' },
                    hhmId: { $type: 'objectId' },
                    status: 'pending'
                }
            }
        );
        console.log('✅ Created factoryId_hhmId index with partial filter (pending only)');

        // 3. Other indexes for query performance
        await collection.createIndex({ hhmId: 1, status: 1 }, { name: 'hhmId_1_status_1' });
        console.log('✅ Created hhmId_status index');

        await collection.createIndex({ factoryId: 1, status: 1 }, { name: 'factoryId_1_status_1' });
        console.log('✅ Created factoryId_status index');

        await collection.createIndex({ scheduleId: 1, status: 1 }, { name: 'scheduleId_1_status_1' });
        console.log('✅ Created scheduleId_status index');

        await collection.createIndex({ invitationType: 1, status: 1 }, { name: 'invitationType_1_status_1' });
        console.log('✅ Created invitationType_status index');

        await collection.createIndex({ status: 1, createdAt: -1 }, { name: 'status_1_createdAt_-1' });
        console.log('✅ Created status_createdAt index');

        await collection.createIndex({ expiresAt: 1 }, { name: 'expiresAt_1' });
        console.log('✅ Created expiresAt index');

        console.log('\n📋 Final indexes:');
        const finalIndexes = await collection.indexes();
        finalIndexes.forEach(index => {
            console.log(`  ✓ ${index.name}:`, JSON.stringify(index.key));
            if (index.partialFilterExpression) {
                console.log(`    Partial filter:`, JSON.stringify(index.partialFilterExpression));
            }
        });

        console.log('\n✅ Index fix complete!');

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

fixIndexes();
