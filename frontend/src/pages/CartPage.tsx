import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { CartTable } from '@/components/cart/CartTable'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/currency'

export function CartPage() {
  const { accessToken, isAuthenticated, setStatusMessage } = useAuthSession()
  const [productIdToAdd, setProductIdToAdd] = useState('')
  const [quantityToAdd, setQuantityToAdd] = useState(1)
  const [couponCode] = useState('')

  const {
    cartItems,
    cartQuery,
    cartSubtotalCents,
    addCartItemMutation,
    updateCartItemMutation,
    removeCartItemMutation,
    clearCartMutation,
  } = useCart({
    accessToken,
    isAuthenticated,
    couponCode,
    setStatusMessage,
  })

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

  return (
    <article className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Cart Workspace</h2>
      <p className="mt-1 text-sm text-slate-600">
        Quantity controls are optimistic and debounced for rapid input handling.
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
          Add Item
        </Button>
      </form>

      <div className="mt-4">
        <CartTable
          items={cartItems}
          loading={cartQuery.isLoading}
          updating={updateCartItemMutation.isPending}
          removing={removeCartItemMutation.isPending}
          onCommitQuantity={(itemId, quantity) =>
            updateCartItemMutation.mutate({ itemId, quantity })
          }
          onRemoveItem={(itemId) => removeCartItemMutation.mutate(itemId)}
        />
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
          Clear Cart
        </Button>
      </div>
    </article>
  )
}
