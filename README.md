# Tamales Commerce

A portfolio-focused full-stack e-commerce application built with React, Vite, TypeScript, Express.js, PostgreSQL, Prisma, Redis, and OpenAPI/Swagger.

## Why I Built This

I built Tamales Commerce as a full-stack portfolio project to demonstrate production-style architecture across frontend, backend, database, API documentation, and deployment workflows.

## Key Features

- Product browsing and e-commerce-style user flows
- React/Vite frontend with TailwindCSS and shadcn/ui
- Express.js backend with layered architecture
- PostgreSQL database modeled through Prisma
- Redis-backed infrastructure
- Swagger/OpenAPI API documentation
- Deployment-ready configuration
- Test scaffolding with Vitest

## Tech Stack

**Frontend:** React, Vite, TypeScript, TailwindCSS, shadcn/ui  
**Backend:** Express.js, TypeScript  
**Database:** PostgreSQL, Prisma  
**Infrastructure:** Redis  
**Documentation:** OpenAPI / Swagger  
**Testing:** Vitest

## Architecture

```txt
frontend -> api controller -> core controller -> service -> database
```

## Recruiter Summary

This project demonstrates end-to-end ownership across:
- Frontend component architecture and typed API integration
- Backend layering and API design discipline
- Relational schema design with Prisma + PostgreSQL
- Deployment-oriented structure for Netlify (frontend) and Render (backend)

## Screenshots

<!-- TODO: Replace placeholders with actual screenshots from local runs/deployed environments. -->
- `docs/screenshots/home-page.png` (placeholder)
- `docs/screenshots/product-listing.png` (placeholder)
- `docs/screenshots/product-detail.png` (placeholder)
- `docs/screenshots/cart-checkout.png` (placeholder)
- `docs/screenshots/swagger-api-docs.png` (placeholder)

## Project Structure

- `frontend/` main web app
- `backend/` API server
- `docs/` requirements, architecture, API contract, decision history

## Setup and Run

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

- [Swagger UI (local)](http://localhost:4000/docs)
- [Swagger UI (hosted)](https://tamales-commerce-backend.onrender.com/docs/#/)

## Deployment

- [Deployment runbook](docs/deployment.md)
- [Render blueprint config](render.yaml)
- [Netlify config (build + SPA routing)](frontend/netlify.toml)

## Decision Context

- [Decision context log](docs/decision-context.md)
