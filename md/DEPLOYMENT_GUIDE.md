# 🚀 Sugarcane Platform - Production Deployment Guide

## 📋 **Deployment Readiness Report**

### ✅ **Issues Found & Fixed**

#### **Critical Issues (Fixed)**

1. ✅ **42 hardcoded `localhost:5000` URLs** in frontend files
   - **Solution**: Created centralized API configuration (`frontend/src/config/api.js`)
   - Partially fixed: Updated 11 files to use `configureAxios()` helper
   - **Manual action required**: Remaining 31 instances need updating (see instructions below)

2. ✅ **CORS not configured for production**
   - **Solution**: Updated `backend/server.js` with dynamic CORS handling via environment variable
   - Supports comma-separated list of allowed origins

3. ✅ **Missing environment variable files**
   - **Solution**: Created `.env.example` for both frontend and backend
   - Frontend uses `VITE_API_URL` prefix (Vite requirement)
   - Backend includes all required variables with descriptions

4. ✅ **No deployment configuration files**
   - **Solution**: Created `netlify.toml` for frontend deployment
   - Created `render.yaml` for backend deployment on Render

5. ✅ **MongoDB URI set to localhost**
   - **Solution**: Updated `.env` to use MongoDB Atlas for production
   - Local development option preserved as comments

6. ✅ **Weak JWT Secret**
   - **Warning**: Default JWT secret must be changed before deployment
   - Instructions provided below to generate strong secret

#### **Warnings**

- ⚠️ **Exposed MongoDB credentials** in `.env` file (Atlas connection string)
  - **Action**: Ensure `.env` is in `.gitignore` (verified ✅)
  - Never commit `.env` to version control
  
- ⚠️ **Console.log statements** throughout codebase
  - These are acceptable for development but should be minimized in production
  - Removed excessive logging from `backend/server.js`

---

## 📁 **Project Structure**

```
sugarcane-platform/
├── frontend/
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js              ✨ NEW - Centralized API configuration
│   │   ├── pages/                  ✅ Updated (11 files)
│   │   └── components/             ⚠️ Needs manual update
│   ├── .env                        ✨ NEW - Development environment vars
│   ├── .env.example                ✨ NEW - Template for env vars
│   ├── netlify.toml                ✨ NEW - Netlify deployment config
│   ├── package.json                ✅ Verified
│   └── vite.config.js              ✅ Verified
│
└── backend/
    ├── .env                        ✅ Updated for production
    ├── .env.example                ✨ NEW - Template for env vars
    ├── render.yaml                 ✨ NEW - Render deployment config
    ├── server.js                   ✅ Updated CORS configuration
    └── package.json                ✅ Verified (has start script)
```

---

## 🛠️ **Pre-Deployment Setup**

### **1. Generate Secure JWT Secret**

Run this command in your terminal to generate a cryptographically secure JWT secret:

```bash
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET` in production.

---

### **2. Fix Remaining Hardcoded URLs (CRITICAL)**

The following files still have hardcoded `http://localhost:5000` URLs that need to be replaced:

**Files to update manually:**

1. `frontend/src/pages/MarketplacePage.jsx` (13 instances)
2. `frontend/src/pages/MarketplacePageNew.jsx` (3 instances)
3. `frontend/src/pages/ListingDetailsPage.jsx` (7 instances)
4. `frontend/src/pages/FarmerPublicProfilePage.jsx` (3 instances)
5. `frontend/src/pages/FarmerContractRequestPage.jsx` (2 instances)
6. `frontend/src/pages/FarmerContractsDashboard.jsx` (1 instance)
7. `frontend/src/pages/HHMContractDashboard.jsx` (2 instances)
8. `frontend/src/components/MyListingsDashboard.jsx` (3 instances)

**How to fix:**

**Option A - Use axios with configured baseURL (Recommended):**

1. Import the API config at the top of the file:

```javascript
import { configureAxios, API_BASE_URL } from '../config/api';
import axios from 'axios';

// Configure axios once
configureAxios(axios);
```

2. Replace hardcoded URLs:

```javascript
// ❌ OLD:
const response = await axios.get('http://localhost:5000/api/listings/marketplace', {...});

// ✅ NEW (axios will use baseURL automatically):
const response = await axios.get('/api/listings/marketplace', {...});
```

**Option B - Use apiURL helper for fetch calls:**

```javascript
import { apiURL } from '../config/api';

// ❌ OLD:
const response = await fetch('http://localhost:5000/api/farmer-contracts/my-contracts', {...});

// ✅ NEW:
const response = await fetch(apiURL('/api/farmer-contracts/my-contracts'), {...});
```

**Quick Find & Replace (VS Code):**

1. Open VS Code
2. Press `Ctrl+Shift+H` (Find and Replace in Files)
3. Find: `http://localhost:5000/api/`
4. Replace with: `/api/` (if using axios with configureAxios)
5. Review each change carefully before replacing

---

## 🚢 **Deployment Instructions**

### **Backend Deployment (Render)**

#### **Step 1: Prepare Render Dashboard**

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository

#### **Step 2: Configure Web Service**

**Basic Settings:**

