# Coolify Deployment on Hostinger VPS – Problems & Fixes

Summary of issues encountered when deploying the Zyntherraa app (frontend + backend) with Coolify on a Hostinger VPS, and how they were fixed.

---

## 1. Frontend build failed (Node version)

**Problem:** Nixpacks used Node 18 by default. The app uses `react-router-dom@7`, which requires **Node >= 20**. Build failed or showed engine warnings.

**Fix (in repo):**
- `package.json`: added `"engines": { "node": ">=20.0.0" }`
- `nixpacks.toml`: set `NIXPACKS_NODE_VERSION = "22"`
- `.nvmrc`: added `22`

**Coolify:** You can also set build env var `NIXPACKS_NODE_VERSION=22` for the frontend app.

---

## 2. Frontend: WebSocket / “insecure connection” on HTTPS

**Problem:** After deploy, the site (e.g. https://zyntherraa.com) showed:
`Failed to construct 'WebSocket': An insecure WebSocket connection may not be initiated from a page loaded over HTTPS.`
Production was running **`npm start`** (dev server), which injects the webpack-dev-server client and tries to use `ws://`.

**Fix (in repo):**
- Root `package.json`: added script `"start:prod": "serve -s build -l ${PORT:-3000}"` and dependency `"serve": "^14.2.4"`
- Root `nixpacks.toml`: set `[start] cmd = "npm run start:prod"` so production **serves the built static files** instead of the dev server.

---

## 3. Backend: “Missing script: start:prod”

**Problem:** Coolify runs `npm run start:prod` (from root `nixpacks.toml`) for **both** frontend and backend. The backend’s `package.json` had no `start:prod` script, so the backend container failed with “Missing script: start:prod”.

**Fix (in repo):**
- `backend/package.json`: added `"start:prod": "node dist/server.js"` (same as `start`, so the same command works in Coolify).

---

## 4. Backend build failed: `invalidateCache` not found

**Problem:** Backend TypeScript build failed:
`src/routes/products.ts(331,11): error TS2304: Cannot find name 'invalidateCache'` (and other lines).

**Fix (in repo):**
- `backend/src/routes/products.ts`: added  
  `import { invalidateCache } from '../utils/cache';`

**Deploy:** Ensure this change is **committed and pushed** to the branch Coolify builds from (e.g. `main`). If the error persists, trigger a **rebuild without cache** in Coolify.

---

## 5. MongoDB: “Authentication failed” and restart loop

**Problem:**
- Backend could not connect: `MongoDB Connection Error: Authentication failed`.
- Backend called `process.exit(1)` on first failure, so the container kept restarting (restart loop).

**Fixes:**

**A) Connection string (in Coolify env for backend):**
- Use the **database name** in the path: `/zyntherraa` before `?`, e.g.  
  `mongodb://USER:PASSWORD@HOST:27017/zyntherraa?directConnection=true`
- For user `root` (or user created in `admin` db), add:  
  `&authSource=admin`  
  Example:  
  `mongodb://root:PASSWORD@HOST:27017/zyntherraa?directConnection=true&authSource=admin`
- If the password has special characters (`@`, `#`, `:`, `/`, `?`, `%`), **URL-encode** them (e.g. `@` → `%40`).

**B) Backend code (in repo):**
- `backend/src/config/db.ts`: added **retry loop** with backoff and no immediate `process.exit(1)` so the app keeps retrying MongoDB instead of crashing. On auth errors, logs now show a short hint (credentials, authSource, URL-encoding).

---

## 6. Running commands in the wrong container

**Problem:** Running `npm run start:prod` (or any Node command) in the **MongoDB** container gave `npm: not found`, because that container only runs the database.

**Fix:** In Coolify, open the **Terminal** for the **application** (frontend or backend), not the database. Choose the **application container** in the dropdown, then run commands there.

---

## 7. Security (secrets)

**Problem:** MongoDB URI and JWT secret were pasted in chat or in env dumps.

**Fix:** Treat those as compromised: **rotate** MongoDB password and JWT secret, and set the new values only in Coolify’s environment variables (never commit real secrets to Git).

---

## Checklist before / after deploy

| Item | Where | Action |
|------|--------|--------|
| Node 20+ for frontend | Repo + optional Coolify env | Root `nixpacks.toml`, root `package.json` engines, `.nvmrc`; or `NIXPACKS_NODE_VERSION=22` |
| Serve frontend build, not dev server | Repo | `start:prod` + `serve` in root `package.json`, `[start]` in root `nixpacks.toml` |
| Backend start command + Node 22 | Repo | `start:prod` in `backend/package.json`; `backend/nixpacks.toml` for Base Directory = backend |
| invalidateCache import | Repo | Import in `backend/src/routes/products.ts`; commit & push |
| MongoDB URI | Coolify backend env | Correct user, password, `/zyntherraa`, `authSource=admin`, URL-encode password |
| MongoDB retry / no exit(1) | Repo | `backend/src/config/db.ts` retry logic; commit & push |
| Which container to use | Coolify UI | Use app container for Node/npm, not the DB container |
| Secrets | Coolify / ops | Rotate if exposed; set only in Coolify env |

---

## Correct Coolify setup

- **Two applications in Coolify:**  
  - **Frontend:** Build from repo root (no base directory). Uses root `package.json`, root `nixpacks.toml`. Build = `npm run build`, start = `npm run start:prod` (serves `build/` with `serve`).  
  - **Backend:** Build from repo with **Base Directory** = `backend`. Uses `backend/package.json`, `backend/nixpacks.toml`. Build = `npm ci` + `npm run build`, start = `npm run start:prod` (= `node dist/server.js`).
- **One MongoDB** service; backend connects via `MONGO_URI` or `MONGODB_URI` in its environment variables.
- **Backend env in Coolify:** Set `MONGO_URI` (e.g. `mongodb://user:pass@host:27017/zyntherraa?directConnection=true&authSource=admin`), `CORS_ORIGIN`, `JWT_SECRET`, `NODE_ENV=production`, etc. Never commit real secrets to Git.
