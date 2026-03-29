const mongoose = require('mongoose');
const User = require('./models/user.model');

async function createProperTestUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb://127.0.0.1:27017/agri");
        console.log('📡 Connected to database');

        // Remove existing user
        await User.deleteOne({ username: 'ravi_farmer' });
        console.log('🗑️ Cleared existing user');

        // Create user with plain password - let the model handle hashing
        const userData = {
            name: 'Ravi Patel',
            username: 'ravi_farmer',
            email: 'ravi@example.com',
            phone: '+1234567890',
            role: 'Farmer',
            password: 'ravi123', // Plain password - the pre-save hook will hash it
            isActive: true
        };
        
        console.log('📋 Creating user with plain password...');
        const newUser = await User.create(userData);
        console.log('✅ User created with ID:', newUser._id);
        
        // Fetch user with password to test
        const fetchedUser = await User.findById(newUser._id).select('+password');
        console.log('🔍 User fetched from database:', {
            id: fetchedUser._id,
            name: fetchedUser.name,
            username: fetchedUser.username,
            hasPassword: !!fetchedUser.password,
            passwordLength: fetchedUser.password ? fetchedUser.password.length : 0
        });
        
        // Test using the built-in comparePassword method
        const isPasswordValid = await fetchedUser.comparePassword('ravi123');
        console.log('🔑 Password comparison result (using model method):', isPasswordValid);
        
        // Test the auth route logic
        console.log('\n🧪 Testing auth route logic:');
        const testIdentifier = 'ravi_farmer';
        const testPassword = 'ravi123';
        
        const user = await User.findOne({
            $or: [
                { username: testIdentifier.toLowerCase() },
                { email: testIdentifier.toLowerCase() },
                { phone: testIdentifier }
            ],
            isActive: true
        }).select('+password');
        
        if (user) {
            console.log('👤 User found for auth test:', user.name);
            const authPasswordValid = await user.comparePassword(testPassword);
            console.log('🎯 Auth test result:', authPasswordValid ? '✅ SUCCESS' : '❌ FAILED');
        } else {
            console.log('❌ User not found for auth test');
        }
        
        await mongoose.connection.close();
        console.log('\n📡 Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
    }
}

createProperTestUser();