const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testJobApplication() {
  try {
    console.log('🧪 Testing Job Application Process...\n');

    // Step 1: Login as worker
    console.log('1️⃣ Login as worker...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      identifier: 'meenalabour',
      password: '123456'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    console.log('📋 Token:', token ? 'Present' : 'Missing');
    console.log('');

    // Step 2: Get worker profile to verify availability
    console.log('2️⃣ Checking worker profile...');
    const profileResponse = await axios.get(`${API_URL}/worker/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📋 Worker availability:', profileResponse.data.data?.availability || 'Not set');
    console.log('📋 Worker name:', profileResponse.data.data?.name || 'Not set');
    console.log('📋 Worker ID:', profileResponse.data.data?._id || 'Not set');
    console.log('');

    // Step 3: Get available jobs
    console.log('3️⃣ Fetching available jobs...');
    const jobsResponse = await axios.get(`${API_URL}/worker/jobs`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!jobsResponse.data.data || jobsResponse.data.data.length === 0) {
      console.log('⚠️ No jobs available to apply for');
      return;
    }

    const job = jobsResponse.data.data[0];
    console.log('✅ Found job:', job.title);
    console.log('📋 Job ID:', job._id);
    console.log('📋 HHM:', job.hhmId?.name || 'N/A');
    console.log('');

    // Step 4: Apply for the job
    console.log('4️⃣ Applying for the job...');
    const applicationData = {
      scheduleId: job._id,
      applicationMessage: 'I am interested in this position',
      workerSkills: ['Harvesting', 'General Farm Work'],
      experience: '2 years of farm work',
      expectedWage: job.wageOffered || 500,
      availability: 'flexible'
    };

    console.log('📤 Application data:', JSON.stringify(applicationData, null, 2));
    console.log('');

    const applicationResponse = await axios.post(
      `${API_URL}/worker/applications`,
      applicationData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Application submitted successfully!');
    console.log('📋 Application ID:', applicationResponse.data.data._id);
    console.log('📋 Status:', applicationResponse.data.data.status);

  } catch (error) {
    console.error('❌ Login Error:', error.message);
    if (error.response?.data) {
      console.error('📋 Error Response:', error.response.data);
    }
    if (error.code) {
      console.error('📋 Error Code:', error.code);
    }
  }
}

testJobApplication();
