# Tamales Commerce Architecture

## 1. Architectural Rule (Mandatory)
Request flow must follow:

`frontend -> api controller -> core controller -> service -> db`

This rule keeps HTTP concerns, business orchestration, and data logic separated.

## 2. High-Level Components
- Frontend (`frontend/src`)
  - React + Vite + TypeScript
  - Tailwind CSS + shadcn/ui
  - Calls backend REST endpoints only
- Backend (`backend/src`)
  - Express + TypeScript
  - Layered modules:
    - API Controllers: request/response adaptation
    - Core Controllers: use-case orchestration and business flow decisions
    - Services: domain/data operations and integration with DB/Redis
    - DB: PostgreSQL (Prisma)
- Redis
  - Caching frequently read data (e.g., product list fragments, coupon lookups)
  - Transient workflows as needed

## 3. Backend Layer Responsibilities
- API Controller
  - Parse input and auth context.
  - Call core controller with normalized DTOs.
  - Map domain errors to HTTP responses.
- Core Controller
  - Enforce use-case order and policy-level logic.
  - Coordinate one or more services.
  - Keep HTTP-free and DB-query-free.
- Service
  - Encapsulate business operations with Prisma/Redis access.
  - Handle transactions and consistency.
- DB
  - PostgreSQL schema via Prisma models/migrations.

## 4. Proposed Module Layout (Backend)
```
backend/src/
  modules/
    auth/
      api/
      core/
      service/
      schema/
      types/
    products/
      api/
      core/
      service/
      schema/
      types/
    categories/
    cart/
    addresses/
    coupons/
    checkout/
    orders/
    inventory/
  shared/
    config/
    middleware/
    errors/
    logger/
    redis/
    prisma/
    types/
```

## 5. Data Stores
- PostgreSQL
  - Source of truth for users, products, inventory, carts, coupons, orders.
- Redis
  - Read-through or cache-aside for selected list/detail queries.
  - Fast lookup keys for coupon validation and temporary checkout snapshots.

## 6. Security Baseline
- Access + refresh token strategy with short-lived access token.
- Password hashing with `bcrypt`.
- Input validation (`zod` at API boundary).
- Helmet + CORS + rate limiting.
- Standardized error envelope without sensitive leakage.

## 7. Observability Baseline
- Structured logs with request id.
- Timing logs for critical API endpoints.
- Health endpoint for app and dependencies.

## 8. Frontend Architecture
- Route groups:
  - Public: home, catalog, product detail.
  - Auth: login/register.
  - Customer: cart, checkout, orders, addresses.
  - Admin: products, categories, inventory, coupons, order management.
- Data fetching
  - React Query for server state and cache invalidation.
- UI System
  - Tailwind tokens + shadcn components.

## 9. Deployment Target
- Frontend: Vercel.
- Backend: Render or Railway or Fly.io.
- DB: Neon or Supabase Postgres.
- Redis: managed Redis (provider paired with backend host).
