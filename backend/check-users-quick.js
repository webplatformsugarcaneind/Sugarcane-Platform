const mongoose = require('mongoose');
const User = require('./models/user.model');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane_platform');
        console.log('✓ Connected to MongoDB\n');

        // Find a Factory user
        const factory = await User.findOne({ role: 'Factory' });
        console.log('Factory user:', factory ? `${factory.name} (${factory.username})` : 'NOT FOUND');

        // Find HHM users
        const hhms = await User.find({ role: 'HHM' }).limit(3);
        console.log(`\nFound ${hhms.length} HHM users:`);
        hhms.forEach(hhm => {
            console.log(`  - ${hhm.name} (${hhm.username}) [ID: ${hhm._id}]`);
        });

        if (hhms.length > 0) {
            console.log(`\nTry navigating to: http://localhost:5173/factory/hhm-profile/${hhms[0]._id}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();
