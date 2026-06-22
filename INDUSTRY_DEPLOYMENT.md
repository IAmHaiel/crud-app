# Industry-Standard Deployment Guide

This guide describes a production-grade deployment stack suitable for real clients, while remaining affordable for capstone projects (free tiers and student credits available).

## Recommended Stack

| Layer | Service | Why It's Industry Standard | Cost |
|---|---|---|---|
| **Frontend** | Vercel | Used by Vercel, Next.js, millions of production apps | Free tier (100GB bandwidth) |
| **Backend** | Azure Container Apps | Serverless containers, auto-scaling, used by enterprises | Free with Azure for Students ($100 credits) |
| **Database** | Azure Database for PostgreSQL | Managed, HA, auto-backups, production-grade | Free with student credits (~$15/mo otherwise) |
| **CI/CD** | GitHub Actions | Industry standard, used by every major company | Free for public repos (2000 min/mo) |
| **Container Registry** | GitHub Container Registry | Integrated with GitHub Actions | Free for public images |
| **Domain + DNS** | Cloudflare | CDN, DDoS protection, SSL, used by 20%+ of web | Free tier |
| **Monitoring** | Application Insights (Azure) | Production observability, integrated with .NET | Free tier (5GB/month) |

**Total cost with student credits: $0/mo for 12+ months**

---

## Architecture

```
User → Cloudflare (CDN, SSL, DDoS)
         ├── static assets → Vercel (React SPA)
         └── /api/*        → Azure Container Apps (ASP.NET Core)
                                ↓
                              Azure Database for PostgreSQL
```

All infrastructure is defined as code, deployed via GitHub Actions CI/CD.

---

## Prerequisites

