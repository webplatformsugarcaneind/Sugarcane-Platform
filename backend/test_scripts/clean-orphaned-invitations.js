const mongoose = require('mongoose');
require('dotenv').config();

const checkOrphanedInvitations = async () => {
    try {
        console.log('🔧 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('invitations');

        // Check for any invitations with null workerId and scheduleId
        const nullInvitations = await collection.find({
            workerId: null,
            scheduleId: null
        }).toArray();

        console.log(`\n📋 Invitations with null workerId and scheduleId: ${nullInvitations.length}`);

        for (const inv of nullInvitations) {
            console.log(`\n Invitation ${inv._id}:`);
            console.log(`   Type: ${inv.invitationType}`);
            console.log(`   FactoryId: ${inv.factoryId}`);
            console.log(`   HHMId: ${inv.hhmId}`);
            console.log(`   Status: ${inv.status}`);
        }

        if (nullInvitations.length > 0) {
            console.log(`\n🗑️  Deleting ${nullInvitations.length} orphaned invitation(s)...`);
            const result = await collection.deleteMany({
                workerId: null,
                scheduleId: null
            });
            console.log(`✅ Deleted ${result.deletedCount} invitation(s)`);
        }

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

checkOrphanedInvitations();
