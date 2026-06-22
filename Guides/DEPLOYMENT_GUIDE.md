# Deployment Guide — Railway

This guide covers the Railway deployment path used in this project.

## Architecture

```
User → Railway Frontend (Nginx → SPA)
         ↓ API calls (via window.__API_URL__)
       Railway Backend (ASP.NET Core)
         ↓
       Railway PostgreSQL
```

## Prerequisites

- GitHub repo with the project pushed
- Railway account (https://railway.app)

## Step 1: Push to GitHub

```bash
git add -A
git commit -m "Initial commit"
git branch -m master main
git remote add origin https://github.com/yourusername/crud-app.git
git push -u origin main
```

## Step 2: Create Railway Project

1. Go to https://railway.app → **New Project**
2. Select **Deploy from GitHub repo**
3. Install the Railway GitHub app and select your repo

## Step 3: Add PostgreSQL

1. In your Railway project, click **+ New** → **Database** → **Add PostgreSQL**
2. Click the PostgreSQL service
3. Go to **Variables** tab → copy the `DATABASE_URL` value

## Step 4: Deploy Backend Service

1. Click **+ New** → **GitHub Repo** → select your repo
2. Set **Root Directory** to `Backend`
3. Go to the service **Variables** tab and add:

   | Variable Name | Value |
   |---|---|
   | `ASPNETCORE_ENVIRONMENT` | `Production` |
   | `ASPNETCORE_URLS` | `http://0.0.0.0:8080` |
   | `ConnectionStrings__DefaultConnection` | Convert `DATABASE_URL` from PostgreSQL: `Host=host;Port=5432;Database=dbname;Username=user;Password=pass;SSL Mode=Require;Trust Server Certificate=true` |
   | `Jwt__Key` | `YourSuperSecretKey32CharsLong!` |
   | `Jwt__Issuer` | `Backend` |
   | `Jwt__Audience` | `Frontend` |

4. Generate a public URL: **Settings** → **Generate Domain** → port **8080**
5. Note the generated URL (e.g. `https://backend-production-xxxx.up.railway.app`)

## Step 5: Deploy Frontend Service

1. Click **+ New** → **GitHub Repo** → select your repo
2. Set **Root Directory** to `Frontend`
3. Go to **Variables** tab and add:

   | Variable Name | Value |
   |---|---|
   | `API_URL` | `https://backend-production-xxxx.up.railway.app/api` |

4. The `entrypoint.sh` script writes this value into `config.js` at container startup
5. The SPA reads `window.__API_URL__` from `config.js` for all API calls
6. Generate a public URL: **Settings** → **Generate Domain** → port **80**

## Step 6: Verify

1. Open the frontend URL in your browser
2. Press **F12** → Console → type `window.__API_URL__` — should show the backend URL with `/api`
3. Register a user and test CRUD operations

## Environment Variables Summary

### Backend
| Variable | Purpose |
|---|---|
| `ASPNETCORE_URLS` | Binds to port 8080 (must match Generate Domain port) |
| `ConnectionStrings__DefaultConnection` | Railway PostgreSQL connection string |
| `Jwt__Key` | Secret key for signing JWT tokens (min 32 chars) |

### Frontend
| Variable | Purpose |
|---|---|
| `API_URL` | Backend URL with `/api` suffix, injected into `config.js` at runtime |

## Local Development

```bash
docker compose up -d
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Nginx proxies `/api/*` to backend container via Docker DNS

## Troubleshooting

| Symptom | Fix |
|---|---|
| Backend can't connect to DB | Verify `ConnectionStrings__DefaultConnection` matches the PostgreSQL `DATABASE_URL` |
| `window.__API_URL__` is undefined | Add `<script src="/config.js">` before the module script in `index.html` |
| 405 / 404 on API calls | Verify `API_URL` includes `/api` at the end and is set correctly |
| Nginx "host not found in upstream" | Frontend Nginx should only serve static files — no proxy_pass to "backend" hostname on Railway |
