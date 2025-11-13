/**
 * 🧪 COMPLETE FACTORY HHM DIRECTORY TEST
 * Testing the fixed API endpoints for "My Requests" and "Received Applications" tabs
 */

const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:5178';

// Test users
const FACTORY_USER = {
    username: 'anitafactory',
    password: 'anita123'
};

const HHM_USER = {
    username: 'ravi',
    password: 'ravi123'
};

let factoryToken = null;
let hhmToken = null;
let factoryUserId = null;
let hhmUserId = null;

console.log('🧪 TESTING FACTORY HHM DIRECTORY - COMPLETE WORKFLOW\n');

// Helper function to login and get token
async function loginUser(username, password, userType) {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            username,
            password
        });

        console.log(`✅ ${userType} Login successful:`, {
            username,
            userId: response.data.user._id,
            role: response.data.user.role
        });

        return {
            token: response.data.token,
            userId: response.data.user._id,
            user: response.data.user
        };
    } catch (error) {
        console.error(`❌ ${userType} Login failed:`, error.response?.data || error.message);
        return null;
    }
}

// Test factory sent invitations API
async function testFactoryMyRequests() {
    try {
        console.log('\n🔍 Testing Factory "My Requests" (sent invitations)...');
        
        const response = await axios.get(`${BASE_URL}/factory/invitations`, {
            headers: { Authorization: `Bearer ${factoryToken}` }
        });

        console.log('✅ Factory My Requests API Response:', {
            status: response.status,
            dataType: typeof response.data,
            dataLength: Array.isArray(response.data) ? response.data.length : 'Not an array',
            data: response.data
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
            console.log('📋 Sample invitation:', response.data[0]);
        } else {
            console.log('ℹ️  No sent invitations found (this is normal if no invitations were sent)');
        }

        return response.data;
    } catch (error) {
        console.error('❌ Factory My Requests API Error:', error.response?.data || error.message);
        return null;
    }
}

// Test factory received invitations API  
async function testFactoryReceivedApplications() {
    try {
        console.log('\n🔍 Testing Factory "Received Applications"...');
        
        const response = await axios.get(`${BASE_URL}/factory/received-invitations`, {
            headers: { Authorization: `Bearer ${factoryToken}` }
        });

        console.log('✅ Factory Received Applications API Response:', {
            status: response.status,
            dataType: typeof response.data,
            dataLength: Array.isArray(response.data) ? response.data.length : 'Not an array',
            data: response.data
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
            console.log('📋 Sample received invitation:', response.data[0]);
        } else {
            console.log('ℹ️  No received invitations found');
        }

        return response.data;
    } catch (error) {
        console.error('❌ Factory Received Applications API Error:', error.response?.data || error.message);
        return null;
    }
}

// Create test invitation from HHM to Factory
async function createTestInvitation() {
    try {
        console.log('\n🔧 Creating test invitation from HHM to Factory...');
        
        // First get the factory user details
        const factoryResponse = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${factoryToken}` }
        });

        const factoryId = factoryResponse.data._id;
        
        console.log('🎯 Target Factory:', {
            id: factoryId,
            username: factoryResponse.data.username,
            role: factoryResponse.data.role
        });

        // Create invitation from HHM to Factory
        const invitationData = {
            factoryId: factoryId,
            message: `Test invitation from ${HHM_USER.username} to ${FACTORY_USER.username} - ${new Date().toLocaleString()}`
        };

        const response = await axios.post(`${BASE_URL}/hhm/invite-factory`, invitationData, {
            headers: { Authorization: `Bearer ${hhmToken}` }
        });

        console.log('✅ Test invitation created:', {
            status: response.status,
            message: response.data.message,
            invitationId: response.data.invitation?._id
        });

        return response.data.invitation;
    } catch (error) {
        console.error('❌ Failed to create test invitation:', error.response?.data || error.message);
        return null;
    }
}

// Main test function
async function runCompleteTest() {
    try {
        // Step 1: Login both users
        console.log('='.repeat(60));
        console.log('STEP 1: USER AUTHENTICATION');
        console.log('='.repeat(60));

        const factoryAuth = await loginUser(FACTORY_USER.username, FACTORY_USER.password, 'Factory');
        const hhmAuth = await loginUser(HHM_USER.username, HHM_USER.password, 'HHM');

        if (!factoryAuth || !hhmAuth) {
            console.error('❌ Authentication failed. Cannot proceed with tests.');
            return;
        }

        factoryToken = factoryAuth.token;
        hhmToken = hhmAuth.token;
        factoryUserId = factoryAuth.userId;
        hhmUserId = hhmAuth.userId;

        // Step 2: Test current API endpoints
        console.log('\n' + '='.repeat(60));
        console.log('STEP 2: TESTING CURRENT API ENDPOINTS');
        console.log('='.repeat(60));

        const sentInvitations = await testFactoryMyRequests();
        const receivedInvitations = await testFactoryReceivedApplications();

        // Step 3: Create test data if needed
        console.log('\n' + '='.repeat(60));
        console.log('STEP 3: CREATING TEST DATA');
        console.log('='.repeat(60));

        const testInvitation = await createTestInvitation();

        // Step 4: Test APIs again to see new data
        if (testInvitation) {
            console.log('\n' + '='.repeat(60));
            console.log('STEP 4: RE-TESTING AFTER CREATING TEST DATA');
            console.log('='.repeat(60));

            await testFactoryReceivedApplications();
        }

        // Step 5: Frontend testing instructions
        console.log('\n' + '='.repeat(60));
        console.log('STEP 5: FRONTEND TESTING INSTRUCTIONS');
        console.log('='.repeat(60));

        console.log(`
🌐 FRONTEND TESTING:
1. Open browser: ${FRONTEND_URL}
2. Login as Factory: ${FACTORY_USER.username} / ${FACTORY_USER.password}
3. Go to "HHM Directory" 
4. Test these tabs:
   ✅ "My Requests" - should show invitations sent by factory
   ✅ "Received Applications" - should show invitations from HHMs
5. Open browser console (F12) to see debug logs

🔍 DEBUG LOGS TO LOOK FOR:
- 🔍 Fetching factory sent invitations...
- 🔍 My Requests response: {...}
- 🔍 Fetching factory received invitations...
- 🔍 Received Applications response: {...}

📊 EXPECTED RESULTS:
- Both tabs should load without errors
- If data exists, it should be displayed
- Console should show successful API calls
- No "empty" screens (unless legitimately no data)
        `);

        console.log('\n' + '='.repeat(60));
        console.log('✅ COMPREHENSIVE TEST COMPLETED!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Test execution failed:', error);
    }
}

// Run the test
runCompleteTest().catch(console.error);