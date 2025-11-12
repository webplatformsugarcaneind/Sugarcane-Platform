/**
 * Test script to verify factory notifications API
 */
const axios = require('axios');

async function testFactoryNotifications() {
    try {
        console.log('🧪 TESTING FACTORY NOTIFICATIONS API\n');

        // First, let's get a factory user token by logging in
        console.log('1️⃣ Logging in as Factory user...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            identifier: 'anita.joshi@example.com', // Factory user with pending invitations
            password: '123456'
        });

        if (!loginResponse.data.success) {
            console.log('❌ Failed to login as Factory user');
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Successfully logged in as Factory user');

        // Now test the received invitations endpoint
        console.log('\n2️⃣ Fetching received invitations...');
        const notificationsResponse = await axios.get('http://localhost:5000/api/factory/received-invitations', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('\n📊 API Response:');
        console.log('Success:', notificationsResponse.data.success);
        console.log('Count:', notificationsResponse.data.count);
        console.log('Total:', notificationsResponse.data.total);
        console.log('Data type:', typeof notificationsResponse.data.data);
        console.log('Data is array:', Array.isArray(notificationsResponse.data.data));

        if (notificationsResponse.data.data && notificationsResponse.data.data.length > 0) {
            console.log('\n📨 Sample Invitation:');
            const sample = notificationsResponse.data.data[0];
            console.log('ID:', sample._id);
            console.log('Type:', sample.invitationType);
            console.log('Status:', sample.status);
            console.log('HHM ID:', sample.hhmId?._id);
            console.log('HHM Name:', sample.hhmId?.name);
            console.log('Factory ID:', sample.factoryId);
            console.log('Personal Message:', sample.personalMessage);
            console.log('Sent At:', sample.sentAt);
        } else {
            console.log('\n📭 No invitations found for this Factory user');
        }

        // Test with different factory users
        console.log('\n3️⃣ Testing with Priya Singh (another factory user)...');
        const loginResponse2 = await axios.post('http://localhost:5000/api/auth/login', {
            identifier: 'priya.singh@example.com',
            password: 'password123'
        });

        if (loginResponse2.data.success) {
            const token2 = loginResponse2.data.token;
            const notificationsResponse2 = await axios.get('http://localhost:5000/api/factory/received-invitations', {
                headers: {
                    Authorization: `Bearer ${token2}`
                }
            });

            console.log('Priya Singh invitations count:', notificationsResponse2.data.count);
            if (notificationsResponse2.data.count > 0) {
                console.log('✅ Priya Singh has', notificationsResponse2.data.count, 'invitations');
            } else {
                console.log('📭 Priya Singh has no invitations');
            }
        }

    } catch (error) {
        console.error('❌ Error testing notifications:', error.message);
        if (error.response?.data) {
            console.error('Response data:', error.response.data);
        }
    }
}

testFactoryNotifications();