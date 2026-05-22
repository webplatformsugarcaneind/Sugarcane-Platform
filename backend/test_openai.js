require('dotenv').config();
const axios = require('axios');

async function test() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    console.error('No GOOGLE_API_KEY in env — set it in backend/.env to test Gemini');
    process.exit(1);
  }

  const model = process.env.GOOGLE_MODEL || 'gemini-3.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generate?key=${key}`;

  try {
    console.log('Sending Gemini request to:', url);
    const payload = {
      prompt: { text: 'You are a test assistant. Say hello in one sentence.' },
      maxOutputTokens: 60
    };
    console.log('Payload:', JSON.stringify(payload).slice(0, 500));

    const resp = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });

    // Try common response shapes
    let text = null;
    if (resp.data) {
      if (Array.isArray(resp.data.candidates) && resp.data.candidates.length > 0) {
        const cand = resp.data.candidates[0];
        text = cand.output || cand.content || cand.text || null;
      }
      if (!text && Array.isArray(resp.data.output) && resp.data.output.length > 0) {
        text = resp.data.output.map(o => o.content || o.text || '').join('\n').trim();
      }
      if (!text) text = resp.data.text || resp.data.outputText || null;
    }

    console.log('Gemini OK:', text || JSON.stringify(resp.data).slice(0, 200));
  } catch (err) {
    if (err.response) {
      console.error('Gemini response error:', err.response.status, err.response.data);
    } else {
      console.error('Gemini request error:', err.message);
    }
    process.exit(1);
  }
}

test();
