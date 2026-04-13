# Decision Context Log

This document tracks architecture and implementation decisions over time.

## Entry Template
- Date:
- Decision ID:
- Decision:
- Context:
- Options Considered:
- Chosen Option:
- Rationale:
- Risks / Edge Cases:
- Impacted Modules / Files:
- Follow-up Actions:
- Supersedes:

---

## 2026-04-13 | DEC-001 | Product Shape
- Date: 2026-04-13
- Decision ID: DEC-001
- Decision: Start with B2C single-vendor ecommerce.
- Context: Need portfolio-ready scope that is deep but still buildable incrementally.
- Options Considered: Multi-vendor marketplace, B2C single-vendor.
- Chosen Option: B2C single-vendor.
- Rationale: Lower complexity allows stronger implementation quality and faster delivery.
- Risks / Edge Cases: Marketplace-specific concepts deferred and may require later schema expansion.
- Impacted Modules / Files: requirements, architecture, DB schema.
- Follow-up Actions: Keep schema naming generic enough for future vendor extension.
- Supersedes: N/A

## 2026-04-13 | DEC-002 | Core Tech Stack
- Date: 2026-04-13
- Decision ID: DEC-002
- Decision: Use React+Vite+TS frontend; Express+TS backend; PostgreSQL+Prisma; Redis.
- Context: Goal is employability and production-grade learning.
- Options Considered: MongoDB, JS-only stack, no cache in MVP.
- Chosen Option: TypeScript everywhere + Postgres + Prisma + Redis early.
- Rationale: Strong hiring signal and practical backend experience in typed APIs and relational modeling.
- Risks / Edge Cases: Added setup complexity and local env friction.
- Impacted Modules / Files: all repo scaffolding and runtime configuration.
- Follow-up Actions: Add clear setup docs and env validation.
- Supersedes: N/A

## 2026-04-13 | DEC-003 | Architecture Layering Rule
- Date: 2026-04-13
- Decision ID: DEC-003
- Decision: Enforce `frontend -> api controller -> core controller -> service -> db`.
- Context: Required by project constraints and desired maintainability.
- Options Considered: Route handler directly calling service; repository pattern.
- Chosen Option: Strict 4-layer backend flow.
- Rationale: Clear separation of transport, orchestration, and domain/data logic; easier testing.
- Risks / Edge Cases: Possible over-engineering for very simple endpoints.
- Impacted Modules / Files: backend module layout and coding conventions.
- Follow-up Actions: Add lint-like conventions/checklist in contribution docs.
- Supersedes: N/A

## 2026-04-13 | DEC-004 | Checkout/Payment Modeling
- Date: 2026-04-13
- Decision ID: DEC-004
- Decision: Use richer mock payment state machine.
- Context: Need interview-relevant backend depth without real gateway integration.
- Options Considered: Binary success/fail, richer state machine.
- Chosen Option: States `pending`, `authorized`, `failed`, `refunded`.
- Rationale: Teaches lifecycle management and transition validation.
- Risks / Edge Cases: Inconsistent order/payment transitions if not validated transactionally.
- Impacted Modules / Files: checkout, orders, payments, API contract.
- Follow-up Actions: Define allowed transition matrix in code and tests.
- Supersedes: N/A

## 2026-04-13 | DEC-005 | UI System
- Date: 2026-04-13
- Decision ID: DEC-005
- Decision: Tailwind CSS + shadcn/ui for frontend component system.
- Context: Need fast, scalable UI development with maintainable component primitives.
- Options Considered: MUI-only, custom design system from scratch.
- Chosen Option: Tailwind + shadcn/ui.
- Rationale: Good developer speed and strong control over final UI/UX.
- Risks / Edge Cases: Inconsistent styling if design tokens and usage rules are not documented.
- Impacted Modules / Files: frontend setup and component patterns.
- Follow-up Actions: Define UI usage guidelines in frontend docs.
- Supersedes: N/A

