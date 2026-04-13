export type AuthUser = {
  id: string
  email: string
  role: 'CUSTOMER' | 'ADMIN'
}

export type CartItem = {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    title: string
    slug: string
    priceCents: number
    isActive: boolean
    inventory: {
      quantity: number
    } | null
  }
}

export type Cart = {
  id: string
  userId: string
  items: CartItem[]
}

export type ProductListSort =
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'price_asc'
  | 'price_desc'
  | 'title_asc'

export type ProductListItem = {
  id: string
  title: string
  slug: string
  priceCents: number
  categoryId: string
  createdAt: string
}

export type ProductListResponse = {
  data: ProductListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type OrderStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'FAILED' | 'REFUNDED'

export type OrderListSort =
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'total_desc'
  | 'total_asc'
  | 'status_asc'

export type OrderListItem = {
  id: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  totalCents: number
  createdAt: string
}

export type OrderListResponse = {
  data: OrderListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type UpdateAdminOrderStatusResponse = {
  data: {
    orderId: string
    fromStatus: OrderStatus
    toStatus: OrderStatus
    changedByUserId: string | null
    note: string | null
    createdAt: string
  }
}

type AuthEnvelope = {
  data: {
    user: AuthUser
    accessToken: string
  }
}

type CartEnvelope = {
  data: Cart
}

type ApiErrorEnvelope = {
  error?: {
    status?: number
    code?: string
    message?: string
    details?: unknown
    path?: string
    requestId?: string
    timestamp?: string
  }
}

export class ApiClientError extends Error {
  public readonly status: number
  public readonly code: string
  public readonly details: unknown
  public readonly requestId: string | null

  constructor(
    message: string,
    status: number,
    code: string,
    details: unknown = [],
    requestId: string | null = null,
  ) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.details = details
    this.requestId = requestId
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    let code = 'REQUEST_FAILED'
    let details: unknown = []
    let requestId: string | null = null

    try {
      const body = (await response.json()) as ApiErrorEnvelope
      if (body.error?.message) {
        message = body.error.message
      }
      if (body.error?.code) {
        code = body.error.code
      }
      if (body.error?.details !== undefined) {
        details = body.error.details
      }
      if (body.error?.requestId) {
        requestId = body.error.requestId
      }
    } catch {
      // Keep default message when error body is missing.
    }

    throw new ApiClientError(message, response.status, code, details, requestId)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function register(email: string, password: string) {
  return request<AuthEnvelope>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function login(email: string, password: string) {
  return request<AuthEnvelope>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function refreshSession() {
  return request<AuthEnvelope>('/auth/refresh', {
    method: 'POST',
  })
}

export async function logout() {
  return request<void>('/auth/logout', {
    method: 'POST',
  })
}

export async function me(accessToken: string) {
  return request<{ data: AuthUser }>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function adminCheck(accessToken: string) {
  return request<{ data: { ok: boolean; message: string } }>('/auth/admin-check', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function getCart(accessToken: string) {
  return request<CartEnvelope>('/cart', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function addCartItem(accessToken: string, payload: { productId: string; quantity: number }) {
  return request<CartEnvelope>('/cart/items', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
}

export async function updateCartItemQuantity(
  accessToken: string,
  itemId: string,
  quantity: number,
) {
  return request<CartEnvelope>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ quantity }),
  })
}

export async function removeCartItem(accessToken: string, itemId: string) {
  return request<CartEnvelope>(`/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function clearCart(accessToken: string) {
  return request<CartEnvelope>('/cart', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function previewCheckout(accessToken: string, couponCode?: string) {
  return request<{
    data: {
      cartId: string
      items: Array<{
        itemId: string
        productId: string
        title: string
        quantity: number
        unitPriceCents: number
        lineTotalCents: number
      }>
      pricing: {
        subtotalCents: number
        discountCents: number
        shippingCents: number
        taxCents: number
        totalCents: number
      }
      appliedCouponCode: string | null
    }
  }>('/checkout/preview', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(couponCode ? { couponCode } : {}),
  })
}

export async function listProducts(params: {
  q?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
  sort?: ProductListSort
}) {
  const query = new URLSearchParams()

  if (params.q?.trim()) {
    query.set('q', params.q.trim())
  }
  if (params.minPrice !== undefined) {
    query.set('minPrice', String(params.minPrice))
  }
  if (params.maxPrice !== undefined) {
    query.set('maxPrice', String(params.maxPrice))
  }
  if (params.page !== undefined) {
    query.set('page', String(params.page))
  }
  if (params.limit !== undefined) {
    query.set('limit', String(params.limit))
  }
  if (params.sort) {
    query.set('sort', params.sort)
  }

  const querySuffix = query.toString()
  return request<ProductListResponse>(`/products${querySuffix ? `?${querySuffix}` : ''}`, {
    method: 'GET',
  })
}

export async function listMyOrders(
  accessToken: string,
  params: {
    status?: OrderStatus
    paymentStatus?: PaymentStatus
    page?: number
    limit?: number
    sort?: OrderListSort
  },
) {
  const query = new URLSearchParams()
  if (params.status) {
    query.set('status', params.status)
  }
  if (params.paymentStatus) {
    query.set('paymentStatus', params.paymentStatus)
  }
  if (params.page !== undefined) {
    query.set('page', String(params.page))
  }
  if (params.limit !== undefined) {
    query.set('limit', String(params.limit))
  }
  if (params.sort) {
    query.set('sort', params.sort)
  }

  const querySuffix = query.toString()
  return request<OrderListResponse>(`/orders${querySuffix ? `?${querySuffix}` : ''}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function listAdminOrders(
  accessToken: string,
  params: {
    userId?: string
    status?: OrderStatus
    paymentStatus?: PaymentStatus
    page?: number
    limit?: number
    sort?: OrderListSort
  },
) {
  const query = new URLSearchParams()
  if (params.userId?.trim()) {
    query.set('userId', params.userId.trim())
  }
  if (params.status) {
    query.set('status', params.status)
  }
  if (params.paymentStatus) {
    query.set('paymentStatus', params.paymentStatus)
  }
  if (params.page !== undefined) {
    query.set('page', String(params.page))
  }
  if (params.limit !== undefined) {
    query.set('limit', String(params.limit))
  }
  if (params.sort) {
    query.set('sort', params.sort)
  }

  const querySuffix = query.toString()
  return request<OrderListResponse>(`/admin/orders${querySuffix ? `?${querySuffix}` : ''}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export async function updateAdminOrderStatus(
  accessToken: string,
  payload: {
    orderId: string
    status: OrderStatus
    note?: string
  },
) {
  return request<UpdateAdminOrderStatusResponse>(`/admin/orders/${payload.orderId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      status: payload.status,
      note: payload.note?.trim() || undefined,
    }),
  })
}
