# Frontend Deployment Guide - Netlify

## Prerequisites
- Netlify account (sign up at netlify.com)
- GitHub account with your code pushed
- Your backend URL (from Render/Railway/Heroku deployment)

---

## Deployment Steps

### Method 1: Netlify UI (Easiest)

1. **Push your code to GitHub**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Select your repository

3. **Configure Build Settings**
   - **Base directory:** `frontend` (if monorepo, leave empty if separate repo)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. **Add Environment Variable**
   - Click "Show advanced"
   - Add environment variable:
     - **Key:** `VITE_API_URL`
     - **Value:** `https://your-backend-url.onrender.com` (your actual backend URL)

5. **Deploy**
   - Click "Deploy site"
   - Wait 2-3 minutes for build
   - Get your site URL: `https://random-name.netlify.app`

6. **Update Backend CORS (Important!)**
   - Go to your backend code `app/main.py`
   - Update CORS origins:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://your-site.netlify.app",
           "http://localhost:3000"  # Keep for local dev
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
   - Redeploy backend

---

### Method 2: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Initialize and deploy**
   ```bash
   cd frontend
   netlify init
   netlify deploy --prod
   ```

4. **Set environment variable**
   ```bash
   netlify env:set VITE_API_URL https://your-backend-url.onrender.com
   ```

---

## Update API URL in Code

Before deploying, you need to update the API configuration:

### Option A: Use Environment Variable (Recommended)

1. **Create `.env` file** (already created for you)
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

2. **Update `src/api/api.js`** to use env variable:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
   ```

3. **Set in Netlify**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com`

### Option B: Hardcode (Quick but not recommended)

Update `src/api/api.js`:
```javascript
const API_BASE_URL = 'https://your-backend-url.onrender.com';
```

---

## Custom Domain (Optional)

1. **In Netlify Dashboard**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Follow DNS configuration instructions

2. **Update Backend CORS**
   - Add your custom domain to allowed origins in `app/main.py`

---

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch automatically deploys
- Preview deployments for pull requests
- Rollback to previous versions anytime

---

## Testing Your Deployment

1. **Visit your Netlify URL**
2. **Open browser console** (F12)
3. **Upload an image** and test features
4. **Check for errors:**
   - CORS errors? Update backend CORS settings
   - API not found? Check VITE_API_URL is set correctly
   - 502/504 errors? Backend may be cold starting (wait 30 seconds)

---

## Troubleshooting

### CORS Errors
**Problem:** `Access-Control-Allow-Origin` error in console  
**Solution:** Add your Netlify URL to backend CORS settings

### API Connection Failed
**Problem:** Can't connect to backend  
**Solution:** 
- Check VITE_API_URL is set correctly
- Ensure backend is deployed and running
- Test backend URL directly: `https://your-backend.onrender.com/api/health`

### Build Fails
**Problem:** Build fails on Netlify  
**Solution:**
- Check build logs
- Ensure `package.json` has all dependencies
- Try building locally: `npm run build`

### Environment Variables Not Working
**Problem:** `VITE_API_URL` not being used  
**Solution:**
- Must prefix with `VITE_` for Vite to expose them
- Rebuild after changing env vars in Netlify
- Check: `console.log(import.meta.env.VITE_API_URL)`

### Routing Issues (404 on refresh)
**Problem:** Get 404 when refreshing page  
**Solution:** Already configured in `netlify.toml` with redirect rule

---

## Performance Optimization

1. **Enable Asset Optimization** in Netlify settings
2. **Enable HTTPS** (automatic with Netlify)
3. **Set up CDN caching** (automatic with Netlify)

---

## Monitoring

- **Netlify Analytics:** Track visitors and performance
- **Function logs:** View in Netlify dashboard
- **Browser console:** Check for runtime errors

---

## Complete Deployment Checklist

- [ ] Backend deployed to Render/Railway
- [ ] Backend URL copied
- [ ] Frontend code pushed to GitHub
- [ ] Netlify site created and connected
- [ ] `VITE_API_URL` environment variable set in Netlify
- [ ] Site deployed successfully
- [ ] Backend CORS updated with Netlify URL
- [ ] Backend redeployed with updated CORS
- [ ] Site tested and working
- [ ] Custom domain configured (optional)

---

## Your Deployed URLs

After deployment, note these URLs:

- **Frontend:** `https://your-site.netlify.app`
- **Backend:** `https://your-backend.onrender.com`
- **Backend API Health:** `https://your-backend.onrender.com/api/health`
