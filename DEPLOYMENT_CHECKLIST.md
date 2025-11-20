# Deployment Checklist

Quick reference checklist for deploying to Render.

## ✅ Pre-Deployment Checklist

- [ ] Code is pushed to GitHub repository
- [ ] MongoDB Atlas account created
- [ ] Cloudinary account created
- [ ] PDF delivery enabled in Cloudinary settings
- [ ] Strong JWT secret generated (min 32 characters)

## 📝 Environment Variables Checklist

### Backend Environment Variables

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000` (or let Render assign)
- [ ] `CLIENT_ORIGIN` = Frontend URL (set after frontend deploy)
- [ ] `MONGODB_URI` = MongoDB Atlas connection string
- [ ] `MONGODB_DB_NAME` = `candidate_referrals`
- [ ] `MONGODB_AUTH_SOURCE` = `candidate_referrals`
- [ ] `JWT_SECRET` = Strong secret (min 32 chars)
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `RESET_TOKEN_EXPIRES_MINUTES` = `30`
- [ ] `MAX_FILE_SIZE_MB` = `5`
- [ ] `CLOUDINARY_CLOUD_NAME` = Your Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` = Your Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` = Your Cloudinary API secret

### Frontend Environment Variables

- [ ] `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
- [ ] `VITE_BACKEND_ORIGIN` = `https://your-backend.onrender.com`

## 🚀 Deployment Steps

### Backend

1. [ ] Create Web Service in Render
2. [ ] Connect GitHub repository
3. [ ] Set Root Directory: `backend`
4. [ ] Set Build Command: `npm install`
5. [ ] Set Start Command: `npm start`
6. [ ] Set Health Check Path: `/health`
7. [ ] Add all backend environment variables
8. [ ] Deploy backend service
9. [ ] Wait for successful deployment
10. [ ] Test health endpoint: `https://your-backend.onrender.com/health`
11. [ ] Copy backend URL

### Frontend

1. [ ] Create Static Site in Render
2. [ ] Connect same GitHub repository
3. [ ] Set Root Directory: `frontend`
4. [ ] Set Build Command: `npm install && npm run build`
5. [ ] Set Publish Directory: `dist`
6. [ ] Add frontend environment variables (use backend URL)
7. [ ] Deploy frontend service
8. [ ] Wait for successful deployment
9. [ ] Copy frontend URL

### Post-Deployment

1. [ ] Update backend `CLIENT_ORIGIN` with frontend URL
2. [ ] Redeploy backend (automatic after env change)
3. [ ] Test frontend → backend connection
4. [ ] Test user registration
5. [ ] Test user login
6. [ ] Test candidate creation
7. [ ] Test resume upload
8. [ ] Test PDF viewing

## 🔍 Verification Tests

### Backend Tests

```bash
# Health check
curl https://your-backend.onrender.com/health

# Should return: {"status":"ok","timestamp":"..."}
```

### Frontend Tests

- [ ] Open frontend URL in browser
- [ ] Register a new user
- [ ] Login with credentials
- [ ] Create a candidate with resume
- [ ] View uploaded resume PDF
- [ ] Test admin features (if admin user)

## 🐛 Common Issues

- [ ] Backend won't start → Check environment variables
- [ ] Frontend can't connect → Check `VITE_API_BASE_URL`
- [ ] CORS errors → Update backend `CLIENT_ORIGIN`
- [ ] PDF won't load → Enable PDF delivery in Cloudinary
- [ ] MongoDB connection fails → Check connection string and network access
- [ ] File upload fails → Check Cloudinary credentials

## 📚 Resources

- Full Guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- API Docs: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Render Docs: https://render.com/docs

---

**Status**: ⏳ Ready to deploy