- Azure for Students account (https://azure.microsoft.com/free/students) — gives $100 credits, no credit card needed
- Vercel account (https://vercel.com)
- GitHub repo with the project pushed
- A domain name ($8-12/yr from Cloudflare or Namecheap — optional but recommended)

---

## Step 1: CI/CD Pipeline — GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

      - name: Build and push backend image
        run: |
          docker build -t ghcr.io/${{ github.repository }}/backend:${{ github.sha }} ./Backend
          docker push ghcr.io/${{ github.repository }}/backend:${{ github.sha }}

      - name: Deploy to Azure Container Apps
        run: |
          az containerapp update \
            --name crud-backend \
            --resource-group crud-app \
            --image ghcr.io/${{ github.repository }}/backend:${{ github.sha }}

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: --prod
          working-directory: ./Frontend
```

---

## Step 2: Database — Azure Database for PostgreSQL

```bash
# Install Azure CLI and log in
az login

# Create resource group
az group create --name crud-app --location eastus

# Create PostgreSQL server (free tier with student credits)
az postgres flexible-server create \
  --name crud-db \
  --resource-group crud-app \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --admin-user postgres \
  --admin-password YourStrongPassword!
```

Get the connection string from Azure Portal → Connection Strings.

---

## Step 3: Backend — Azure Container Apps

```bash
# Create Container Apps environment
az containerapp env create \
  --name crud-env \
  --resource-group crud-app \
  --location eastus

# Create the backend container app
az containerapp create \
  --name crud-backend \
  --resource-group crud-app \
  --environment crud-env \
  --image ghcr.io/yourusername/crud-app/backend:latest \
  --target-port 8080 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 10 \
  --secrets db-conn-str="Host=..." \
  --env-vars \
    ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://0.0.0.0:8080 \
    ConnectionStrings__DefaultConnection=secretref:db-conn-str \
    Jwt__Key=YourSuperSecretKey32CharsLong! \
    Jwt__Issuer=Backend \
    Jwt__Audience=Frontend
```

Azure Container Apps auto-scales from 1 to 10 instances based on HTTP traffic. When idle, it scales to 0 (consumption plan) or 1 (dedicated).

---

## Step 4: Frontend — Vercel

1. Go to https://vercel.com → **Add New** → **Project** → Import your GitHub repo
2. Set **Root Directory** to `Frontend`
3. Set environment variable:
   ```
   API_URL = https://crud-backend.cleverhill-xxxx.eastus.azurecontainerapps.io/api
   ```
4. Add a custom domain (optional):
   - Vercel → Project → **Domains** → add your domain
   - Cloudflare → DNS → CNAME record pointing to `cname.vercel-dns.com`

Vercel automatically deploys on every push to `main`. It serves the SPA from its global CDN edge network.

---

## Step 5: Domain + SSL — Cloudflare (Recommended)

1. Buy a domain from Cloudflare ($8-12/yr) or transfer an existing one
2. In Cloudflare dashboard → **DNS** → add records:
   - `A` record → `@` → `76.76.21.21` (Vercel's IP)
   - `CNAME` → `api` → `crud-backend.azurecontainerapps.io`
3. Enable **Proxied** (orange cloud) — Cloudflare provides SSL, CDN, and DDoS protection
4. In Vercel: Project → **Domains** → add your domain
5. In Azure Container Apps: **Settings** → **Custom domains** → add `api.yourdomain.com`

---

## Step 6: Monitoring — Application Insights

```bash
# Create Application Insights resource
az monitor app-insights component create \
  --app crud-insights \
  --resource-group crud-app \
  --location eastus

# Get instrumentation key
az monitor app-insights component show \
  --app crud-insights \
  --resource-group crud-app \
  --query instrumentationKey
```

Add to backend environment variables:
```
APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=your-key
```

ASP.NET Core auto-collects:
- Request rates, response times, failure rates
- Dependency tracking (DB queries, HTTP calls)
- Exceptions with stack traces
- Live metrics dashboard

---

## Scaling & Production Features

| Feature | How It's Handled |
|---|---|
| **Auto-scaling** | Azure Container Apps: 1-10 instances based on HTTP concurrency |
| **High availability** | Azure PostgreSQL: zone-redundant deployment option |
| **SSL/TLS** | Cloudflare edge terminates SSL, re-encrypts to origin |
| **CDN** | Vercel global edge network for static assets |
| **Backups** | Azure PostgreSQL: automatic backups with 7-day retention (configurable to 35) |
| **Secrets management** | Azure Container Apps secrets (not env vars for credentials) |
| **Zero-downtime deployments** | Azure Container Apps revision-based with traffic splitting |
| **Logging** | Container Apps logs to Azure Log Analytics |
| **CORS** | Already configured with `AllowAnyOrigin()` in Program.cs |

---

## Cost Breakdown (Without Student Credits)

| Service | Estimated Monthly Cost |
|---|---|
| Vercel (free tier) | $0 |
| Azure Container Apps (1 instance, consumption) | ~$10-15 |
| Azure Database for PostgreSQL (Burstable B1ms) | ~$15 |
| GitHub Actions (free tier) | $0 |
| Cloudflare (free tier) | $0 |
| Domain (annual) | $8-12/yr |
| **Total** | **~$25-30/mo** |

With Azure for Students ($100 free credits), this runs free for **3-4 months**. For production, this scales linearly — adding more instances or a larger DB increases cost predictably.

---

## Comparison: Railway vs. Industry Stack

| Aspect | Railway | Azure + Vercel |
|---|---|---|
| Setup time | 10 minutes | 2-3 hours |
| Learning value | Low | High (what employers look for) |
| Real-world use | Startups, MVPs | Enterprises, production apps |
| Scaling limits | Platform-dependent | Virtually unlimited |
| Compliance (SOC2, HIPAA) | Limited | Full enterprise compliance |
| Monitoring | Basic logs | Application Insights, Log Analytics |
| CI/CD | Auto-deploy from GitHub | GitHub Actions with approvals |
| Cost at scale | Expensive past free tier | Predictable, competitive |

---

## When to Use Which

**Use Railway** when: You need a working demo in 30 minutes for a capstone presentation.

**Use Azure + Vercel** when: The application will have real users/clients who depend on it being reliable, scalable, and secure.
