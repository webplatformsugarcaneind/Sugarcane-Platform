const axios = require('axios');

async function test() {
  try {
    const googleKey = 'AIzaSyCzsCrXNQWvIAHPl06BoMLcw8wChFs_39o';
    const googleModel = 'gemini-3.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:generateContent?key=${googleKey}`;
    
    const contents = [
      { parts: [{ text: "Context file 1" }], role: "user" },
      { parts: [{ text: "Context file 2" }], role: "user" },
      { parts: [{ text: "Hello" }], role: "user" }
    ];
    
    const payload = {
      contents,
      generationConfig: { maxOutputTokens: 1500 }
    };
    
    console.log('Calling Gemini v1beta with multiple user roles...');
    const res = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
    console.log('Success payload:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('API Error:', err.response ? JSON.stringify(err.response.data, null, 2) : err.message);
  }
}

test();
