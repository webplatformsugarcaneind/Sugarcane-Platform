const axios = require('axios');

async function testBackend() {
  try {
    const res = await axios.post('http://localhost:5000/api/chatbot/send-message', {
      message: 'tell me hhm name from solapur',
      sessionId: 'test1234',
      isPublic: true
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testBackend();
