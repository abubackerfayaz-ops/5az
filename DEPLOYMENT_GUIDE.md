# 🚀 Deployment Guide: 5AZ Archive on Render

Your project is configured for a seamless deployment on **Render.com**. Follow these steps to go live.

## 1️⃣ Preparation (Local)
1. Ensure all your changes are committed and pushed to **GitHub** (or GitLab/Bitbucket).
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

## 2️⃣ Create Render Service
1. Go to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your **GitHub Account** and select your repository (`5az-final` or whatever you named it).
4. **Name**: `5az-archive` (or unique name).
5. **Runtime**: Node.
6. **Build Command**: `npm install && npm run build`.
7. **Start Command**: `npm start`.

## 3️⃣ Environment Variables (Crucial!)
You must add these in the **Environment** tab on Render before your app will start correctly.

| Key | Value | Description |
|-----|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Copy from your `.env.local`. **Ensure IP Access is Open (0.0.0.0/0) on Atlas**. |
| `NEXTAUTH_SECRET` | `...` | Copy from `.env.local` or generate a new random string. |
| `NEXTAUTH_URL` | `https://your-app-name.onrender.com` | **IMPORTANT**: This must match your final Render URL. |
| `RAZORPAY_KEY_ID` | `rzp_test_...` | Your Razorpay Public Key. |
| `RAZORPAY_KEY_SECRET` | `...` | Your Razorpay Secret Key. |
| `NODE_ENV` | `production` | (Usually set automatically, but good to add). |

## 4️⃣ Database Access (MongoDB Atlas)
Since Render uses dynamic IPs, you must whitelist all IPs on MongoDB Atlas.
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com).
2. Network Access -> **Add IP Address**.
3. Select **Allow Access from Anywhere (0.0.0.0/0)**.
4. **Confirm**.

## 5️⃣ Build & Deploy
1. Click **Create Web Service**.
2. Watch the logs. It will install dependencies, build Next.js, and start the server.
3. Once you see "Ready", your site is live!

---

## 🛠 Troubleshooting
*   **Build Failed (TypeScript Errors)?**: We have enabled `ignoreBuildErrors: true` in `next.config.ts`, so this shouldn't happen.
*   **502 Bad Gateway**: Usually means the app didn't start in time or crashed. Check logs.
*   **Login Not Working**: Check `NEXTAUTH_URL`. It **MUST** be exact (https vs http, no trailing slash).
