# Enabling Gemini (Google Generative Language) for the chatbot

Steps to enable Gemini for the backend chatbot integration:

1. Copy the example env file into a real `.env` in `backend/`:

```powershell
cd backend
cp .env.example .env
```

2. Edit `backend/.env` and set your `GOOGLE_API_KEY` (do NOT commit this key):

```
GOOGLE_API_KEY=your_real_key_here
USE_GEMINI=true
GOOGLE_MODEL=text-bison-001
```

3. Restart the server (from project root or `backend/`):

```powershell
cd backend
node server.js
# or, if you use npm start:
npm run start
```

4. Verify with the test script:

```powershell
cd backend
node test_openai.js
# Successful Gemini response will print: "Gemini OK: ..."
```

Notes:
- The code already prefers Gemini when `USE_GEMINI=true` or when `GOOGLE_API_KEY` is present.
- Keep your API key secret; do not commit `.env` to source control.
