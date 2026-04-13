import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  addCartItem,
  adminCheck,
  clearCart,
  getCart,
  login,
  logout,
  me,
  previewCheckout,
  refreshSession,
  register,
  removeCartItem,
  updateCartItemQuantity,
  type AuthUser,
  type CartItem,
} from '@/lib/auth-api'

type AuthMode = 'login' | 'register'

type QuantityEditorProps = {
  item: CartItem
  disabled: boolean
  onCommit: (itemId: string, quantity: number) => void
}

function QuantityEditor({ item, disabled, onCommit }: QuantityEditorProps) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity)
  const [isPending, startTransition] = useTransition()
  const debounceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setLocalQuantity(item.quantity)
  }, [item.quantity])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const scheduleCommit = (nextQuantity: number) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = window.setTimeout(() => {
      onCommit(item.id, nextQuantity)
    }, 250)
  }

  const setQuantity = (nextQuantity: number) => {
    const clamped = Math.max(1, Math.min(999, nextQuantity))
    startTransition(() => {
      setLocalQuantity(clamped)
    })
    scheduleCommit(clamped)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setQuantity(localQuantity - 1)}
        disabled={disabled || localQuantity <= 1 || isPending}
      >
        -
      </Button>
      <input
        className="w-14 rounded border border-slate-300 px-2 py-1 text-center text-sm"
        type="number"
        min={1}
        max={999}
        value={localQuantity}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10)
          if (!Number.isNaN(parsed)) {
            setQuantity(parsed)
          }
        }}
        disabled={disabled}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => setQuantity(localQuantity + 1)}
        disabled={disabled || isPending}
      >
        +
      </Button>
    </div>
  )
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function App() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('learner@tamales.dev')
  const [password, setPassword] = useState('strongpass123')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState('')
  const [statusMessage, setStatusMessage] = useState('Checking existing session...')
  const [busy, setBusy] = useState(false)

  const [productIdToAdd, setProductIdToAdd] = useState('')
  const [quantityToAdd, setQuantityToAdd] = useState(1)
  const [couponCode, setCouponCode] = useState('')

  const queryClient = useQueryClient()
  const isAuthenticated = useMemo(() => !!user && !!accessToken, [user, accessToken])
  const currentUser = user
  const cartQueryKey = ['cart', accessToken]

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const refreshed = await refreshSession()
        setUser(refreshed.data.user)
        setAccessToken(refreshed.data.accessToken)
        setStatusMessage('Session restored from refresh token cookie.')
      } catch {
        setStatusMessage('No active session. Please login or register.')
      }
    }

    void bootstrap()
  }, [])

  const cartQuery = useQuery({
    queryKey: cartQueryKey,
    queryFn: () => getCart(accessToken),
    enabled: isAuthenticated,
  })

  const addCartItemMutation = useMutation({
    mutationFn: (payload: { productId: string; quantity: number }) =>
      addCartItem(accessToken, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(cartQueryKey, data)
      setStatusMessage('Item added to cart.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to add item to cart')
    },
  })

  const updateCartItemMutation = useMutation({
    mutationFn: (payload: { itemId: string; quantity: number }) =>
      updateCartItemQuantity(accessToken, payload.itemId, payload.quantity),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey })
      const previous = queryClient.getQueryData<{ data: { items: CartItem[] } }>(cartQueryKey)

      queryClient.setQueryData<{ data: { items: CartItem[] } } | undefined>(
        cartQueryKey,
        (current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            data: {
              ...current.data,
              items: current.data.items.map((item) =>
                item.id === payload.itemId ? { ...item, quantity: payload.quantity } : item,
              ),
            },
          }
        },
      )

      return { previous }
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(cartQueryKey, context.previous)
      }
      setStatusMessage(error instanceof Error ? error.message : 'Failed to update cart item')
    },
    onSuccess: (data) => {
      queryClient.setQueryData(cartQueryKey, data)
    },
  })

  const removeCartItemMutation = useMutation({
    mutationFn: (itemId: string) => removeCartItem(accessToken, itemId),
    onSuccess: (data) => {
      queryClient.setQueryData(cartQueryKey, data)
      setStatusMessage('Item removed from cart.')
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: () => clearCart(accessToken),
    onSuccess: (data) => {
      queryClient.setQueryData(cartQueryKey, data)
      setStatusMessage('Cart cleared.')
    },
  })

  const previewCheckoutMutation = useMutation({
    mutationFn: () => previewCheckout(accessToken, couponCode.trim() || undefined),
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Checkout preview failed')
    },
  })

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)

    try {
      const response =
        mode === 'login' ? await login(email, password) : await register(email, password)

      setUser(response.data.user)
      setAccessToken(response.data.accessToken)
      setStatusMessage(
        mode === 'login'
          ? 'Login successful. Access token stored in memory.'
          : 'Registration successful. You are now signed in.',
      )
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Authentication request failed')
    } finally {
      setBusy(false)
    }
  }

  const handleMe = async () => {
    setBusy(true)
    try {
      const response = await me(accessToken)
      setStatusMessage(`Authenticated as ${response.data.email} (${response.data.role}).`)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to load /auth/me')
    } finally {
      setBusy(false)
    }
  }

  const handleRefresh = async () => {
    setBusy(true)
    try {
      const response = await refreshSession()
      setUser(response.data.user)
      setAccessToken(response.data.accessToken)
      setStatusMessage('Session refreshed. Access token rotated.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Session refresh failed')
    } finally {
      setBusy(false)
    }
  }

  const handleAdminCheck = async () => {
    setBusy(true)
    try {
      const response = await adminCheck(accessToken)
      setStatusMessage(response.data.message)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Admin check failed')
    } finally {
      setBusy(false)
    }
  }

  const handleLogout = async () => {
    setBusy(true)
    try {
      await logout()
      setUser(null)
      setAccessToken('')
      queryClient.removeQueries({ queryKey: ['cart'] })
      setStatusMessage('Logged out. Refresh token revoked on backend.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Logout failed')
    } finally {
      setBusy(false)
    }
  }

  const handleAddToCart = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!productIdToAdd.trim()) {
      setStatusMessage('Product ID is required to add an item.')
      return
    }

    addCartItemMutation.mutate({
      productId: productIdToAdd.trim(),
      quantity: quantityToAdd,
    })
  }

  const handleDebouncedQuantityCommit = (itemId: string, quantity: number) => {
    updateCartItemMutation.mutate({ itemId, quantity })
  }

  const cartItems = cartQuery.data?.data.items ?? []
  const cartSubtotalCents = cartItems.reduce(
    (total, item) => total + item.quantity * item.product.priceCents,
    0,
  )

  const columnHelper = createColumnHelper<CartItem>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((item) => item.product.title, {
        id: 'title',
        header: 'Product',
      }),
      columnHelper.display({
        id: 'quantity',
        header: 'Quantity',
        cell: (info) => (
          <QuantityEditor
            item={info.row.original}
            onCommit={handleDebouncedQuantityCommit}
            disabled={updateCartItemMutation.isPending}
          />
        ),
      }),
      columnHelper.display({
        id: 'price',
        header: 'Unit Price',
        cell: (info) => formatCurrency(info.row.original.product.priceCents),
      }),
      columnHelper.display({
        id: 'lineTotal',
        header: 'Line Total',
        cell: (info) =>
          formatCurrency(info.row.original.product.priceCents * info.row.original.quantity),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeCartItemMutation.mutate(info.row.original.id)}
            disabled={removeCartItemMutation.isPending}
          >
            Remove
          </Button>
        ),
      }),
    ],
    [columnHelper, removeCartItemMutation, updateCartItemMutation.isPending],
  )

  const table = useReactTable({
    data: cartItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <section className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2">
        <article className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700">
            Tamales Commerce
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Auth + Cart + Checkout Preview Console
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Includes React Query mutations, optimistic cart updates, TanStack Table, and
            debounced quantity sync for rapid clicks.
          </p>
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-medium">Current Status</p>
            <p className="mt-2">{statusMessage}</p>
          </div>
        </article>

        <article className="rounded-xl border bg-white p-6 shadow-sm">
          {!isAuthenticated ? (
            <>
              <div className="mb-4 flex gap-2">
                <Button
                  variant={mode === 'login' ? 'default' : 'outline'}
                  onClick={() => setMode('login')}
                  disabled={busy}
                >
                  Login
                </Button>
                <Button
                  variant={mode === 'register' ? 'default' : 'outline'}
                  onClick={() => setMode('register')}
                  disabled={busy}
                >
                  Register
                </Button>
              </div>

              <form className="space-y-4" onSubmit={handleAuthSubmit}>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring-2"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 transition focus:ring-2"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                  />
                </label>

                <Button type="submit" disabled={busy}>
                  {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
                </Button>
              </form>
            </>
          ) : currentUser ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Signed in as <strong>{currentUser.email}</strong> ({currentUser.role})
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button onClick={handleMe} disabled={busy}>
                  Call /auth/me
                </Button>
                <Button onClick={handleRefresh} disabled={busy} variant="outline">
                  Refresh session
                </Button>
                <Button onClick={handleLogout} disabled={busy} variant="destructive">
                  Logout
                </Button>
                <Button
                  onClick={handleAdminCheck}
                  disabled={busy || currentUser.role !== 'ADMIN'}
                  variant="secondary"
                >
                  Admin check
                </Button>
              </div>
            </div>
          ) : null}
        </article>
      </section>

      {isAuthenticated ? (
        <section className="mx-auto mt-6 grid w-full max-w-6xl gap-6 lg:grid-cols-2">
          <article className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Cart Workspace</h2>
            <p className="mt-1 text-sm text-slate-600">
              Quantity buttons are optimistic and debounced to handle rapid inputs.
            </p>

            <form className="mt-4 grid gap-3 sm:grid-cols-4" onSubmit={handleAddToCart}>
              <input
                className="rounded border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                placeholder="Product ID"
                value={productIdToAdd}
                onChange={(event) => setProductIdToAdd(event.target.value)}
              />
              <input
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                type="number"
                min={1}
                value={quantityToAdd}
                onChange={(event) => setQuantityToAdd(Math.max(1, Number(event.target.value) || 1))}
              />
              <Button type="submit" disabled={addCartItemMutation.isPending}>
                Add item
              </Button>
            </form>

            <div className="mt-4 overflow-x-auto rounded border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="border-b px-3 py-2 text-left font-medium">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {cartQuery.isLoading ? (
                    <tr>
                      <td className="px-3 py-4 text-slate-500" colSpan={5}>
                        Loading cart...
                      </td>
                    </tr>
                  ) : table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-slate-500" colSpan={5}>
                        Cart is empty.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b last:border-b-0">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-3 py-2 align-top">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-700">
                Subtotal: <strong>{formatCurrency(cartSubtotalCents)}</strong>
              </p>
              <Button
                variant="outline"
                onClick={() => clearCartMutation.mutate()}
                disabled={clearCartMutation.isPending || cartItems.length === 0}
              >
                Clear cart
              </Button>
            </div>
          </article>

          <article className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Checkout Preview</h2>
            <p className="mt-1 text-sm text-slate-600">
              Preview pricing before order placement to validate discounts, shipping, and tax.
            </p>

            <div className="mt-4 flex gap-2">
              <input
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="Coupon code (optional)"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
              />
              <Button
                onClick={() => previewCheckoutMutation.mutate()}
                disabled={previewCheckoutMutation.isPending || cartItems.length === 0}
              >
                Preview
              </Button>
            </div>

            {previewCheckoutMutation.data ? (
              <div className="mt-4 space-y-2 rounded border border-slate-200 bg-slate-50 p-4 text-sm">
                <p>
                  Subtotal: {formatCurrency(previewCheckoutMutation.data.data.pricing.subtotalCents)}
                </p>
                <p>
                  Discount: -{formatCurrency(previewCheckoutMutation.data.data.pricing.discountCents)}
                </p>
                <p>
                  Shipping: {formatCurrency(previewCheckoutMutation.data.data.pricing.shippingCents)}
                </p>
                <p>Tax: {formatCurrency(previewCheckoutMutation.data.data.pricing.taxCents)}</p>
                <p className="font-semibold">
                  Total: {formatCurrency(previewCheckoutMutation.data.data.pricing.totalCents)}
                </p>
                <p className="text-xs text-slate-500">
                  Applied coupon: {previewCheckoutMutation.data.data.appliedCouponCode ?? 'None'}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No preview generated yet.</p>
            )}
          </article>
        </section>
      ) : null}
    </main>
  )
}

export default App
