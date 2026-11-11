# SmartHire — Complete Production Deployment Guide

Deploying SmartHire to production involves three straightforward steps:
1. **Cloud Database:** MongoDB Atlas (Free M0 Cluster)
2. **Backend API:** Render (Free Web Service)
3. **Frontend Application:** Vercel (Free Hobby Tier)

---

## Step 1: Deploy the Cloud Database (MongoDB Atlas)

1. **Sign up or log in** to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Create** to deploy a new cluster:
   - Choose the **M0 Shared (Free)** tier.
   - Provider: **AWS**, Region: closest to your users (e.g., `ap-south-1` Mumbai or `us-east-1`).
   - Cluster Name: `smarthire-cluster`.
3. **Set up Security Credentials:**
   - Go to **Security > Database Access** -> Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `smarthire_admin`
   - Password: Click *Autogenerate Secure Password* (copy and save this password!).
   - Database User Privileges: `Read and write to any database`.
4. **Configure Network Access (Whitelist IP):**
   - Go to **Security > Network Access** -> Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**.
5. **Get your Connection String:**
   - Go to **Deployment > Database** -> Click **Connect** next to your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection string:
     ```
     mongodb+srv://smarthire_admin:<password>@smarthire-cluster.xxxxxx.mongodb.net/smarthire?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the user password you saved in Step 3.

---

## Step 2: Push Your Code to GitHub

1. If you haven't initialized Git yet, open PowerShell/Terminal in the project folder:
   ```bash
   cd C:\Users\priya\OneDrive\Desktop\minor
   git init
   git add .
   git commit -m "feat: complete SmartHire full-stack MERN platform"
   ```
2. Create a new repository on [GitHub](https://github.com/new) named `SmartHire`.
3. Link and push your repository:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/SmartHire.git
   git push -u origin main
   ```

---

## Step 3: Deploy Backend REST API (Render)

1. Sign up or log in to [Render](https://render.com) using your GitHub account.
2. In the Render Dashboard, click **New +** and select **Web Service**.
3. Select your GitHub repository: `SmartHire`.
4. Configure the Web Service settings:
   - **Name:** `smarthire-backend`
   - **Region:** Closest to your database region (e.g., Singapore, Frankfurt, or Oregon).
   - **Branch:** `main`
   - **Root Directory:** `server`  *(CRITICAL: must be `server`)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **Advanced** and add the following **Environment Variables**:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render default port |
   | `MONGO_URI` | `mongodb+srv://smarthire_admin:<password>@.../smarthire` | Your Atlas string from Step 1 |
   | `JWT_SECRET` | `<any_long_random_64_char_string>` | e.g. `smarthire_prod_secret_key_998877` |
   | `JWT_EXPIRES_IN` | `7d` | Token lifetime |
   | `CLIENT_URL` | `*` (or your Vercel URL later) | CORS whitelist |
6. Click **Create Web Service**.
7. Render will build and start your server. Once active, note your live backend URL (e.g., `https://smarthire-backend.onrender.com`).
8. **Optional (Seed Production Data):**
   - In Render, click the **Shell** tab of your service and run:
     ```bash
     npm run seed
     ```
   - This populates your cloud MongoDB Atlas database with the demo companies, jobs, and accounts!

---

## Step 4: Deploy Frontend Client (Vercel)

1. Sign up or log in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New... > Project** and import your `SmartHire` repository.
3. Configure the Project Settings:
   - **Framework Preset:** `Vite` (Vercel detects this automatically).
   - **Root Directory:** Click *Edit* and select **`client`** *(CRITICAL: must be `client`)*.
   - **Build and Output Settings:** Leave default (`Build: npm run build`, `Output: dist`).
4. Expand **Environment Variables** and add:
   | Name | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://smarthire-backend.onrender.com/api` |
   *(Use your actual Render backend URL from Step 3, ending with `/api`)*
5. Click **Deploy**.
6. Vercel will bundle and deploy your frontend in ~45 seconds, giving you a live domain:
   ```
   https://smarthire.vercel.app
   ```
7. *(Optional final touch)*: Return to Render, open your backend **Environment Variables**, and update `CLIENT_URL` to your Vercel URL (`https://smarthire.vercel.app`).

---

## Step 5: Verify Live Deployment

1. Open your live Vercel URL in your browser.
2. Click **Sign In** -> use the **1-Click Demo Logins** (e.g. Candidate or Recruiter).
3. Browse vacancies, inspect recommendation scores, and test submitting an application.
4. Log into the Recruiter portal to view the candidate ranked by match score.

Congratulations! Your SmartHire platform is fully deployed and live on the internet!
