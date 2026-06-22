# Deployment Guide (No Google Cloud)

## Overview

The project now supports **Docker**, making it portable across any cloud provider that supports containers. Two deployment paths are available:

| Path | When to Use |
|------|-------------|
| **Docker** (recommended) | Deploy the whole stack (frontend + backend + DB) as containers |
| **Separate services** | Deploy frontend (Vercel) + backend (Railway) independently |

---

## Deployment via Docker

### Option A: Railway (easiest — one project, all containers)

1. Push to GitHub
2. Go to https://railway.app → **New Project** → **Deploy from GitHub repo**
3. Select your repo
4. Railway detects the `docker-compose.yml` and creates three services automatically:
   - **db** — PostgreSQL 18
   - **backend** — ASP.NET Core API on port 8080
   - **frontend** — Nginx serving SPA on port 80
5. No extra config needed — everything is in `docker-compose.yml`

### Option B: Fly.io (per-container control)

```bash
# Install flyctl, then launch each service
cd Backend && fly launch --image backend
cd Frontend && fly launch --image frontend
fly postgres create
```

### Option C: Any Docker host (VPS, AWS EC2, Azure VM)

```bash
docker compose up -d
```

The app is served at `http://host:5173`. Nginx automatically proxies `/api/*` requests to the backend container.

---

## Deployment without Docker (Separate Services)

### Frontend → Vercel

1. Go to https://vercel.com → **Add New** → **Project** → Import your GitHub repo
2. Set **Root Directory** to `Frontend`
3. Set environment variable:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app/api
   ```
4. Deploy

### Backend → Railway

1. Go to https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Select your repo
3. Set **Root Directory** to `Backend`
4. Add a **PostgreSQL** plugin
5. Set environment variables:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ConnectionStrings__DefaultConnection= (auto-filled by Postgres plugin)
   Jwt__Key= (your secure key, 32+ chars)
   Jwt__Issuer=Backend
   Jwt__Audience=Frontend
   ```
6. Railway builds and runs the .NET app

### Database

Railway and Render both offer managed PostgreSQL:
- **Railway**: Free dev database (resets after 24h idle) or $5/mo persistent
- **Render**: Free 1GB PostgreSQL (sleeps after 15min idle)

---

## Architecture

### Docker Path
```
User → http://host:5173
         │
      Nginx (frontend container)
         ├── /api/* → backend:8080 (ASP.NET Core)
         └── /*     → static SPA files
                         │
                     backend ─→ db:5432 (PostgreSQL)
```

### Separate Services Path
```
User → Vercel CDN (React SPA)
         ↓ API calls
      Railway (ASP.NET Core API)
         ↓
      Railway PostgreSQL
```

---

## Local Docker Dev

```bash
docker compose up -d
# App: http://localhost:5173
# Backend: http://localhost:8080
# DB: localhost:5432

docker compose down     # Stop
docker compose down -v  # Stop + delete volume
```
