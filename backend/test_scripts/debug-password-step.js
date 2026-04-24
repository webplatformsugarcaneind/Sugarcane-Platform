const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');

async function debugPasswordStep() {
    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb://127.0.0.1:27017/agri");
        console.log('📡 Connected to database');

        // Delete existing user
        await User.deleteOne({ username: 'ravi_farmer' });
        console.log('🗑️ Cleared existing user');

        // Create password hash step by step
        const plainPassword = 'ravi123';
        console.log('🔤 Plain password:', plainPassword);
        
        const saltRounds = 10;
        const hash1 = await bcrypt.hash(plainPassword, saltRounds);
        console.log('🔐 Generated hash:', hash1);
        
        // Test the hash immediately
        const test1 = await bcrypt.compare(plainPassword, hash1);
        console.log('🧪 Hash test 1:', test1);
        
        // Create user with explicit password
        const userData = {
            name: 'Ravi Patel',
            username: 'ravi_farmer',
            email: 'ravi@example.com',
            phone: '+1234567890',
            role: 'Farmer',
            password: hash1,
            isActive: true
        };
        
        console.log('📋 User data to save:', {
            ...userData,
            password: userData.password.substring(0, 10) + '...'
        });
        
        const newUser = await User.create(userData);
        console.log('✅ User created with ID:', newUser._id);
        
        // Fetch user with password
        const fetchedUser = await User.findById(newUser._id).select('+password');
        console.log('🔍 Fetched user data:', {
            id: fetchedUser._id,
            name: fetchedUser.name,
            username: fetchedUser.username,
            hasPassword: !!fetchedUser.password,
            passwordType: typeof fetchedUser.password,
            passwordLength: fetchedUser.password ? fetchedUser.password.length : 0,
            passwordPreview: fetchedUser.password ? fetchedUser.password.substring(0, 10) + '...' : 'NONE'
        });
        
        // Test bcrypt comparison
        if (fetchedUser.password) {
            const compareResult = await bcrypt.compare(plainPassword, fetchedUser.password);
            console.log('🔑 Password comparison result:', compareResult);
        } else {
            console.log('❌ No password found in fetched user');
        }
        
        await mongoose.connection.close();
        console.log('📡 Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('📍 Stack trace:', error.stack);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
    }
}

debugPasswordStep();