## 2026-04-13 | DEC-006 | API-First Scaffolding Before Feature Build
- Date: 2026-04-13
- Decision ID: DEC-006
- Decision: Create requirements, architecture, API contract, and decision log before coding features.
- Context: Need high-confidence implementation path and interview-ready design rationale.
- Options Considered: Immediate coding, docs-first scaffolding.
- Chosen Option: Docs-first scaffolding.
- Rationale: Reduces rework and creates traceable context for future decisions.
- Risks / Edge Cases: Documentation drift if not updated continuously.
- Impacted Modules / Files: `docs/*`, all subsequent modules.
- Follow-up Actions: Update this log on every major decision/change.
- Supersedes: N/A

## 2026-04-13 | DEC-007 | Prisma Version Strategy
- Date: 2026-04-13
- Decision ID: DEC-007
- Decision: Use Prisma v6 for initial learning scaffold instead of v7.
- Context: Prisma v7 configuration changes increase setup complexity for day-1 scaffold.
- Options Considered: Prisma v7 new config model, Prisma v6 stable workflow.
- Chosen Option: Prisma v6.
- Rationale: Keeps schema, client generation, and onboarding straightforward while learning backend fundamentals.
- Risks / Edge Cases: Later migration needed to Prisma v7+.
- Impacted Modules / Files: `backend/package.json`, Prisma config and schema usage.
- Follow-up Actions: Add migration note in future upgrade milestone.
- Supersedes: N/A

## 2026-04-13 | DEC-008 | Test Execution in Restricted Environments
- Date: 2026-04-13
- Decision ID: DEC-008
- Decision: Run handler-level integration tests without socket binding in this environment.
- Context: Sandbox disallows ephemeral listening (`EPERM`), breaking supertest server binding.
- Options Considered: Socket-based integration tests, handler-level behavior tests.
- Chosen Option: Handler-level behavior tests for now.
- Rationale: Keeps behavior verification active despite sandbox constraints.
- Risks / Edge Cases: Does not fully validate middleware chain and HTTP transport.
- Impacted Modules / Files: backend integration test setup.
- Follow-up Actions: Re-enable full HTTP integration tests in CI or unrestricted local env.
- Supersedes: N/A

## 2026-04-13 | DEC-009 | Refresh Token Rotation with DB-backed Revocation
- Date: 2026-04-13
- Decision ID: DEC-009
- Decision: Use access token + refresh token with refresh-token hashing and DB persistence.
- Context: Need secure, interview-grade auth beyond naive stateless JWT-only approach.
- Options Considered: Stateless long-lived JWTs, rotating refresh tokens with revocation store.
- Chosen Option: Rotating refresh tokens, hash stored in DB, revoke on rotation/logout.
- Rationale: Limits blast radius of token leaks and supports forced invalidation.
- Risks / Edge Cases: Token reuse detection not yet implemented; multiple sessions can accumulate tokens.
- Impacted Modules / Files: auth service/core/api, Prisma schema, JWT utilities.
- Follow-up Actions: Add device/session metadata and global sign-out endpoint.
- Supersedes: N/A

## 2026-04-13 | DEC-010 | RBAC Enforcement via Middleware
- Date: 2026-04-13
- Decision ID: DEC-010
- Decision: Centralize authorization checks with `authenticate` and `requireRole` middleware.
- Context: Avoid repeated role checks across controllers.
- Options Considered: Inline controller checks, centralized middleware.
- Chosen Option: Middleware-based checks.
- Rationale: Consistent, testable, and easy to reuse across modules.
- Risks / Edge Cases: Incorrect route wiring can bypass checks if middleware omitted.
- Impacted Modules / Files: routes and shared middleware.
- Follow-up Actions: Add route-level checklist for protected endpoints.
- Supersedes: N/A

## 2026-04-13 | DEC-011 | Allow-List Query Strategy for Product Listings
- Date: 2026-04-13
- Decision ID: DEC-011
- Decision: Enforce allow-listed query params and sort enums for product listing endpoints.
- Context: Prevent unstable/dynamic query behavior and keep API contracts explicit.
- Options Considered: Accept arbitrary query params, allow-list with validation/normalization.
- Chosen Option: Allow-list + normalization in core controller.
- Rationale: Improves security posture, predictability, and API evolvability.
- Risks / Edge Cases: New filters require coordinated code + docs updates.
- Impacted Modules / Files: products api/core/service, tests, openapi docs.
- Follow-up Actions: Reuse this pattern for orders/coupons/admin listings.
- Supersedes: N/A

