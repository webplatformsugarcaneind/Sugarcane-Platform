const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials
const FACTORY_USER = {
    username: 'testfactory1',
    password: 'password123'
};

const HHM_USER = {
    username: 'testhhm1',
    password: 'password123'
};

let factoryToken = '';
let hhmToken = '';
let testHhmId = '';
let testFactoryId = '';

// Helper function to login
async function login(credentials) {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        return response.data.token;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        throw error;
    }
}

// Test 1: Factory Bulk Invite
async function testFactoryBulkInvite() {
    console.log('\n📨 TEST 1: Factory Bulk Invite to Multiple HHMs');
    console.log('='.repeat(60));

    try {
        // Get all HHMs first
        const hhmsResponse = await axios.get(`${API_URL}/factory/hhms`, {
            headers: { Authorization: `Bearer ${factoryToken}` }
        });

        const hhmIds = hhmsResponse.data.data.slice(0, 2).map(hhm => hhm._id);
        console.log(`Found ${hhmIds.length} HHMs to invite:`, hhmIds);

        // Send bulk invitation
        const response = await axios.post(
            `${API_URL}/factory/invite-multiple-hhms`,
            {
                hhmIds: hhmIds,
                personalMessage: 'Bulk invitation test from factory',
                invitationReason: 'Testing bulk invitation feature'
            },
            {
                headers: { Authorization: `Bearer ${factoryToken}` }
            }
        );

        console.log('✅ Bulk Invitation Result:');
        console.log('   Successful:', response.data.data.successful.length);
        console.log('   Failed:', response.data.data.failed.length);
        console.log('   Skipped:', response.data.data.skipped.length);
        console.log('   Details:', JSON.stringify(response.data.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Test 2: HHM Invite Single Factory
async function testHHMInviteFactory() {
    console.log('\n📨 TEST 2: HHM Invite Single Factory');
    console.log('='.repeat(60));

    try {
        const response = await axios.post(
            `${API_URL}/hhm/invite-factory`,
            {
                factoryId: testFactoryId,
                personalMessage: 'Hello from HHM!',
                invitationReason: 'Looking for partnership opportunities'
            },
            {
                headers: { Authorization: `Bearer ${hhmToken}` }
            }
        );

        console.log('✅ Invitation sent successfully!');
        console.log('   Invitation ID:', response.data.data._id);
        console.log('   Status:', response.data.data.status);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Test 3: HHM Bulk Invite Multiple Factories
async function testHHMBulkInviteFactories() {
    console.log('\n📨 TEST 3: HHM Bulk Invite to Multiple Factories');
    console.log('='.repeat(60));

    try {
        // For testing, use the same factory ID multiple times (will be skipped after first)
        const factoryIds = [testFactoryId];

        const response = await axios.post(
            `${API_URL}/hhm/invite-multiple-factories`,
            {
                factoryIds: factoryIds,
                personalMessage: 'Bulk invitation test from HHM',
                invitationReason: 'Testing bulk factory invitation feature'
            },
            {
                headers: { Authorization: `Bearer ${hhmToken}` }
            }
        );

        console.log('✅ Bulk Invitation Result:');
        console.log('   Successful:', response.data.data.successful.length);
        console.log('   Failed:', response.data.data.failed.length);
        console.log('   Skipped:', response.data.data.skipped.length);
        console.log('   Details:', JSON.stringify(response.data.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Test 4: Get HHM's Sent Factory Invitations
async function testGetHHMFactoryInvitations() {
    console.log('\n📋 TEST 4: Get HHM Sent Factory Invitations');
    console.log('='.repeat(60));

    try {
        const response = await axios.get(`${API_URL}/hhm/my-factory-invitations`, {
            headers: { Authorization: `Bearer ${hhmToken}` }
        });

        console.log('✅ Found invitations:', response.data.count);
        console.log('   Invitations:', JSON.stringify(response.data.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Bidirectional Invitation System Tests');
    console.log('='.repeat(60));

    try {
        // Step 1: Login as Factory
        console.log('\n🔐 Logging in as Factory...');
        factoryToken = await login(FACTORY_USER);
        console.log('✅ Factory logged in successfully');

        // Get factory user ID
        const factoryProfile = await axios.get(`${API_URL}/factory/profile`, {
            headers: { Authorization: `Bearer ${factoryToken}` }
        });
        testFactoryId = factoryProfile.data.data._id;
        console.log('   Factory ID:', testFactoryId);

        // Step 2: Login as HHM
        console.log('\n🔐 Logging in as HHM...');
        hhmToken = await login(HHM_USER);
        console.log('✅ HHM logged in successfully');

        // Get HHM user ID
        const hhmProfile = await axios.get(`${API_URL}/hhm/profile`, {
            headers: { Authorization: `Bearer ${hhmToken}` }
        });
        testHhmId = hhmProfile.data.data._id;
        console.log('   HHM ID:', testHhmId);

        // Run tests
        await testFactoryBulkInvite();
        await testHHMInviteFactory();
        await testHHMBulkInviteFactories();
        await testGetHHMFactoryInvitations();

        console.log('\n✅ All tests completed!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
    }
}

// Run tests
runAllTests();
