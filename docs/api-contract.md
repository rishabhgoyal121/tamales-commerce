# Tamales Commerce API Contract (Draft v0)

## 1. Conventions
- Base path: `/api/v1`
- Auth header: `Authorization: Bearer <access-token>`
- JSON only.
- Error envelope:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  },
  "requestId": "req_123"
}
```

## 2. Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## 3. Catalog
- `GET /categories`
- `POST /categories` (admin)
- `PATCH /categories/:id` (admin)
- `DELETE /categories/:id` (admin)

- `GET /products`
  - Query: `q`, `categoryId`, `sort`, `page`, `limit`, `minPrice`, `maxPrice`
- `GET /products/:idOrSlug`
- `POST /products` (admin)
- `PATCH /products/:id` (admin)
- `DELETE /products/:id` (admin)

## 4. Inventory
- `GET /inventory/:productId` (admin)
- `PATCH /inventory/:productId` (admin)
  - Supports restock and absolute set with audit note.

## 5. Cart
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:itemId`
- `DELETE /cart/items/:itemId`
- `DELETE /cart`

## 6. Addresses
- `GET /addresses`
- `POST /addresses`
- `PATCH /addresses/:id`
- `DELETE /addresses/:id`
- `POST /addresses/:id/default`

## 7. Coupons
- Customer
  - `POST /coupons/validate`
- Admin
  - `GET /admin/coupons`
  - `POST /admin/coupons`
  - `PATCH /admin/coupons/:id`
  - `POST /admin/coupons/:id/activate`
  - `POST /admin/coupons/:id/deactivate`

## 8. Checkout + Payment Simulation
- `POST /checkout/preview`
  - Computes totals, discounts, shipping estimate, tax estimate.
- `POST /checkout/place-order`
  - Creates order and simulated payment record.

- `POST /payments/:paymentId/simulate`
  - Allowed transitions:
    - `pending -> authorized`
    - `pending -> failed`
    - `authorized -> refunded`

## 9. Orders
- Customer
  - `GET /orders`
  - `GET /orders/:id`
- Admin
  - `GET /admin/orders`
  - `PATCH /admin/orders/:id/status`

### Order status (draft)
- `created`, `confirmed`, `packed`, `shipped`, `delivered`, `cancelled`

## 10. Health & Ops
- `GET /health`
- `GET /ready`

## 11. OpenAPI Plan
- Source of truth: YAML in `backend/openapi/openapi.yaml`.
- Swagger UI served at `/docs`.
- Contract tests will validate response codes and envelopes for critical endpoints.
