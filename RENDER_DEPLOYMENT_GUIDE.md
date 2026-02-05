# 5AZ Store - Render Deployment Guide

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- MongoDB Atlas account (free tier available)
- Razorpay account (for payments)

## Step 1: Fix Critical Issues Before Deployment

### 1.1 Fix Payment API Error
The payment API is failing because Razorpay credentials are missing:

```bash
# In your Render dashboard, set these environment variables:
RAZORPAY_KEY_ID=rzp_live_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_actual_key_id
```

### 1.2 Fix Mongoose Duplicate Index Warnings
These warnings won't break deployment but should be fixed:

**Files to check:**
- `models/Product.ts` - Remove duplicate `slug` and `variants.sku` indexes
- `models/Order.ts` - Remove duplicate `gatewayOrderId` index  
- `models/User.ts` - Remove duplicate `email` index

**Example fix in Product.ts:**
```typescript
// Keep only ONE of these:
slug: { type: String, required: true, unique: true, index: true } // ✅ Keep this
// productSchema.index({ slug: 1 }); // ❌ Remove this duplicate
```

## Step 2: Deploy to Render

### 2.1 Connect GitHub to Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `5az final` repository

### 2.2 Configure Build Settings
```
Name: 5az-store
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
Node Version: 20
Plan: Free
```

### 2.3 Set Environment Variables
Add these in Render's Environment tab:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://abufayaz:r8KFNrpWyn11R22v@cluster0.jmdh0hc.mongodb.net/
NEXTAUTH_SECRET=your_unique_secret_here
NEXTAUTH_URL=https://your-app-name.onrender.com
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 2.4 Deploy
Click "Create Web Service" and wait for deployment

## Step 3: Post-Deployment Setup

### 3.1 Update NextAuth URL
After deployment, update:
```
NEXTAUTH_URL=https://your-actual-app-url.onrender.com
```

### 3.2 Test Critical Features
1. **Homepage loads** - Check if the site is accessible
2. **Products display** - Verify MongoDB connection works
3. **Payment flow** - Test with Razorpay test credentials first
4. **Authentication** - Test login/signup

### 3.3 Monitor Logs
Check Render logs for any remaining issues:
- Mongoose connection errors
- Payment API failures
- Build warnings

## Step 4: Production Considerations

### 4.1 Security
- Update `NEXTAUTH_SECRET` to a strong random string
- Use production Razorpay keys (not test keys)
- Consider adding Redis for session storage

### 4.2 Performance
- Free tier has limited RAM (512MB)
- Consider upgrading to Starter plan for better performance
- Monitor MongoDB Atlas data usage

### 4.3 Domain (Optional)
- Add custom domain in Render dashboard
- Update `NEXTAUTH_URL` to your custom domain
- Update Razorpay allowed origins

## Troubleshooting

### Build Fails
- Check Node version compatibility
- Verify all dependencies are in package.json
- Check for TypeScript errors

### Runtime Errors
- Verify all environment variables are set
- Check MongoDB connection string
- Review Render logs

### Payment Issues
- Verify Razorpay credentials
- Check webhook URL configuration
- Test with Razorpay sandbox first

## Quick Deployment Checklist

- [ ] Fixed Mongoose duplicate indexes
- [ ] Set Razorpay credentials
- [ ] Connected GitHub to Render
- [ ] Configured build settings
- [ ] Set all environment variables
- [ ] Deployed successfully
- [ ] Updated NEXTAUTH_URL
- [ ] Tested all features
- [ ] Monitored logs for errors

Your 5AZ Store should now be live on Render!
