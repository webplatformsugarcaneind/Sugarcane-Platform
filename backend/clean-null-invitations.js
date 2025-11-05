const mongoose = require('mongoose');
require('dotenv').config();

const cleanNullInvitations = async () => {
    try {
        console.log('🔧 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('invitations');

        // Find all invitations with null workerId or scheduleId
        console.log('\n📋 Finding invitations with null workerId or scheduleId...');
        const nullInvitations = await collection.find({
            $or: [
                { workerId: null },
                { scheduleId: null }
            ]
        }).toArray();

        console.log(`Found ${nullInvitations.length} invitations with null values:`);
        nullInvitations.forEach(inv => {
            console.log(`  - ID: ${inv._id}, Type: ${inv.invitationType}, workerId: ${inv.workerId}, scheduleId: ${inv.scheduleId}, factoryId: ${inv.factoryId}, hhmId: ${inv.hhmId}`);
        });

        if (nullInvitations.length > 0) {
            console.log('\n🗑️ Deleting invitations with null workerId or scheduleId...');
            const result = await collection.deleteMany({
                $or: [
                    { workerId: null },
                    { scheduleId: null }
                ]
            });
            console.log(`✅ Deleted ${result.deletedCount} invitations`);
        }

        // Show remaining invitations
        console.log('\n📋 Remaining invitations:');
        const remaining = await collection.find({}).toArray();
        console.log(`Total: ${remaining.length}`);
        remaining.forEach(inv => {
            console.log(`  - Type: ${inv.invitationType}, Status: ${inv.status}`);
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

cleanNullInvitations();
