# Tamales Commerce

Portfolio-focused full stack ecommerce project.

## Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Express + TypeScript
- Data: PostgreSQL + Prisma + Redis
- Docs: OpenAPI (Swagger UI)
- Testing: Vitest (integration/e2e scaffolding)

## Architecture Rule
`frontend -> api controller -> core controller -> service -> db`

## Project Structure
- `frontend/` main web app
- `backend/` API server
- `docs/` requirements, architecture, API contract, decision history

## Quick Start
1. Frontend
```bash
cd frontend
npm install
npm run dev
```
2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

## API Docs
- Swagger UI: `http://localhost:4000/docs`

## Decisions Log
- See `docs/decision-context.md`
