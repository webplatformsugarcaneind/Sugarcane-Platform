
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to MongoDB using the connection string from environment variable
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.warn('🚨 Server will continue running without database connection');
    console.warn('💡 To fix this:');
    console.warn('   1. Start MongoDB service: net start MongoDB');
    console.warn('   2. Or start MongoDB manually: mongod --dbpath "D:\\data\\db"');
    console.warn('   3. Or use MongoDB Atlas cloud database');
    // Don't exit - continue running without database
  }
};

module.exports = connectDB;