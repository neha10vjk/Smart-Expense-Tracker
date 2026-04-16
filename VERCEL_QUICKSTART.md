# Vercel Deployment Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Database Setup (Pick One)
```bash
# Neon: https://neon.tech → Create project → Copy connection string
# Supabase: https://supabase.com → New project → Copy Postgres connection string
# Railway: https://railway.app → Add PostgreSQL service → Copy connection string
```

### 2. Initialize Vercel Database
```bash
psql "postgresql://user:password@host/dbname" < backend/db/schema.sql
```

### 3. Backend Deploy
```bash
cd backend
vercel --prod
# ✓ Link to new project? No
# ✓ Project name: smart-expense-tracker-api
# ✓ Directory: .
# → Go to Vercel dashboard → Settings → Environment Variables
# → Add: DATABASE_URL, CORS_ORIGIN, NODE_ENV
```

### 4. Frontend Deploy
```bash
cd ..
vercel --prod
# ✓ Project name: smart-expense-tracker
# → Go to Vercel dashboard → Environment Variables
# → Add: VITE_API_URL = https://your-backend-url.vercel.app
# → Update backend CORS_ORIGIN to your frontend URL
```

### 5. Test
```bash
curl https://your-backend.vercel.app/api/health
# Should return: {"ok":true,"message":"API and database are reachable."}

# Then visit: https://your-frontend.vercel.app
```

---

## 🔧 Environment Variables

**Backend** (`backend` → Settings → Environment Variables):
```
DATABASE_URL = postgresql://...
CORS_ORIGIN = https://your-frontend.vercel.app
NODE_ENV = production
```

**Frontend** (`root` → Settings → Environment Variables):
```
VITE_API_URL = https://your-backend.vercel.app
```

---

## 📋 Database Providers

| Provider | Free Tier | Connection | Setup Time |
|----------|-----------|-----------|-----------|
| **Neon** | 3 GB | Fast | 2 min |
| **Supabase** | 500 MB | Easy UI | 3 min |
| **Railway** | $5 credit | Simple | 3 min |

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Database connection failed | Verify DATABASE_URL is correct, run schema initialization |
| CORS error on frontend | Update backend CORS_ORIGIN to match frontend URL |
| API returns 404 | Check VITE_API_URL, verify backend is running |
| Build fails | Run `npm run build` locally, check for TypeScript errors |

---

## 📝 Vercel Dashboard URLs

- **Frontend Project**: https://vercel.com/dashboard?name=smart-expense-tracker
- **Backend Project**: https://vercel.com/dashboard?name=smart-expense-tracker-api
- **Environment Settings**: Click project → Settings → Environment Variables

---

## 🔄 CI/CD Setup

Once deployed, your projects auto-redeploy when you push to GitHub:
1. Code pushed to GitHub
2. Vercel detects change
3. Automatic build & deploy (2-5 minutes)
4. View progress: Project → Deployments → Latest

---

## 📞 Quick Commands

```bash
# View deployment logs
vercel logs https://your-backend.vercel.app

# Redeploy immediately
vercel --prod

# Check build locally before deploying
npm run build

# Test backend locally
npm run server:dev

# Test frontend locally
npm run dev
```

---

## ✅ Verification Checklist

- [ ] Database created and schema initialized
- [ ] Backend environment variables set
- [ ] Frontend VITE_API_URL set
- [ ] Backend CORS_ORIGIN updated after frontend deployment
- [ ] Health check endpoint returns success
- [ ] Frontend loads without errors
- [ ] Can create profile
- [ ] Can add expense
- [ ] Dashboard displays data
