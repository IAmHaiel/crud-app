# Deployment Guide (No Google Cloud)

## Recommended Stack (Capstone-Friendly, Scalable)

### Frontend: Vercel
- **Why**: Free tier, automatic HTTPS, global CDN, git-based deploys
- **How**: Connect your GitHub repo, Vercel auto-detects Vite
- **Cost**: Free tier (100GB bandwidth, unlimited projects)
- **Scaling**: Auto-scales globally via edge network

### Backend: Railway / Render / Fly.io
These are the top 3 **capstone-friendly** alternatives to Google Cloud:

| Platform  | Free Tier                     | PostgreSQL Included | Best For            |
|-----------|-------------------------------|---------------------|----------------------|
| **Railway** | $5 credit (no card needed start) | Yes (free dev DB) | Easiest setup        |
| **Render**  | Free web service (sleeps idle)  | Yes (free 1GB DB)  | Long-running demos   |
| **Fly.io**  | Free allowance, $5/mo min       | Yes (attached vol) | Regional control     |

**Recommended: Railway** for capstone projects because:
- Deploy from GitHub with zero config
- Built-in PostgreSQL (free dev database)
- No credit card required to start
- Auto-deploys on git push
- Custom domains on free tier

### Database: Railway / Render Managed PostgreSQL
Both Railway and Render offer **managed PostgreSQL** that auto-scales:

- **Railway**: $0 free dev database (resets after 24h of no use) or $5/mo for persistent
- **Render**: Free 1GB PostgreSQL (good for demos, sleeps after 15min idle)

### Alternative All-in-One: Railway
Deploy frontend + backend + database in a single project.

---

## Deployment Steps (Railway)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/crud-app.git
git push -u origin main
```

### 2. Backend (Railway)
1. Go to https://railway.app
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repo
4. Add a **PostgreSQL** plugin (free tier)
5. Set environment variables in Railway dashboard:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ConnectionStrings__DefaultConnection= (auto-filled by Postgres plugin)
   Jwt__Key= (your secure key, 32+ chars)
   Jwt__Issuer=Backend
   Jwt__Audience=Frontend
   ```
6. Railway auto-detects .NET and runs `dotnet run`
7. Your API URL: `https://backend.up.railway.app`

### 3. Frontend (Vercel)
1. Go to https://vercel.com
2. Click **Add New** → **Project** → Import your GitHub repo
3. Set **Root Directory** to `Frontend`
4. Set environment variable:
   ```
   VITE_API_URL=https://backend.up.railway.app/api
   ```
5. Update `Frontend/src/api/axios.ts` to use `import.meta.env.VITE_API_URL` as baseURL
6. Deploy — Vercel auto-detects Vite config

### 4. Update Frontend API URL
In `Frontend/src/api/axios.ts`, change:
```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
```

---

## Architecture Summary
```
User → Vercel CDN (React SPA)
         ↓ API calls
      Railway (ASP.NET Core API)
         ↓
      Railway PostgreSQL
```