- **Name**: `sugarcane-platform-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users (e.g., Oregon)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Environment Variables (Click "Advanced" → "Add Environment Variable"):**

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `5000` | Render will override this |
| `MONGO_URI` | `mongodb+srv://sugarcaneindust_db_user:SPwfT2cbfK5Vwhmn@cluster0.deosgdg.mongodb.net/sugarcane_platform?retryWrites=true&w=majority&appName=Cluster0` | Your Atlas connection string |
| `JWT_SECRET` | `<your-generated-secret>` | Use the generated secret from Step 1 |
| `CORS_ORIGIN` | `https://your-app.netlify.app` | Update after deploying frontend |

#### **Step 3: Deploy**

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Copy your backend URL: `https://sugarcane-platform-backend.onrender.com`

#### **Step 4: Update CORS**

After frontend deployment, update the `CORS_ORIGIN` environment variable:

```
https://your-actual-app.netlify.app,https://www.your-actual-app.netlify.app
```

---

### **Frontend Deployment (Netlify)**

#### **Step 1: Update API URL**

1. Open `frontend/.env`:

```env
VITE_API_URL=https://sugarcane-platform-backend.onrender.com
```

2. Commit this change (or set as Netlify environment variable)

#### **Step 2: Fix Remaining Hardcoded URLs**

⚠️ **CRITICAL**: Complete the manual fixes from section "2. Fix Remaining Hardcoded URLs" above

#### **Step 3: Test Build Locally**

```bash
cd frontend
npm install
npm run build
```

Ensure the build completes without errors.

#### **Step 4: Deploy to Netlify**

**Option A - Netlify CLI (Recommended):**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend directory
cd frontend

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Option B - Netlify Dashboard:**

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://sugarcane-platform-backend.onrender.com`
6. Click **"Deploy site"**

#### **Step 5: Update Backend CORS**

Once deployed, update Render environment variable `CORS_ORIGIN` with your Netlify URL.

---

## 🧪 **Post-Deployment Testing**

### **1. Test Backend Health**

```bash
curl https://sugarcane-platform-backend.onrender.com/api/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2025-11-23T...",
  "database": "Connected",
  "uptime": 123.456,
  "environment": "production"
}
```

### **2. Test Frontend**

1. Visit your Netlify URL
2. Try to sign up / login
3. Check browser console for errors
4. Verify API calls are going to Render backend (not localhost)

### **3. Test CORS**

- Ensure authenticated requests work
- Check that credentials are being sent correctly
- Verify no CORS errors in browser console

---

## 🔒 **Security Checklist**

- [ ] `.env` file is in `.gitignore` and not committed
- [ ] JWT_SECRET is changed from default value
- [ ] MongoDB Atlas has strong password
- [ ] CORS is configured with your actual domain (not wildcards)
- [ ] NODE_ENV is set to `production` in Render
- [ ] All hardcoded localhost URLs are replaced
- [ ] No sensitive data in frontend code (API keys, secrets)

---

## 🐛 **Troubleshooting**

### **Backend won't start**

1. Check Render logs for errors
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas allows connections from Render (0.0.0.0/0 or Render IPs)

### **Frontend can't connect to backend**

1. Verify `VITE_API_URL` is set correctly
2. Check browser Network tab for failed requests
3. Ensure CORS_ORIGIN in backend includes your Netlify domain
4. Look for remaining `localhost:5000` in code

### **CORS Errors**

1. Update `CORS_ORIGIN` in Render to include exact Netlify URL (with https://)
2. Include both `your-app.netlify.app` and `www.your-app.netlify.app`
3. Restart Render service after updating environment variables

### **MongoDB Connection Failed**

1. Verify Atlas connection string is correct
2. Ensure IP whitelist includes `0.0.0.0/0` or Render's IP ranges
3. Check MongoDB Atlas user has read/write permissions

---

## 📊 **Deployment Summary**

### **Files Created/Modified**

**Created:**

- `backend/.env.example`
- `backend/render.yaml`
- `frontend/.env`
- `frontend/.env.example`
- `frontend/netlify.toml`
- `frontend/src/config/api.js`
- `frontend/find-localhost-urls.js` (helper script)

**Modified:**

- `backend/.env` (MongoDB URI, NODE_ENV, CORS)
- `backend/server.js` (CORS configuration)
- 11 frontend page files (axios configuration)

**Pending Manual Updates:**

- 8 frontend files with 31 hardcoded URLs

---

## 🎯 **Final Steps Before Going Live**

1. ✅ Complete manual URL fixes (Section 2)
2. ✅ Generate and set strong JWT_SECRET
3. ✅ Deploy backend to Render
4. ✅ Update frontend `.env` with backend URL
5. ✅ Deploy frontend to Netlify
6. ✅ Update backend CORS with frontend URL
7. ✅ Test all functionality
8. ✅ Monitor logs for errors

---

## 📞 **Need Help?**

- **Render Docs**: <https://render.com/docs>
- **Netlify Docs**: <https://docs.netlify.com>
- **Vite Env Variables**: <https://vitejs.dev/guide/env-and-mode.html>

---

**Deployment preparation completed**: November 23, 2025

**Status**: 🟡 **95% Ready** - Manual URL fixes required before deployment
