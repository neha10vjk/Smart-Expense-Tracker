# Deploying Smart Expense Tracker on Vercel

## Quick Summary
This guide covers deploying both your React frontend and Express.js backend to Vercel. You can deploy them as separate projects (recommended) or combined.

---

## Prerequisites

1. **GitHub Account**: Push your code to GitHub
2. **Vercel Account**: Sign up at https://vercel.com
3. **PostgreSQL Database**: You'll need a production database (see options below)
4. **Vercel CLI** (optional): `npm install -g vercel`

---

## Step 1: Prepare Your Database

Choose a PostgreSQL provider and create a database:

### Option A: Neon (Recommended for Vercel)
1. Go to https://neon.tech
2. Create a free account
3. Create a new project and database
4. Copy the connection string (format: `postgresql://...`)
5. Run your schema:
   ```bash
   psql "your-connection-string" < backend/db/schema.sql
   ```

### Option B: Supabase
1. Go to https://supabase.com
2. Create a project
3. Go to Settings → Database → Connection string
4. Copy the PostgreSQL connection string
5. Run your schema in the SQL editor

### Option C: Railway
1. Go to https://railway.app
2. Create account and new project
3. Add PostgreSQL service
4. Copy connection string and run schema

---

## Step 2: Backend Deployment (Express.js API)

### Using Vercel CLI (Easiest)

```bash
# 1. Install Vercel CLI globally (if not already installed)
npm install -g vercel

# 2. From project root, deploy backend
cd backend
vercel --prod

# 3. During setup, answer prompts:
#    - Link to existing project? No (first time)
#    - Project name: smart-expense-tracker-api
#    - Directory: . (current)

# 4. Set environment variables in Vercel dashboard:
#    - Go to dashboard → Your Project → Settings → Environment Variables
#    - Add DATABASE_URL: your-postgresql-connection-string
#    - Add CORS_ORIGIN: https://your-frontend-url.vercel.app (add after frontend is deployed)
#    - Add NODE_ENV: production
```

### Using Vercel Web Dashboard

1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Import project
4. **Important**: 
   - Set **Root Directory** to `backend/`
   - Set **Build Command** to: `npm install`
   - Set **Start Command** to: `npm start`
5. Add environment variables:
   - `DATABASE_URL`: postgresql://...
   - `NODE_ENV`: production
6. Deploy

### Verify Backend Deployment
```bash
# Test health endpoint
curl https://your-backend-url.vercel.app/api/health
# Should return: {"ok":true,"message":"API and database are reachable."}
```

---

## Step 3: Frontend Deployment (React + Vite)

### Using Vercel CLI

```bash
# 1. Return to project root
cd ..

# 2. Deploy frontend
vercel --prod

# 3. During setup:
#    - Link to existing project? No
#    - Project name: smart-expense-tracker
#    - Directory: . (root)
#    - Build output directory: dist

# 4. Add environment variable in Vercel dashboard:
#    - VITE_API_URL: https://your-backend-url.vercel.app
```

### Using Vercel Web Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configuration:
   - **Root Directory**: Leave blank (use root)
   - **Framework**: Vite (should auto-detect)
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`
   - **Output Directory**: `dist`
4. Add environment variables:
   - `VITE_API_URL`: https://your-backend-url.vercel.app
5. Deploy

### Update CORS on Backend
After frontend is deployed, go back to backend project settings and update:
- `CORS_ORIGIN`: https://your-frontend-url.vercel.app

---

## Step 4: Environment Variables Summary

### Frontend (.env or Dashboard)
```
VITE_API_URL=https://your-backend-url.vercel.app
```

### Backend (.env or Dashboard)
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ORIGIN=https://your-frontend-url.vercel.app
NODE_ENV=production
PORT=3000
```

---

## Deployment Scripts

After setup, you can use these npm scripts:

```bash
# Deploy frontend only
npm run deploy:frontend

# Deploy backend only
npm run deploy:backend

# Build locally for testing
npm run build                  # Frontend
npm run server                 # Backend (requires DATABASE_URL)
```

---

## Troubleshooting

### "Database connection failed"
- [ ] Verify DATABASE_URL is correct
- [ ] Ensure database schema is initialized
- [ ] Check IP whitelist on database (allow Vercel IPs if needed)
- [ ] Test connection: `psql "your-connection-string" -c "SELECT 1"`

### CORS Errors
- [ ] Verify CORS_ORIGIN matches frontend URL exactly
- [ ] Check browser console for the exact URL being used
- [ ] Update backend CORS_ORIGIN after frontend deployed

### API returns 404
- [ ] Verify backend is deployed and running
- [ ] Check VITE_API_URL in frontend environment
- [ ] Test health endpoint: `curl https://backend-url/api/health`

### Build fails
1. Check build logs in Vercel dashboard
2. Run locally: `npm run build`
3. Look for TypeScript or syntax errors
4. Verify all dependencies are in package.json

### Frontend shows "Cannot reach API"
- [ ] Check that VITE_API_URL is set correctly
- [ ] Verify backend is running
- [ ] Check browser Network tab for failed requests
- [ ] Ensure CORS headers are correct on backend

---

## Post-Deployment Checklist

- [ ] Test login at https://your-frontend.vercel.app
- [ ] Create a test profile
- [ ] Add a test expense
- [ ] Check dashboard loads correctly
- [ ] Test API health check endpoint
- [ ] Monitor logs in Vercel dashboard first 24 hours

---

## Monitoring & Updates

### View Logs
```bash
# Frontend deployment
vercel logs https://your-frontend.vercel.app

# Backend deployment
vercel logs https://your-backend.vercel.app
```

### Redeploy on Updates
```bash
vercel --prod
```

---

## Useful Links
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Database Integration](https://vercel.com/docs/storage/postgres)
- [Node.js on Vercel](https://vercel.com/docs/functions/serverless-functions/node-js)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
