/**
 * Test script to verify Factory HHM Directory API endpoints
 */
const axios = require('axios');

async function testFactoryHHMDirectoryEndpoints() {
    try {
        console.log('🧪 TESTING FACTORY HHM DIRECTORY API ENDPOINTS\n');

        // Login as a Factory user
        console.log('1️⃣ Logging in as Factory user...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            identifier: 'anitafactory', // Using username instead
            password: '123456'
        });

        if (!loginResponse.data.success) {
            console.log('❌ Failed to login as Factory user:', loginResponse.data.message);
            
            // Try with different credentials
            console.log('Trying with different credentials...');
            const loginResponse2 = await axios.post('http://localhost:5000/api/auth/login', {
                identifier: 'priyafactory',
                password: '123456'
            });

            if (!loginResponse2.data.success) {
                console.log('❌ Failed to login with backup credentials');
                console.log('💡 Please create a test Factory user or check credentials');
                return;
            }
            
            var token = loginResponse2.data.token;
            console.log('✅ Successfully logged in as priyafactory');
        } else {
            var token = loginResponse.data.token;
            console.log('✅ Successfully logged in as anitafactory');
        }

        // Test 1: Get sent invitations (My Requests)
        console.log('\n2️⃣ Testing /api/factory/invitations (My Requests)...');
        try {
            const sentInvitationsResponse = await axios.get('http://localhost:5000/api/factory/invitations', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('📊 Sent Invitations API Response:');
            console.log('Success:', sentInvitationsResponse.data.success);
            console.log('Count:', sentInvitationsResponse.data.count);
            console.log('Total:', sentInvitationsResponse.data.total);
            console.log('Data type:', typeof sentInvitationsResponse.data.data);
            console.log('Data is array:', Array.isArray(sentInvitationsResponse.data.data));
            
            if (sentInvitationsResponse.data.data && sentInvitationsResponse.data.data.length > 0) {
                console.log('✅ Found', sentInvitationsResponse.data.count, 'sent invitations');
                const sample = sentInvitationsResponse.data.data[0];
                console.log('Sample invitation:', {
                    id: sample._id,
                    type: sample.invitationType,
                    status: sample.status,
                    hhmId: sample.hhmId
                });
            } else {
                console.log('📭 No sent invitations found');
            }
        } catch (err) {
            console.log('❌ Error testing sent invitations:', err.response?.data?.message || err.message);
        }

        // Test 2: Get received invitations (Received Applications)
        console.log('\n3️⃣ Testing /api/factory/received-invitations (Received Applications)...');
        try {
            const receivedInvitationsResponse = await axios.get('http://localhost:5000/api/factory/received-invitations', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('📊 Received Invitations API Response:');
            console.log('Success:', receivedInvitationsResponse.data.success);
            console.log('Count:', receivedInvitationsResponse.data.count);
            console.log('Total:', receivedInvitationsResponse.data.total);
            console.log('Data type:', typeof receivedInvitationsResponse.data.data);
            console.log('Data is array:', Array.isArray(receivedInvitationsResponse.data.data));

            if (receivedInvitationsResponse.data.data && receivedInvitationsResponse.data.data.length > 0) {
                console.log('✅ Found', receivedInvitationsResponse.data.count, 'received invitations');
                const sample = receivedInvitationsResponse.data.data[0];
                console.log('Sample received invitation:', {
                    id: sample._id,
                    type: sample.invitationType,
                    status: sample.status,
                    hhmId: sample.hhmId
                });
            } else {
                console.log('📭 No received invitations found');
            }
        } catch (err) {
            console.log('❌ Error testing received invitations:', err.response?.data?.message || err.message);
        }

        console.log('\n🎯 SUMMARY:');
        console.log('• API endpoints are working if no errors above');
        console.log('• Empty results are normal if no invitations exist');
        console.log('• Frontend should now display data correctly');
        console.log('• Check browser console for debug logs');

    } catch (error) {
        console.error('❌ Error testing Factory HHM Directory endpoints:', error.message);
        if (error.response?.data) {
            console.error('Response data:', error.response.data);
        }
    }
}

testFactoryHHMDirectoryEndpoints();