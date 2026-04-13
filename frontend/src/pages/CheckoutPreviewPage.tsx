import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/currency'
import { couponSchema, type CouponFormValues } from '@/lib/validation/cart'

export function CheckoutPreviewPage() {
  const { accessToken, isAuthenticated, setStatusMessage } = useAuthSession()
  const { register, watch, formState: { errors } } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      couponCode: '',
    },
  })
  const couponCode = watch('couponCode') ?? ''

  const { cartItems, previewCheckoutMutation } = useCart({
    accessToken,
    isAuthenticated,
    couponCode,
    setStatusMessage,
  })

  return (
    <Card className="border-slate-200/80 bg-white/95">
      <CardHeader>
        <CardTitle>Checkout Preview</CardTitle>
        <CardDescription>
          Preview pricing before order placement to validate discount, shipping, and tax.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200/80 bg-slate-50/80 p-4 sm:flex-row">
          <div className="w-full space-y-2">
            <Label htmlFor="coupon-code">Coupon code</Label>
            <Input
              id="coupon-code"
              placeholder="Optional, e.g. SAVE10"
              {...register('couponCode')}
            />
            {errors.couponCode ? (
              <p className="text-xs text-destructive">{errors.couponCode.message}</p>
            ) : null}
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => previewCheckoutMutation.mutate()}
              disabled={previewCheckoutMutation.isPending || cartItems.length === 0 || !!errors.couponCode}
              className="w-full sm:w-auto"
            >
              Preview
            </Button>
          </div>
        </div>

        {previewCheckoutMutation.data ? (
          <div className="mt-4 space-y-2 rounded-lg border border-slate-200/80 bg-slate-50 p-4 text-sm">
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
          <p className="mt-4 text-sm text-muted-foreground">No preview generated yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
