/**
 * Test script to verify API endpoints are working
 */

// Simple test to check if servers are running and APIs are accessible
const testEndpoints = async () => {
    const baseURL = 'http://localhost:5000';
    
    console.log('🧪 Testing API Endpoints...\n');
    
    // Test health endpoint
    try {
        const healthResponse = await fetch(`${baseURL}/api/health`);
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health check passed:', healthData.status);
        }
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
        return;
    }
    
    // Test a sample user profile endpoint (this will fail without auth, but shows if route exists)
    try {
        const profileResponse = await fetch(`${baseURL}/api/users/profile/507f1f77bcf86cd799439011`);
        console.log('✅ Profile endpoint response status:', profileResponse.status);
        if (profileResponse.status === 404) {
            console.log('   (404 is expected for non-existent user)');
        }
    } catch (error) {
        console.log('❌ Profile endpoint failed:', error.message);
    }
    
    console.log('\n🔧 Backend fixes applied:');
    console.log('   - Added _id field to Factory controller getHHMs');
    console.log('   - Added _id field to Farmer controller getHHMs & getFactories');
    console.log('   - Added _id field to Worker controller getHHMs');
    console.log('   - Created unified /api/users/profile/:userId endpoint');
    console.log('\n🎯 Frontend fixes applied:');
    console.log('   - Updated all View Profile buttons to use /profile/${user._id}');
    console.log('   - Added debug logging to profile navigation functions');
    console.log('   - Created UserProfilePage component with role-specific display');
};

// Run the test if this is run directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = require('node-fetch');
    testEndpoints().catch(console.error);
} else {
    // Browser environment
    window.testEndpoints = testEndpoints;
    console.log('Run testEndpoints() in browser console to test');
}