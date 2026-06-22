# Fixes & Issues Log

## 1. PostgreSQL: `psql` command not found

**Symptom:** Running `psql -U postgres` gives "not recognized as a cmdlet"

**Fix:** Add PostgreSQL's `bin` folder to system PATH.
```
Path: E:\PostgreSQL\18\bin
```
Or run directly: `& "E:\PostgreSQL\18\bin\psql.exe" -U postgres`

---

## 2. Backend: Port mismatch (5047 vs 5000)

**Symptom:** Frontend gets `ERR_CONNECTION_REFUSED` calling `localhost:5000`

**Cause:** Backend `launchSettings.json` had `applicationUrl: http://localhost:5047`, frontend axios called `localhost:5000`.

**Fix:** Changed `launchSettings.json` to use port 5000.

---

## 3. Git: `src refspec main does not match any`

**Symptom:** `git push -u origin main` fails

**Cause:** Default branch was `master`, not `main`, and no commits existed.

**Fix:**
```
git add -A
git commit -m "Initial commit"
git branch -m master main
git push -u origin main
```

---

## 4. Railway: Railpack couldn't determine how to build

**Symptom:** Railway tries to build the monorepo but doesn't know which service to build.

**Fix:** Create separate services in Railway, each pointing to a subdirectory:
- Backend → Root Directory: `Backend/`
- Frontend → Root Directory: `Frontend/`

---

## 5. Nginx: `host not found in upstream "backend"`

**Symptom:** Frontend container crashes with "host not found in upstream backend"

**Cause:** `nginx.conf` had `proxy_pass http://backend:8080`, but on Railway, services are independent — no internal DNS like Docker Compose.

**Fix:** Removed the proxy from `nginx.conf`. Frontend Nginx now only serves static files. The SPA calls the backend directly via `API_URL`.

---

## 6. Frontend: `window.__API_URL__` was `undefined`

**Symptom:** API calls go to the frontend's own URL (405 error)

**Cause:** `config.js` from `public/` was never loaded — no `<script>` tag in `index.html`.

**Fix:** Added `<script src="/config.js"></script>` in `index.html` before the module script.

---

## 7. Backend: Can't connect to PostgreSQL on Railway

**Symptom:** `Failed to connect to 127.0.0.1:5432`

**Cause:** `appsettings.json` has hardcoded `localhost`, but Railway's DB is at a different host.

**Fix:** Set `ConnectionStrings__DefaultConnection` as a Railway env var with the PostgreSQL plugin's connection string.

---

## 8. Frontend: `API_URL` env var not picked up in Railway

**Symptom:** `window.__API_URL__` still shows `/api` even after setting `API_URL`

**Cause:** `sed` command in Dockerfile wasn't reliably replacing the value. Railway's Docker runtime didn't pass the env var correctly.

**Fix:** Created `entrypoint.sh` that writes `config.js` at container startup using the `$API_URL` env var. Updated Dockerfile to use `ENTRYPOINT` instead of `CMD`.

---

## 9. Frontend: `VITE_API_URL` not picked up in Vercel

**Symptom:** `window.__API_URL__` shows `/api` even after setting `VITE_API_URL`

**Cause:** The axios code checked `window.__API_URL__` before `import.meta.env.VITE_API_URL`, so the static `config.js` (`"/api"`) took priority.

**Fix:** Changed priority order in `axios.ts`:
```
import.meta.env.VITE_API_URL || window.__API_URL__ || "/api"
```

---

## 10. Frontend: 404 on page refresh (SPA routing)

**Symptom:** Refreshing `/dashboard` or `/products` shows 404

**Cause:** Vercel tries to find a file at that path, but the SPA only has `index.html`.

**Fix:** Added `Frontend/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 11. GitHub Actions: ACR authentication failed

**Symptom:** `UNAUTHORIZED: authentication required` when deploying backend

**Cause:** Azure Container Apps didn't have credentials to pull from ACR.

**Fix:** Added `az containerapp registry set` step in the workflow to configure ACR credentials on the container app.

---

## 12. GitHub Actions: Vercel CLI outdated

**Symptom:** `Your Vercel CLI version is outdated. This endpoint requires version 47.2.2 or later.`

**Cause:** `amondnet/vercel-action@v25` uses Vercel CLI 25.1.0, which is too old.

**Fix:** Replaced with `npx vercel@latest --prod --token ... --yes` directly in the workflow.

---

## 13. GitHub Actions: Double path `Frontend/Frontend`

**Symptom:** `The provided path "~/work/crud-app/Frontend/Frontend" does not exist`

**Cause:** Vercel project Root Directory = `Frontend`, and the workflow also ran `cd Frontend`.

**Fix:** Removed `cd Frontend` from the workflow. Vercel's project setting already points to `Frontend/`.

---

## 14. Azure CLI: PowerShell line continuation

**Symptom:** `Missing expression after unary operator '--'`

**Cause:** PowerShell uses backtick (`` ` ``) for line continuation, not backslash (`\`).

**Fix:** Put all Azure CLI commands on a single line. Updated `INDUSTRY_DEPLOYMENT.md` to use single-line commands.
