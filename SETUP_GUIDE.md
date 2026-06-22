# PostgreSQL Setup Guide

## Download & Install PostgreSQL

### Windows
1. Go to https://www.postgresql.org/download/windows/
2. Download the interactive installer (latest version)
3. Run the installer
4. During installation:
   - Set a password for the `postgres` user (remember it)
   - Keep default port **5432**
   - Select the components: PostgreSQL Server, pgAdmin 4, Command Line Tools
5. Complete the installation

### macOS
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Create Database & User

Open a terminal/command prompt and run:

```bash
# Connect to PostgreSQL as admin
psql -U postgres

# At the psql prompt, run:
CREATE DATABASE crudapp;
\q
```

## Update Connection String

In `Backend/appsettings.json`, update the connection string if your PostgreSQL credentials differ:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=crudapp;Username=postgres;Password=yourpassword"
}
```

## Verify Connection

Run the backend:

```bash
cd Backend
dotnet run
```

The app will auto-create tables on startup via `EnsureCreated()`.

## pgAdmin (GUI Tool)
- Installed with PostgreSQL on Windows
- Launch pgAdmin 4
- Connect to your local server with the password you set
- You can browse tables, run queries, inspect data visually

---

# How to Run the Project

## Prerequisites
- .NET 10 SDK
- Node.js 18+
- PostgreSQL (running on localhost:5432)

## Step 1: Start PostgreSQL
Make sure PostgreSQL service is running.

## Step 2: Run the Backend
```bash
cd Backend
dotnet run
```
The API will be available at `http://localhost:5000`.

## Step 3: Run the Frontend
```bash
cd Frontend
npm run dev
```
The UI will be available at `http://localhost:5173`.

## API Endpoints
| Method | Endpoint             | Auth Required | Description       |
|--------|----------------------|---------------|-------------------|
| POST   | /api/auth/register   | No            | Register a user   |
| POST   | /api/auth/login      | No            | Login             |
| GET    | /api/products        | Yes           | List products     |
| GET    | /api/products/{id}   | Yes           | Get product by ID |
| POST   | /api/products        | Yes           | Create product    |
| PUT    | /api/products/{id}   | Yes           | Update product    |
| DELETE | /api/products/{id}   | Yes           | Delete product    |
