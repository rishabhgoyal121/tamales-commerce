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
    code?: string
    message?: string
  }
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

    try {
      const body = (await response.json()) as ApiErrorEnvelope
      if (body.error?.message) {
        message = body.error.message
      }
    } catch {
      // Keep default message when error body is missing.
    }

    throw new Error(message)
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
