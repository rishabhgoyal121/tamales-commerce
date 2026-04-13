# Tamales Commerce Requirements

## 1. Product Vision
Build a production-grade, portfolio-ready B2C ecommerce platform that demonstrates end-to-end full stack ownership using React + Vite + TypeScript on frontend and Express + TypeScript on backend.

## 2. Goals
- Deliver a clean customer shopping flow: browse -> cart -> checkout -> order tracking.
- Deliver an admin flow in the same frontend app: manage products, categories, inventory, coupons, and order states.
- Demonstrate scalable backend practices: layered architecture, validation, auth, caching, observability, testing, and API documentation.
- Keep decision history in a persistent log to support safe future refactors.

## 3. User Roles
- Guest: browse catalog, search/filter, add items to cart, start checkout.
- Customer: authenticated buyer with address book, cart, coupon apply/remove, order creation, and order history.
- Admin: manage catalog, inventory, coupons, and order status transitions.

## 4. Functional Scope (MVP)
- Authentication
  - Register/login with email/password.
  - JWT-based access/refresh token flow.
  - Role-based authorization (`customer`, `admin`).
- Catalog
  - Product listing, detail page, category listing.
  - Search, filter, sort, pagination.
- Cart
  - Add/update/remove cart items.
  - Persisted cart per customer.
- Addresses
  - CRUD for customer addresses.
  - Default shipping/billing address selection.
- Coupons
  - Admin can create/activate/deactivate coupons.
  - Customer can apply/remove valid coupon during checkout.
- Checkout + Mock Payment
  - Checkout creates order draft.
  - Payment state machine simulation: `pending`, `authorized`, `failed`, `refunded`.
  - Order status lifecycle with admin updates.
- Admin
  - Products CRUD, categories CRUD.
  - Inventory adjustments.
  - Order management.
- Documentation
  - OpenAPI/Swagger docs from day 1.

## 5. Non-Functional Requirements
- Security baseline
  - Password hashing, validation/sanitization, rate limiting, CORS policy, secure headers.
- Scalability baseline
  - PostgreSQL via Prisma, Redis for caching/session-like concerns and transient state.
- Reliability baseline
  - Centralized error handling, structured logging, request id correlation.
- Testing baseline
  - Backend unit tests.
  - Backend integration tests (API behavior).
  - At least one end-to-end checkout happy path test.
- DX baseline
  - TypeScript throughout.
  - Lint/format scripts.
  - Decision Context document maintained continuously.

## 6. Out of Scope (Initial MVP)
- Real payment gateway integration.
- Multi-vendor marketplace support.
- Microservices decomposition.
- Native mobile apps.

## 7. Success Criteria
- End-to-end customer purchase flow works with mock payment states.
- Admin can manage catalog and order states without DB manual edits.
- API docs and tests are runnable by a new contributor.
- Project is deployable and demonstrable as a portfolio artifact.
