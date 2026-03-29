// Test if the getHHMById route is working
const axios = require('axios');

// Get a token first (login as factory user)
async function testHHMProfile() {
    try {
        console.log('Testing HHM Profile endpoint...\n');

        // First login to get token
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            identifier: 'testFactory1',
            password: 'password123'
        });

        const token = loginResponse.data.token;
        console.log('✓ Logged in successfully');

        // Get HHMs list to find an ID
        const hhmsResponse = await axios.get('http://localhost:5000/api/factory/hhms', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(`✓ Found ${hhmsResponse.data.data.length} HHMs`);

        if (hhmsResponse.data.data.length > 0) {
            const firstHHM = hhmsResponse.data.data[0];
            console.log(`\nTesting with HHM: ${firstHHM.name} (${firstHHM._id})`);

            // Try to get individual HHM profile
            const profileResponse = await axios.get(`http://localhost:5000/api/factory/hhms/${firstHHM._id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('\n✅ SUCCESS! HHM Profile endpoint is working');
            console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
        } else {
            console.log('❌ No HHMs found in directory');
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testHHMProfile();