## 2026-04-13 | DEC-012 | Reused Allow-List Query Pattern for Orders and Admin Listings
- Date: 2026-04-13
- Decision ID: DEC-012
- Decision: Apply strict allow-listed query parsing to `/orders` and `/admin/orders` list endpoints.
- Context: Keep list endpoint behavior consistent across modules and roles.
- Options Considered: Ad-hoc query parsing per endpoint, shared allow-list normalization strategy.
- Chosen Option: Module-level normalizers with explicit allowed keys and sort enums.
- Rationale: Prevents accidental broad filters and improves predictability/testing.
- Risks / Edge Cases: Requires explicit updates when introducing new filter capabilities.
- Impacted Modules / Files: orders api/core/service, routes, tests, openapi docs.
- Follow-up Actions: Apply identical conventions for future admin list endpoints (coupons/products/users).
- Supersedes: N/A

## 2026-04-13 | DEC-013 | Cart Quantity UX with Optimistic + Debounced Sync
- Date: 2026-04-13
- Decision ID: DEC-013
- Decision: Use local optimistic quantity updates with debounced server sync and rollback on mutation error.
- Context: Rapid +/- clicks can trigger excessive network calls and stale writes.
- Options Considered: Immediate per-click mutation, optimistic+debounced+versioned sync.
- Chosen Option: Optimistic local updates + debounced mutations via React Query.
- Rationale: Improves responsiveness while reducing backend write pressure.
- Risks / Edge Cases: Temporary UI/server divergence if requests fail repeatedly.
- Impacted Modules / Files: frontend cart UI and cart api client.
- Follow-up Actions: Add request-id tracing and telemetry for cart update failure rate.
- Supersedes: N/A

## 2026-04-13 | DEC-014 | Checkout Preview Before Order Placement
- Date: 2026-04-13
- Decision ID: DEC-014
- Decision: Introduce `POST /checkout/preview` prior to full order placement endpoint.
- Context: Need pricing transparency and calculation validation before committing orders.
- Options Considered: Direct order placement with implicit pricing, separate preview endpoint.
- Chosen Option: Separate preview endpoint.
- Rationale: Enables deterministic pricing checks and cleaner checkout UX.
- Risks / Edge Cases: Price/stock can change between preview and placement.
- Impacted Modules / Files: checkout api/core/service and cart flow.
- Follow-up Actions: Validate and re-price again at final order placement.
- Supersedes: N/A

## 2026-04-13 | DEC-015 | Frontend Validation + Session Bootstrap Guard
- Date: 2026-04-13
- Decision ID: DEC-015
- Decision: Standardize form validation with `react-hook-form + zod` and add auth bootstrap gate for route guards.
- Context: Frontend had basic HTML validation and auth-route flicker during refresh-token session restore.
- Options Considered: Keep native validation + immediate route redirects, schema-driven validation + bootstrapping guard.
- Chosen Option: Schema-driven validation + explicit `bootstrapping` session state.
- Rationale: Produces deterministic validation behavior, better UX, and stronger interview-ready implementation quality.
- Risks / Edge Cases: Validation schema drift if backend rules change without frontend update.
- Impacted Modules / Files: auth/cart/checkout pages, auth session hook, protected/public/admin routes.
- Follow-up Actions: Reuse schemas for e2e test fixtures and server-client contract checks.
- Supersedes: N/A

