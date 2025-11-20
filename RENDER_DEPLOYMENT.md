# Render Deployment Guide

Complete guide to deploy the Candidate Referral Management System to Render.

## 📋 Prerequisites

Before deploying, ensure you have:
- [ ] A Render account (sign up at [render.com](https://render.com))
- [ ] A MongoDB Atlas account (or use Render's MongoDB service)
- [ ] A Cloudinary account for file storage
- [ ] GitHub repository with your code (recommended)

---

## 🏗️ Architecture Overview

The application consists of two services:
1. **Backend Service** (Web Service) - Node.js/Express API
2. **Frontend Service** (Static Site) - React/Vite application

```
Frontend (Static Site) → Backend (Web Service) → MongoDB Atlas
                                    ↓
                              Cloudinary
```

---

## 📦 Step 1: Prepare Your Repository

### 1.1 Ensure Your Code is on GitHub

```bash
# If not already on GitHub
git add .
git commit -m "Prepare for deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 1.2 Create Required Files

Make sure these files exist in your repository:
- `backend/package.json` ✅
- `frontend/package.json` ✅
- `backend/src/index.js` ✅
- `.gitignore` (should ignore `.env` files)

---

## 🗄️ Step 2: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up or log in

2. **Create a New Cluster**
   - Choose the free tier (M0)
   - Select a cloud provider and region
   - Create cluster (takes a few minutes)

3. **Create Database User**
   - Go to **Database Access** → **Add New Database User**
   - Choose **Password** authentication
   - Username: `render-user` (or your choice)
   - Password: Generate a strong password (save it!)
   - Database User Privileges: **Read and write to any database**

4. **Configure Network Access**
   - Go to **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Or add Render's IP ranges (check Render docs)

5. **Get Connection String**
   - Go to **Database** → **Connect** → **Connect your application**
   - Copy the connection string
   - It will look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Replace `<username>` with your database username
   - **Important**: Add database name and auth source:
     ```
     mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/candidate_referrals?retryWrites=true&w=majority&authSource=candidate_referrals
     ```

---

## ☁️ Step 3: Configure Cloudinary

1. **Get Cloudinary Credentials**
   - Log in to [Cloudinary](https://cloudinary.com)
   - Go to **Dashboard**
   - Copy these values:
     - **Cloud Name**
     - **API Key**
     - **API Secret**

2. **Enable PDF Delivery**
   - Go to **Settings** → **Security**
   - Enable **"PDF and ZIP files delivery"**
   - Save changes

---

## 🚀 Step 4: Deploy Backend Service

### 4.1 Create New Web Service

1. **Go to Render Dashboard**
   - Log in to [Render Dashboard](https://dashboard.render.com)
   - Click **New +** → **Web Service**

2. **Connect Repository**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Click **Connect**

3. **Configure Service**

   **Basic Settings:**
   - **Name**: `candidate-referral-api` (or your choice)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Advanced Settings:**
   - **Instance Type**: Free tier (or upgrade for production)
   - **Health Check Path**: `/health`

### 4.2 Configure Environment Variables

In the **Environment** section, add these variables:

```env
# Server Configuration
NODE_ENV=production
PORT=10000
CLIENT_ORIGIN=https://your-frontend-app.onrender.com

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/candidate_referrals?retryWrites=true&w=majority&authSource=candidate_referrals
MONGODB_DB_NAME=candidate_referrals
MONGODB_AUTH_SOURCE=candidate_referrals

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this-in-production
JWT_EXPIRES_IN=7d
RESET_TOKEN_EXPIRES_MINUTES=30

# File Upload Configuration
MAX_FILE_SIZE_MB=5

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Important Notes:**
- Replace `CLIENT_ORIGIN` with your frontend URL (you'll update this after deploying frontend)
- Use a strong `JWT_SECRET` (minimum 32 characters)
- Keep `CLOUDINARY_API_SECRET` secure - never commit it to Git

### 4.3 Deploy Backend

1. Click **Create Web Service**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the application
   - Start the service
3. Wait for deployment (usually 2-5 minutes)
4. Check deployment logs for any errors
5. **Copy the backend URL**: `https://your-backend-service.onrender.com`

---

## 🎨 Step 5: Deploy Frontend Service

### 5.1 Create New Static Site

1. **Go to Render Dashboard**
   - Click **New +** → **Static Site**

2. **Connect Repository**
   - Select the same repository
   - Click **Connect**

3. **Configure Site**

   **Basic Settings:**
   - **Name**: `candidate-referral-frontend` (or your choice)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 5.2 Configure Environment Variables

In the **Environment Variables** section, add:

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
VITE_BACKEND_ORIGIN=https://your-backend-service.onrender.com
```

**Important:** Replace `your-backend-service` with your actual backend service name.

### 5.3 Deploy Frontend

1. Click **Create Static Site**
2. Render will build and deploy your frontend
3. Wait for deployment (usually 3-7 minutes)
4. **Copy the frontend URL**: `https://your-frontend-app.onrender.com`

---

## 🔄 Step 6: Update Backend CORS Configuration

After deploying the frontend, update the backend's `CLIENT_ORIGIN`:

1. Go to your **Backend Service** in Render
2. Navigate to **Environment** tab
3. Update `CLIENT_ORIGIN`:
   ```
   CLIENT_ORIGIN=https://your-frontend-app.onrender.com
   ```
   (Or add multiple origins separated by commas if needed)
4. Click **Save Changes**
5. Render will automatically redeploy

---

## ✅ Step 7: Verify Deployment

### 7.1 Test Backend

1. **Health Check**
   ```bash
   curl https://your-backend-service.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test API Endpoint**
   ```bash
   curl https://your-backend-service.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

### 7.2 Test Frontend

1. Open `https://your-frontend-app.onrender.com` in your browser
2. Try to register a new user
3. Try to login
4. Test candidate creation with resume upload

---

## 🔧 Troubleshooting

### Backend Won't Start

**Check:**
- Environment variables are set correctly
- MongoDB connection string is valid
- Port is set correctly (Render uses port 10000 or assigns dynamically)
- Check deployment logs in Render dashboard

**Common Issues:**
- **MongoDB Connection Error**: Verify connection string and network access
- **Missing Environment Variable**: Check all required variables are set
- **Port Binding Error**: Render handles this automatically, but check logs

### Frontend Can't Connect to Backend

**Check:**
- `VITE_API_BASE_URL` is correct in frontend environment
- Backend is running (check health endpoint)
- CORS is configured correctly in backend
- Update backend `CLIENT_ORIGIN` with frontend URL

**Fix:**
- Rebuild frontend after updating environment variables
- Update backend `CLIENT_ORIGIN` and redeploy

### File Upload Not Working

**Check:**
- Cloudinary credentials are correct
- PDF delivery is enabled in Cloudinary settings
- File size is under 5MB limit
- Check backend logs for Cloudinary errors

### 404 Errors on Frontend Routes

**Solution:** Configure render.yaml or add `_redirects` file:

Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

Or configure in Render Static Site settings:
- **Rewrite Rules**: `/* /index.html 200`

---

## 📝 Using render.yaml (Optional - Infrastructure as Code)

You can automate deployment using `render.yaml`. Create this file in your repository root:

```yaml
services:
  # Backend API Service
  - type: web
    name: candidate-referral-api
    env: node
    region: oregon  # Change to your preferred region
    plan: free  # or starter, standard, etc.
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: CLIENT_ORIGIN
        sync: false  # Set manually or via Render dashboard
      - key: MONGODB_URI
        sync: false  # Set manually for security
      - key: MONGODB_DB_NAME
        value: candidate_referrals
      - key: MONGODB_AUTH_SOURCE
        value: candidate_referrals
      - key: JWT_SECRET
        sync: false  # Set manually for security
      - key: JWT_EXPIRES_IN
        value: 7d
      - key: RESET_TOKEN_EXPIRES_MINUTES
        value: 30
      - key: MAX_FILE_SIZE_MB
        value: 5
      - key: CLOUDINARY_CLOUD_NAME
        sync: false  # Set manually for security
      - key: CLOUDINARY_API_KEY
        sync: false  # Set manually for security
      - key: CLOUDINARY_API_SECRET
        sync: false  # Set manually for security

  # Frontend Static Site
  - type: web
    name: candidate-referral-frontend
    env: static
    region: oregon
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_BASE_URL
        sync: false  # Set manually after backend is deployed
      - key: VITE_BACKEND_ORIGIN
        sync: false  # Set manually after backend is deployed
```

**To use render.yaml:**
1. Commit `render.yaml` to your repository
2. In Render dashboard, go to **Blueprint** → **New Blueprint**
3. Connect your repository
4. Render will automatically create services from the YAML file

---

## 🔐 Security Best Practices

### For Production:

1. **Strong JWT Secret**
   ```bash
   # Generate a strong secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Restrict CORS**
   - Only allow your frontend domain
   - Don't use `*` in production

3. **Environment Variables**
   - Never commit `.env` files
   - Use Render's environment variable management
   - Rotate secrets periodically

4. **HTTPS Only**
   - Render provides HTTPS automatically
   - Ensure `CLIENT_ORIGIN` uses `https://`

5. **MongoDB Security**
   - Use strong passwords
   - Restrict IP access to Render's IPs (if possible)
   - Enable MongoDB Atlas authentication

---

## 📊 Monitoring

### Render Logs

- View real-time logs in Render dashboard
- Logs are automatically collected
- Use filters to find specific errors

### Health Checks

- Backend has `/health` endpoint
- Render automatically monitors this
- Service restarts if health check fails

### Database Monitoring

- Use MongoDB Atlas dashboard
- Monitor connection counts
- Check query performance

---

## 🔄 Continuous Deployment

Render automatically deploys on:
- Push to the connected branch
- Manual deploy trigger
- Environment variable changes (requires manual redeploy)

**To disable auto-deploy:**
- Go to service settings
- Disable **Auto-Deploy**

---

## 💰 Cost Estimation

### Free Tier:
- **Backend**: Free (with limitations)
- **Frontend**: Free
- **MongoDB**: Free (M0 Atlas cluster)
- **Cloudinary**: Free tier available

### Limits:
- Backend: 750 hours/month, sleeps after 15 min inactivity
- Frontend: Unlimited
- MongoDB: 512MB storage, shared CPU/RAM
- Cloudinary: 25GB storage, 25GB bandwidth/month

**For Production**: Consider upgrading to paid tiers for:
- Always-on backend
- More MongoDB resources
- Higher Cloudinary limits

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🆘 Support

If you encounter issues:
1. Check Render deployment logs
2. Check MongoDB Atlas connection status
3. Verify all environment variables
4. Test endpoints with curl/Postman
5. Check Cloudinary dashboard for upload issues

---

**Congratulations! Your application is now live on Render! 🎉**

