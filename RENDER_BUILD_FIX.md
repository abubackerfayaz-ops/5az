# 🚀 Render Build Fix - Force Cache Clear

## Problem
Build was failing with module resolution errors, but local build works.

## Solution
Add a build script to force cache clearing on Render.

## Updated render.yaml
```yaml
services:
  - type: web
    name: 5az-store
    env: node
    plan: free
    buildCommand: rm -rf .next && npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_VERSION
        value: 20
      - key: MONGODB_URI
        value: mongodb+srv://abufayaz:r8KFNrpWyn11R22v@cluster0.jmdh0hc.mongodb.net/
      - key: NEXTAUTH_SECRET
        value: changeme_dev_secret_123
      - key: NEXTAUTH_URL
        value: https://5az-store.onrender.com
      - key: RAZORPAY_KEY_ID
        value: rzp_test_placeholder
      - key: RAZORPAY_KEY_SECRET
        value: secret_placeholder
      - key: NEXT_PUBLIC_RAZORPAY_KEY_ID
        value: rzp_test_placeholder
```

## Key Changes
- **Build Command**: Added `rm -rf .next` to clear cache
- This forces fresh build every time
- Prevents stale cache issues

## Deploy Steps
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your `5az-store` service
3. Click **"Settings"** → **"Build & Deploy"**
4. Update **Build Command** to: `rm -rf .next && npm install && npm run build`
5. Click **"Save Changes"**
6. Click **"Manual Deploy"** → **"Deploy Latest Commit"**

## Alternative: Create New Service
If update doesn't work:
1. Delete current service
2. Create new web service
3. Use updated render.yaml
4. Deploy fresh

## Expected Result
- ✅ Build completes successfully
- ✅ All modules resolve correctly
- ✅ Site loads without errors

## Verification
After deployment:
1. Check logs for success
2. Visit your site: `https://5az-store.onrender.com`
3. Test Razorpay verification

This should fix the build issues! 🎯
