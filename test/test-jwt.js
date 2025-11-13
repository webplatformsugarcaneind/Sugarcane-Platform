const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('🧪 Testing JWT operations...');

// Test what we have in environment
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

try {
  // Create a test token
  const testUserId = '507f1f77bcf86cd799439011'; // Sample ObjectId
  const testToken = jwt.sign(
    { userId: testUserId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  console.log('✅ Token creation successful');
  console.log('Token length:', testToken.length);
  console.log('Token preview:', testToken.substring(0, 50) + '...');
  
  // Test token verification
  const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
  console.log('✅ Token verification successful');
  console.log('Decoded payload:', decoded);
  
} catch (error) {
  console.error('❌ JWT test failed:', error.message);
  console.error('Error type:', error.name);
}

console.log('\n🧪 Testing with a sample problematic token...');
// Test with a sample token that might be causing issues
const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzJjMDQzYjA0NzE5NzJlYWEwOTYyZjIiLCJpYXQiOjE3MzEyNTk5MDEsImV4cCI6MTczMzg1MTkwMX0.invalid_signature';

try {
  const decoded2 = jwt.verify(sampleToken, process.env.JWT_SECRET);
  console.log('✅ Sample token verification successful');
  console.log('Decoded:', decoded2);
} catch (error) {
  console.error('❌ Sample token verification failed:', error.message);
  console.error('Error type:', error.name);
}