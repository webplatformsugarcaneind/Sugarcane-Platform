# ✅ Deployment Checklist - Sugarcane Platform

Copy this checklist and mark items as you complete them.

---

## 🔧 **PRE-DEPLOYMENT (Complete these first)**

### **Code Fixes**

- [ ] Run `cd frontend && node fix-urls.js` to fix hardcoded URLs
- [ ] Review changes made by the script
- [ ] Test frontend locally: `cd frontend && npm run dev`
- [ ] Verify no console errors appear
- [ ] Test API calls work (sign up, login, create listing)

### **Security Setup**

- [ ] Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Copy the generated secret for later use
- [ ] Verify `.env` is in `.gitignore`
- [ ] Ensure no secrets are committed to git

### **MongoDB Atlas**

- [ ] Verify connection string is correct
- [ ] Check Network Access allows connections (0.0.0.0/0 or Render IPs)
- [ ] Verify database user has read/write permissions
- [ ] Test connection: `cd backend && node test-connection.js`

### **Build Test**

- [ ] Test backend: `cd backend && npm install && npm start`
- [ ] Test frontend: `cd frontend && npm install && npm run build`
- [ ] Verify build succeeds without errors

---

## 🚀 **BACKEND DEPLOYMENT (Render)**

### **Create Service**

- [ ] Go to <https://dashboard.render.com>
- [ ] Click "New +" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Select the repository

### **Configure Service**

- [ ] Name: `sugarcane-platform-backend`
- [ ] Environment: `Node`
- [ ] Region: Choose closest to users
- [ ] Branch: `main`
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`

### **Environment Variables**

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `MONGO_URI` = `mongodb+srv://sugarcaneindust_db_user:SPwfT2cbfK5Vwhmn@cluster0.deosgdg.mongodb.net/sugarcane_platform?retryWrites=true&w=majority&appName=Cluster0`
- [ ] `JWT_SECRET` = `<paste-your-generated-secret>`
- [ ] `CORS_ORIGIN` = `http://localhost:5173` (will update later)

### **Deploy & Verify**

- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-15 minutes)
- [ ] Copy your backend URL (e.g., `https://sugarcane-platform-backend.onrender.com`)
- [ ] Test health endpoint:

  ```bash
  curl https://your-backend-url.onrender.com/api/health
  ```

- [ ] Verify response shows "status": "OK"

---

## 🎨 **FRONTEND DEPLOYMENT (Netlify)**

### **Update Configuration**

- [ ] Open `frontend/.env`
- [ ] Update `VITE_API_URL=https://your-backend-url.onrender.com`
- [ ] Save the file

### **Test Build**

- [ ] Run `cd frontend && npm run build`
- [ ] Verify build completes successfully
- [ ] Check `dist/` folder is created

### **Deploy to Netlify**

**Option A: Netlify CLI (Recommended)**

- [ ] Install CLI: `npm install -g netlify-cli`
- [ ] Login: `netlify login`
- [ ] Navigate to frontend: `cd frontend`
- [ ] Deploy: `netlify deploy --prod`
- [ ] Follow prompts, select/create site
- [ ] Copy your Netlify URL

**Option B: Netlify Dashboard**

- [ ] Go to <https://app.netlify.com>
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Connect GitHub repository
- [ ] Configure:
  - Base directory: `frontend`
  - Build command: `npm run build`
  - Publish directory: `frontend/dist`
- [ ] Add environment variable:
  - Key: `VITE_API_URL`
  - Value: `https://your-backend-url.onrender.com`
- [ ] Click "Deploy site"
- [ ] Wait for deployment
- [ ] Copy your Netlify URL

### **Verify Frontend**

- [ ] Visit your Netlify URL
- [ ] Check that site loads without errors
- [ ] Open browser DevTools → Console (no errors)
- [ ] Open browser DevTools → Network tab
- [ ] Try to sign up or login
- [ ] Verify API calls go to Render backend (not localhost)

---

## 🔄 **FINAL CONFIGURATION**

### **Update Backend CORS**

- [ ] Go to Render dashboard
- [ ] Open your backend service
- [ ] Click "Environment"
- [ ] Update `CORS_ORIGIN` to:

  ```
  https://your-actual-app.netlify.app,https://www.your-actual-app.netlify.app
  ```

- [ ] Click "Save Changes"
- [ ] Service will automatically restart

### **Test CORS**

- [ ] Refresh your frontend
- [ ] Try login/signup again
- [ ] Verify no CORS errors in console
- [ ] Test creating a listing
- [ ] Test viewing listings
- [ ] Test all major features

---

## ✅ **POST-DEPLOYMENT VERIFICATION**

### **Backend Health**

- [ ] Health check responds: `curl https://your-backend.onrender.com/api/health`
- [ ] Response includes database: "Connected"
- [ ] No errors in Render logs

### **Frontend Functionality**

- [ ] Homepage loads correctly
- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create listings
- [ ] Can view listings
- [ ] Can place orders
- [ ] Navigation works
- [ ] Mobile view works

### **API Integration**

- [ ] All API calls use production backend
- [ ] No `localhost` references in Network tab
- [ ] Authentication works (JWT tokens)
- [ ] Protected routes work
- [ ] CORS allows requests

### **Browser Console**

- [ ] No JavaScript errors
- [ ] No CORS errors
- [ ] No failed network requests
- [ ] No 404 errors

---

## 🎉 **SUCCESS CRITERIA**

All boxes above are checked? Congratulations! 🎊

Your Sugarcane Platform is now live in production!

**Backend**: <https://your-backend.onrender.com>  
**Frontend**: <https://your-app.netlify.app>  
**Database**: MongoDB Atlas

---

## 📋 **SAVE THESE FOR REFERENCE**

### **Important URLs**

```
Backend URL: https://________________.onrender.com
Frontend URL: https://________________.netlify.app
MongoDB Atlas: https://cloud.mongodb.com
Render Dashboard: https://dashboard.render.com
Netlify Dashboard: https://app.netlify.com
```

### **Environment Variables (Keep Secure)**

```
JWT_SECRET: ____________________________________
MONGO_URI: mongodb+srv://...
```

---

## 🆘 **IF SOMETHING GOES WRONG**

### **Backend won't start**

1. Check Render logs for errors
2. Verify all environment variables are set
3. Test MongoDB connection from Atlas dashboard
4. Ensure MongoDB allows Render IPs

### **Frontend can't connect**

1. Check `VITE_API_URL` in Netlify environment variables
2. Open browser DevTools → Network tab
3. Look for failed requests
4. Verify CORS_ORIGIN in Render includes your Netlify domain

### **CORS errors**

1. Ensure `CORS_ORIGIN` has your exact Netlify URL (with https://)
2. Include both with and without `www.`
3. Restart Render service after changing environment variables

### **Need more help?**

- See `DEPLOYMENT_GUIDE.md` for detailed troubleshooting
- Check Render docs: <https://render.com/docs>
- Check Netlify docs: <https://docs.netlify.com>

---

**Last Updated**: November 23, 2025  
**Next Review**: After successful deployment
