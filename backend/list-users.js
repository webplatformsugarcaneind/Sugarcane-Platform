const mongoose = require('mongoose');
const User = require('./models/user.model');

async function listUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb://127.0.0.1:27017/agri");
        console.log('📡 Connected to database');

        // Find all users
        const users = await User.find({});
        console.log(`📋 Found ${users.length} users in database:`);
        
        users.forEach((user, index) => {
            console.log(`\n🔍 User ${index + 1}:`);
            console.log('   ID:', user._id);
            console.log('   Username:', user.username);
            console.log('   Email:', user.email);
            console.log('   Phone:', user.phone);
            console.log('   Role:', user.role);
            console.log('   IsActive:', user.isActive);
            console.log('   Password exists:', !!user.password);
            console.log('   Password type:', typeof user.password);
        });

        await mongoose.connection.close();
        console.log('\n📡 Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
    }
}

listUsers();