## 2026-04-13 | DEC-016 | UI Baseline Upgrade to Reusable shadcn-style Primitives
- Date: 2026-04-13
- Decision ID: DEC-016
- Decision: Replace ad-hoc page markup with reusable UI primitives (`Card`, `Input`, `Label`, `Badge`, `Alert`).
- Context: UI looked inconsistent and non-production-like across screens.
- Options Considered: Keep inline Tailwind classes only, establish reusable component baseline.
- Chosen Option: Reusable component baseline.
- Rationale: Improves consistency, maintainability, and accelerates future page development.
- Risks / Edge Cases: Primitive APIs may need iteration as feature complexity grows.
- Impacted Modules / Files: shared UI components, auth/cart/checkout/admin pages, layout styling.
- Follow-up Actions: Add frontend design guidelines for spacing, states, and color usage.
- Supersedes: N/A

## 2026-04-13 | DEC-017 | Standardized API Error Envelope with Request Traceability
- Date: 2026-04-13
- Decision ID: DEC-017
- Decision: Standardize backend error envelope to include `status`, `path`, `requestId`, and `timestamp` for all error responses.
- Context: Frontend needs predictable error parsing and debugging support in deployed environments.
- Options Considered: Keep minimal error shape (`code/message/details`), enrich envelope with trace metadata.
- Chosen Option: Enriched envelope with request trace metadata.
- Rationale: Improves observability, production debugging speed, and consistent client handling.
- Risks / Edge Cases: Slightly larger payload size and potential request-id inconsistencies if upstream proxies override headers.
- Impacted Modules / Files: request context middleware, not-found handler, global error handler.
- Follow-up Actions: Add request-id propagation in monitoring and logs dashboard.
- Supersedes: N/A

## 2026-04-13 | DEC-018 | Typed Frontend API Errors and Auth-aware Recovery
- Date: 2026-04-13
- Decision ID: DEC-018
- Decision: Introduce `ApiClientError` and map `401/403/422` behaviors in frontend hooks.
- Context: Generic `Error` handling made UX and debugging ambiguous across auth/cart flows.
- Options Considered: Keep string-only error handling, typed client error model with status/code metadata.
- Chosen Option: Typed client error model.
- Rationale: Enables deterministic UI behavior by status class and cleaner hook-level control flow.
- Risks / Edge Cases: Requires keeping client error parser aligned with backend contract.
- Impacted Modules / Files: frontend API client and auth/cart hooks.
- Follow-up Actions: Surface `requestId` in debug UI and QA logs when available.
- Supersedes: N/A

## 2026-04-13 | DEC-019 | Inline 422 Field Mapping for Frontend Forms
- Date: 2026-04-13
- Decision ID: DEC-019
- Decision: Map backend `422 VALIDATION_ERROR` details to field-level errors via `react-hook-form`.
- Context: Status-only error messaging is insufficient for good UX and interviewer-grade validation handling.
- Options Considered: Show generic toast/status errors, map backend field errors inline.
- Chosen Option: Inline field-level mapping.
- Rationale: Faster user correction loops and stronger client-server contract alignment.
- Risks / Edge Cases: Requires key alignment between backend field names and frontend form fields.
- Impacted Modules / Files: auth/cart/checkout forms, frontend API error parsing utility.
- Follow-up Actions: Add shared typing/generator for backend validation field keys.
- Supersedes: N/A

## 2026-04-13 | DEC-020 | Frontend API Error Parsing Utility + Contract Tests
- Date: 2026-04-13
- Decision ID: DEC-020
- Decision: Centralize client error envelope parsing (`fieldErrors`, `formErrors`, `requestId`) in `lib/api-error.ts` and test it with Vitest.
- Context: Repeated ad-hoc parsing across hooks/pages increases drift risk.
- Options Considered: Parse per-page, shared utility with tests.
- Chosen Option: Shared utility + tests.
- Rationale: Single source of truth improves reliability and maintainability.
- Risks / Edge Cases: Parser must be updated if backend envelope format changes.
- Impacted Modules / Files: frontend error utilities, hooks, forms, test setup.
- Follow-up Actions: Add component/integration tests for complete form submission flows.
- Supersedes: N/A

