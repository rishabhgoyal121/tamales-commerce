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
