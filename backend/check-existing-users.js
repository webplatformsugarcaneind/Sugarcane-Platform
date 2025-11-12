const mongoose = require('mongoose');
const User = require('./models/user.model');

async function checkExistingUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
        console.log('📊 CHECKING EXISTING USERS FOR TESTING\n');

        // Check Factory users
        const factories = await User.find({ role: 'Factory' }).select('name email role isActive').limit(5);
        console.log(`🏭 FACTORY USERS (${factories.length} found):`);
        factories.forEach((factory, index) => {
            console.log(`   ${index + 1}. ${factory.name} (${factory.email}) - ${factory.isActive ? 'Active' : 'Inactive'}`);
        });

        // Check HHM users
        const hhms = await User.find({ role: 'HHM' }).select('name email role isActive').limit(5);
        console.log(`\n👨‍💼 HHM USERS (${hhms.length} found):`);
        hhms.forEach((hhm, index) => {
            console.log(`   ${index + 1}. ${hhm.name} (${hhm.email}) - ${hhm.isActive ? 'Active' : 'Inactive'}`);
        });

        // Check existing invitations
        const Invitation = require('./models/invitation.model');
        const invitations = await Invitation.find()
            .populate('hhmId', 'name email')
            .populate('factoryId', 'name email')
            .select('invitationType status sentAt')
            .limit(10);

        console.log(`\n📨 EXISTING INVITATIONS (${invitations.length} found):`);
        invitations.forEach((inv, index) => {
            console.log(`   ${index + 1}. ${inv.invitationType} - ${inv.status} (${new Date(inv.sentAt).toDateString()})`);
            console.log(`      From: ${inv.hhmId?.name || 'Unknown'} To: ${inv.factoryId?.name || 'Unknown'}`);
        });

        if (factories.length === 0 || hhms.length === 0) {
            console.log('\n⚠️  RECOMMENDATION:');
            console.log('   Create test users to properly test invitation system');
            console.log('   Use the registration forms to create Factory and HHM accounts');
        } else {
            console.log('\n🎯 TESTING SUGGESTIONS:');
            console.log('   1. Login with any Factory user above');
            console.log('   2. Login with any HHM user above');
            console.log('   3. Send invitations between them');
            console.log('   4. Test acceptance/rejection workflow');
        }

        console.log('\n🌐 Access the platform at: http://localhost:5177/');

    } catch (error) {
        console.error('❌ Error checking users:', error.message);
        console.log('\n💡 If database connection fails:');
        console.log('   • Make sure MongoDB is running');
        console.log('   • Check .env file for correct MONGODB_URI');
        console.log('   • Ensure backend server is running');
    } finally {
        await mongoose.disconnect();
    }
}

checkExistingUsers();