# Deployment Runbook

## Target Architecture
- Frontend: Netlify (`frontend/`)
- Backend: Render (`backend/`)
- Database: Neon Postgres
- Cache: Upstash Redis

## 1. Provision Managed Services
1. Create Neon Postgres database.
2. Create Upstash Redis database.
3. Copy both connection strings.

## 2. Backend Deployment (Render)
### Option A: Blueprint
- Use `render.yaml` from repo root.
- Set env vars in Render dashboard:
  - `DATABASE_URL`
  - `REDIS_URL`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `FRONTEND_ORIGIN` (set after frontend URL is known)

### Option B: Manual Service
- Root Directory: `backend`
- Build Command: `npm install && npm run prisma:generate && npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/v1/health`

## 3. Run Production Migrations
Run once against production DB:
```bash
cd backend
DATABASE_URL="<your-production-db-url>" npm run prisma:migrate:deploy
```

## 4. Frontend Deployment (Netlify)
- Import repo in Netlify from GitHub.
- Set **Base directory** to `frontend`.
- Build command: `npm run build`
- Publish directory: `dist`
- Set environment variable:
  - `VITE_API_BASE_URL=https://<your-backend-domain>/api/v1`

`frontend/netlify.toml` already includes SPA rewrite fallback:
- `/* -> /index.html` (status 200)

## 5. Final Cross-Origin Cookie Setup
After Netlify URL is live, set backend env:
- `FRONTEND_ORIGIN=https://<your-netlify-domain>`

Why: backend CORS uses this in production with `credentials: true`, and refresh cookie is sent with:
- `httpOnly: true`
- `sameSite: none`
- `secure: true`

## 6. Post-Deploy Smoke Checks
1. `GET /api/v1/health`
2. Register + login
3. Refresh session
4. Cart add/update/remove/clear
5. Checkout preview
6. Admin guard route behavior
