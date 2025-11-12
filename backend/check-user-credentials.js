const mongoose = require('mongoose');
const User = require('./models/user.model');

async function checkUserCredentials() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
        
        console.log('🔍 CHECKING FACTORY USER CREDENTIALS\n');

        // Find all factory users
        const factories = await User.find({ role: 'Factory' }).select('name email username');
        
        console.log('🏭 FACTORY USERS FOUND:');
        factories.forEach((factory, index) => {
            console.log(`   ${index + 1}. Name: ${factory.name}`);
            console.log(`      Email: ${factory.email}`);
            console.log(`      Username: ${factory.username || 'Not set'}`);
            console.log('');
        });

        console.log('💡 Try logging in with:');
        console.log('   - identifier: [email or username]');
        console.log('   - password: [the password you set during registration]');
        console.log('');
        console.log('🔒 If you need to reset passwords, use the forgot password functionality');
        console.log('   or create new test users with known passwords.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkUserCredentials();