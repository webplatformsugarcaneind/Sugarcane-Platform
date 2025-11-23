# 🚀 Quick Deployment Reference

## ⚡ **One-Time Setup (Before First Deployment)**

### 1. Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Fix ALL Hardcoded URLs in Frontend

**Files that MUST be updated manually (31 instances):**

- `MarketplacePage.jsx` (13 URLs)
- `MarketplacePageNew.jsx` (3 URLs)  
- `ListingDetailsPage.jsx` (7 URLs)
- `FarmerPublicProfilePage.jsx` (3 URLs)
- `FarmerContractRequestPage.jsx` (2 URLs)
- `FarmerContractsDashboard.jsx` (1 URL)
- `HHMContractDashboard.jsx` (2 URLs)
- `MyListingsDashboard.jsx` (3 URLs)

**Quick Fix with VS Code:**

1. Press `Ctrl+Shift+H`
2. Find: `http://localhost:5000/api/`
3. Replace: `/api/`
4. Add to each file:

```javascript
import { configureAxios } from '../config/api';
import axios from 'axios';
configureAxios(axios);
```

---

## 🎯 **Backend Deployment (Render)**

### Deploy Settings

```yaml
Name: sugarcane-platform-backend
Environment: Node
Build: npm install
Start: npm start
Root Directory: backend
```

### Environment Variables

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://sugarcaneindust_db_user:SPwfT2cbfK5Vwhmn@cluster0.deosgdg.mongodb.net/sugarcane_platform?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=<your-generated-secret-here>
CORS_ORIGIN=https://your-app.netlify.app
```

**Backend URL**: `https://sugarcane-platform-backend.onrender.com`

---

## 🎨 **Frontend Deployment (Netlify)**

### 1. Update Environment Variable

Create or update `frontend/.env`:

```env
VITE_API_URL=https://sugarcane-platform-backend.onrender.com
```

### 2. Deploy Settings

```yaml
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### 3. Environment Variable in Netlify

```
VITE_API_URL=https://sugarcane-platform-backend.onrender.com
```

### 4. Deploy

```bash
cd frontend
npm run build  # Test locally first
netlify deploy --prod
```

---

## ✅ **Post-Deployment Checklist**

1. [ ] Backend health check: `curl https://your-backend.onrender.com/api/health`
2. [ ] Update backend `CORS_ORIGIN` with actual Netlify URL
3. [ ] Test frontend login/signup
4. [ ] Check browser console for errors
5. [ ] Verify API calls go to Render (not localhost)

---

## 🐛 **Common Issues & Quick Fixes**

| Issue | Solution |
|-------|----------|
| CORS errors | Update `CORS_ORIGIN` in Render with your Netlify URL |
| Can't connect to backend | Check `VITE_API_URL` in Netlify env vars |
| 404 on API calls | Ensure all `localhost:5000` are removed |
| MongoDB connection failed | Whitelist `0.0.0.0/0` in Atlas Network Access |
| Build fails | Run `npm install` and `npm run build` locally first |

---

## 📋 **Important URLs**

- **Render Dashboard**: <https://dashboard.render.com>
- **Netlify Dashboard**: <https://app.netlify.com>
- **MongoDB Atlas**: <https://cloud.mongodb.com>
- **Backend Health Check**: `https://your-backend.onrender.com/api/health`
- **Frontend**: `https://your-app.netlify.app`

---

## 🔄 **Update Deployment**

### Backend

```bash
git push origin main  # Render auto-deploys
```

### Frontend

```bash
cd frontend
npm run build
netlify deploy --prod
```

---

**Need full guide?** See `DEPLOYMENT_GUIDE.md` for detailed instructions.