## 2026-04-13 | DEC-021 | Product Catalog as Primary Frontend Entry Module
- Date: 2026-04-13
- Decision ID: DEC-021
- Decision: Introduce a dedicated `/products` page as the primary app landing route with server-driven filtering, sorting, and pagination.
- Context: Needed to shift progress from error-hardening to feature breadth for portfolio impact.
- Options Considered: Keep auth/cart as first user touchpoint, move to catalog-first journey.
- Chosen Option: Catalog-first journey.
- Rationale: Better ecommerce UX flow and stronger demo narrative for product/company interviews.
- Risks / Edge Cases: Add-to-cart from catalog requires auth gating and clear user messaging for guests.
- Impacted Modules / Files: frontend routing, nav layout, product API client, products page UI.
- Follow-up Actions: Add order-history and admin-order modules as next screens.
- Supersedes: N/A

## 2026-04-13 | DEC-022 | My Orders Frontend Module with Server-side Filters
- Date: 2026-04-13
- Decision ID: DEC-022
- Decision: Add protected `/orders` page backed by `GET /orders` with filter/sort/pagination controls.
- Context: Needed a user-facing post-checkout lifecycle module to improve ecommerce flow completeness.
- Options Considered: Minimal static orders placeholder, full server-driven listing module.
- Chosen Option: Full server-driven listing module.
- Rationale: Strengthens portfolio narrative around authenticated user account workflows.
- Risks / Edge Cases: Limited order payload currently prevents rich item-level detail rendering.
- Impacted Modules / Files: frontend orders page, routing, nav, API client types/functions.
- Follow-up Actions: Add order detail endpoint/page with line items and address snapshot.
- Supersedes: N/A

## 2026-04-13 | DEC-023 | Admin Orders Frontend Module with User-Level Filter
- Date: 2026-04-13
- Decision ID: DEC-023
- Decision: Add protected `/admin/orders` page backed by `GET /admin/orders` with `userId + status + paymentStatus + sort + pagination` controls.
- Context: Needed an admin-facing operations surface using existing backend order listing capabilities.
- Options Considered: Keep admin as basic role-check screen, add functional admin order management listing.
- Chosen Option: Functional admin order listing.
- Rationale: Demonstrates role-based UI capabilities and real operational visibility for portfolio/interviews.
- Risks / Edge Cases: Large tables may require virtualized rendering in later phases.
- Impacted Modules / Files: frontend admin orders page, API client, routing, nav.
- Follow-up Actions: Add order-status update actions and optimistic admin mutations.
- Supersedes: N/A

## 2026-04-13 | DEC-024 | Admin Order Status State Machine with Audit Trail
- Date: 2026-04-13
- Decision ID: DEC-024
- Decision: Implement admin-only order status update endpoint with strict transition matrix and persistent transition audit records.
- Context: Admin operations required real status lifecycle management beyond read-only order listings.
- Options Considered: Direct unrestricted status overwrite, restricted transition matrix with audit persistence.
- Chosen Option: Restricted transition matrix with audit persistence.
- Rationale: Prevents invalid lifecycle states and creates traceable operational history for production-grade workflows.
- Risks / Edge Cases: Concurrent updates can conflict; service now returns `409` for stale expected status conflicts.
- Impacted Modules / Files: orders api/core/service, prisma schema+migration, admin orders frontend, openapi contract.
- Follow-up Actions: Add dedicated admin timeline UI for order status transitions and optimistic row-level updates.
- Supersedes: N/A

## 2026-04-13 | DEC-025 | Admin Order Transition Timeline Read Model
- Date: 2026-04-13
- Decision ID: DEC-025
- Decision: Add admin endpoint and UI to fetch/view status transition history per order.
- Context: After enabling status updates, admins need traceability into who changed status and when.
- Options Considered: Keep audit write-only in DB, expose read model endpoint for timeline visualization.
- Chosen Option: Expose read model endpoint + timeline panel in admin UI.
- Rationale: Improves operational debugging and gives complete lifecycle visibility.
- Risks / Edge Cases: Additional per-order query cost when opening timelines; can be optimized with caching later.
- Impacted Modules / Files: orders api/core/service, routes, openapi, admin orders frontend page, API client.
- Follow-up Actions: Add pagination for long transition histories and actor role snapshots.
- Supersedes: N/A
