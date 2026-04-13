import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/currency'

export function CheckoutPreviewPage() {
  const { accessToken, isAuthenticated, setStatusMessage } = useAuthSession()
  const [couponCode, setCouponCode] = useState('')

  const { cartItems, previewCheckoutMutation } = useCart({
    accessToken,
    isAuthenticated,
    couponCode,
    setStatusMessage,
  })

  return (
    <article className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Checkout Preview</h2>
      <p className="mt-1 text-sm text-slate-600">
        Preview pricing before order placement to validate discount, shipping, and tax.
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
  )
}
