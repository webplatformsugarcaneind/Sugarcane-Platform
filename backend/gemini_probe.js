require('dotenv').config();
const axios = require('axios');

const key = process.env.GOOGLE_API_KEY;
const model = process.env.GOOGLE_MODEL || 'gemini-3.5-flash';
const base = `https://generativelanguage.googleapis.com/v1/models/${model}`;
const endpoints = [':generate', ':generateContent', ':generateText', ':predict', '/v1/models:generateContent'];

const payloads = [
  { prompt: { text: 'Say hello in one sentence.' }, maxOutputTokens: 60 },
  { input: 'Say hello in one sentence.' },
  { instances: [{ input: 'Say hello in one sentence.' }] },
  { messages: [{ role: 'user', content: [{ text: 'Say hello in one sentence.' }] }] },
  { instructions: 'Say hello in one sentence.' },
  { input: [{ text: 'Say hello in one sentence.' }] },
  { model, contents: 'Say hello in one sentence.' },
  { model, contents: ['Say hello in one sentence.'] },
  { model, contents: [{ type: 'text', text: 'Say hello in one sentence.' }] }
];
  // Add structured Content payloads
  payloads.push(
    { contents: [{ parts: [{ text: 'Say hello in one sentence.' }], role: 'user' }], maxOutputTokens: 60 },
    { contents: [{ parts: [{ text: 'Say hello in one sentence.' }], role: 'user' }], generationConfig: { maxOutputTokens: 60 } }
  );

(async () => {
  if (!key) { console.error('No GOOGLE_API_KEY'); process.exit(1); }
  for (const ep of endpoints) {
    for (const p of payloads) {
      const url = `${base}${ep}?key=${key}`;
      try {
        const resp = await axios.post(url, p, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
        console.log('SUCCESS', ep, 'payload:', JSON.stringify(p));
        console.log('RESPONSE:', JSON.stringify(resp.data).slice(0,1000));
        process.exit(0);
      } catch (err) {
        const status = err.response ? err.response.status : err.code || 'ERR';
        const data = err.response && err.response.data ? JSON.stringify(err.response.data).slice(0,500) : err.message;
        console.log('FAIL', ep, 'status', status, 'data', data);
        // continue
      }
    }
  }
  console.error('No payload/endpoint succeeded');
})();
