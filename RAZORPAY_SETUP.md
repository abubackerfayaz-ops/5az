# 🔑 Razorpay Setup Guide

## Get Your Razorpay Credentials

### 1. Sign Up/Login
Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)

### 2. Get Test Keys (Recommended for Development)
1. Click **Settings** → **API Keys** 
2. You'll see **Test Mode** keys:
   - **Key ID**: `rzp_test_...`
   - **Key Secret**: Click **"View Key Secret"**

### 3. Get Live Keys (For Production)
1. Toggle to **Live Mode** 
2. Click **"Generate Key"** if no keys exist
3. Save your **Key ID** and **Key Secret** securely

### 4. Environment Variables for Render

#### For Testing (Recommended First):
```
RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_secret_key_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here
```

#### For Production:
```
RAZORPAY_KEY_ID=rzp_live_your_live_key_id_here
RAZORPAY_KEY_SECRET=your_live_secret_key_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key_id_here
```

### 5. Important Notes
- **Never expose Key Secret** in frontend code
- **NEXT_PUBLIC_RAZORPAY_KEY_ID** is safe for frontend (it's the public key)
- Test with **rzp_test_** keys first, then switch to **rzp_live_** keys
- Keep your keys secure and never commit them to Git

### 6. Webhook Setup (Optional but Recommended)
1. In Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://your-app.onrender.com/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Save the webhook secret

## Quick Copy-Paste Template
Replace the placeholders with your actual keys:

```bash
# Add these in Render Environment Variables:
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXXXXXX
```

Once you have these keys, you can proceed with the Render deployment! 🚀
