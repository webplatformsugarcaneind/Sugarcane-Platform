const mongoose = require('mongoose');
const axios = require('axios');

// Test data
const FACTORY_CREDENTIALS = {
  identifier: 'deepakfactory',
  password: '123456'
};

const BASE_URL = 'http://localhost:5000';

async function testClearNotifications() {
  try {
    console.log('🧪 TESTING CLEAR NOTIFICATIONS FUNCTIONALITY');
    console.log('='.repeat(50));

    // Step 1: Login as factory
    console.log('\n📝 Step 1: Logging in as factory...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, FACTORY_CREDENTIALS);
    
    console.log('Full login response:', JSON.stringify(loginResponse.data, null, 2));
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    // Check if data is nested under data property
    const loginData = loginResponse.data.data || loginResponse.data;
    const token = loginData.token || loginResponse.data.token;
    const factoryUser = loginData.user || loginResponse.data.user;
    
    if (!token) {
      throw new Error('No token received in login response');
    }
    
    console.log(`✅ Logged in successfully, token received`);

    // Step 2: Get current notifications
    console.log('\n📨 Step 2: Getting current notifications...');
    const notificationsResponse = await axios.get(`${BASE_URL}/api/factory/received-invitations`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const notifications = notificationsResponse.data.data || [];
    console.log(`📊 Current notifications: ${notifications.length}`);
    
    if (notifications.length === 0) {
      console.log('⚠️  No notifications to clear. Test complete.');
      return;
    }

    notifications.forEach((notification, index) => {
      console.log(`  ${index + 1}. ${notification.hhmId?.name || 'Unknown HHM'} - Status: ${notification.status}`);
    });

    // Step 3: Test clearing single notification
    if (notifications.length > 0) {
      console.log('\n🗑️  Step 3: Testing single notification clear...');
      const firstNotification = notifications[0];
      
      const clearSingleResponse = await axios.delete(
        `${BASE_URL}/api/factory/notifications/${firstNotification._id}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (clearSingleResponse.data.success) {
        console.log(`✅ Single notification cleared: ${firstNotification._id}`);
        console.log(`📅 Cleared at: ${clearSingleResponse.data.data.clearedAt}`);
      } else {
        console.log(`❌ Failed to clear single notification: ${clearSingleResponse.data.message}`);
      }
    }

    // Step 4: Test clearing all notifications (if any remain)
    console.log('\n🗑️  Step 4: Testing clear all notifications...');
    const clearAllResponse = await axios.delete(`${BASE_URL}/api/factory/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (clearAllResponse.data.success) {
      console.log(`✅ Clear all result: ${clearAllResponse.data.message}`);
      console.log(`📊 Notifications cleared: ${clearAllResponse.data.data.clearedCount}`);
      console.log(`📅 Cleared at: ${clearAllResponse.data.data.clearedAt}`);
    } else {
      console.log(`❌ Failed to clear all notifications: ${clearAllResponse.data.message}`);
    }

    // Step 5: Verify no notifications remain
    console.log('\n✅ Step 5: Verifying notifications were cleared...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/factory/received-invitations`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const remainingNotifications = verifyResponse.data.data || [];
    console.log(`📊 Remaining notifications: ${remainingNotifications.length}`);

    if (remainingNotifications.length === 0) {
      console.log('🎉 SUCCESS: All notifications cleared from database!');
    } else {
      console.log('⚠️  Some notifications still remain:');
      remainingNotifications.forEach((notification, index) => {
        console.log(`  ${index + 1}. ${notification.hhmId?.name || 'Unknown HHM'} - Status: ${notification.status}`);
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('🧪 CLEAR NOTIFICATIONS TEST COMPLETE');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response?.data) {
      console.error('📄 Error details:', error.response.data);
    }
  }
}

// Run the test
testClearNotifications();