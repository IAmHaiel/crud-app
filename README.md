# CRUD App

A full-stack CRUD application with JWT authentication built with ASP.NET Core, React, and PostgreSQL.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + TypeScript + Vite |
| **Backend** | ASP.NET Core Web API (.NET 10) |
| **Database** | PostgreSQL |
| **Auth** | JWT (JSON Web Tokens) |
| **ORM** | Entity Framework Core |
| **Containerization** | Docker + Docker Compose |

## Quick Start

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (optional)

### Run Locally (without Docker)

**1. Database**
```bash
# Create a PostgreSQL database named "crudapp"
psql -U postgres -c "CREATE DATABASE crudapp;"
```

**2. Backend**
```bash
cd Backend
# Update connection string in appsettings.json if needed
dotnet run
# API runs at http://localhost:5000
```

**3. Frontend**
```bash
cd Frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### Run with Docker
```bash
docker compose up -d
# App: http://localhost:5173
# API: http://localhost:8080
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Log in |
| GET | `/api/products` | Yes | List products |
| GET | `/api/products/{id}` | Yes | Get product |
| POST | `/api/products` | Yes | Create product |
| PUT | `/api/products/{id}` | Yes | Update product |
| DELETE | `/api/products/{id}` | Yes | Delete product |

## Project Structure

```
Backend/                     # ASP.NET Core API
├── Controllers/             # API endpoints
├── Data/                    # EF Core DbContext
├── DTOs/                    # Request/response models
├── Interfaces/              # Service contracts
├── Models/                  # Database models
├── Services/                # Business logic
└── Program.cs               # App setup (DI, JWT, CORS)

Frontend/                    # React SPA
├── src/
│   ├── api/                 # Axios API client
│   ├── context/             # Auth context
│   ├── pages/               # Login, Register, Dashboard, Products
│   └── components/          # Navbar, ProtectedRoute
└── Dockerfile

Guides/
├── SETUP_GUIDE.md           # PostgreSQL install & setup
├── DEPLOYMENT_GUIDE.md      # Railway deployment
├── INDUSTRY_DEPLOYMENT.md   # Azure + Vercel deployment
└── FIXES.md                 # Common issues & solutions
```

## Deployment Guides

| Guide | When to Use |
|---|---|
| `Guides/DEPLOYMENT_GUIDE.md` | Quick demo on Railway (free, 30 min setup) |
| `Guides/INDUSTRY_DEPLOYMENT.md` | Production deployment on Azure + Vercel + GitHub Actions |
| `Guides/SETUP_GUIDE.md` | PostgreSQL installation walkthrough |
| `Guides/FIXES.md` | Troubleshooting common issues |
