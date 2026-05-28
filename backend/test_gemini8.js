const axios = require('axios');

async function test() {
  try {
    const googleKey = 'AIzaSyCzsCrXNQWvIAHPl06BoMLcw8wChFs_39o';
    const googleModel = 'gemini-3.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent?key=${googleKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: "Hello, what is the price of cane?" }], role: "user" }],
      generationConfig: { maxOutputTokens: 1500 }
    };
    
    console.log('Calling Gemini v1beta with 3.5-flash...');
    const res = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
    console.log('Success payload:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('API Error:', err.response ? err.response.data : err.message);
  }
}

test();
