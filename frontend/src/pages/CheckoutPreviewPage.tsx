import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Seo } from '@/components/seo/Seo'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useCart } from '@/hooks/useCart'
import { parseApiValidationDetails } from '@/lib/api-error'
import { formatCurrency } from '@/lib/currency'
import { couponSchema, type CouponFormValues } from '@/lib/validation/cart'
import { z } from 'zod'

const placeOrderSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  line1: z.string().trim().min(3, 'Address line is required'),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z.string().trim().min(3, 'Postal code is required'),
  country: z.string().trim().min(2, 'Country is required'),
})

type PlaceOrderFormValues = z.infer<typeof placeOrderSchema>

export function CheckoutPreviewPage() {
  const navigate = useNavigate()
  const { accessToken, isAuthenticated, setStatusMessage, clearSession } = useAuthSession()

  const couponForm = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { couponCode: '' },
  })
  const couponCode = couponForm.watch('couponCode') ?? ''

  const orderForm = useForm<PlaceOrderFormValues>({
    resolver: zodResolver(placeOrderSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      fullName: 'Demo User',
      line1: '221B Baker Street',
      line2: '',
      city: 'London',
      state: 'Greater London',
      postalCode: 'NW1',
      country: 'UK',
    },
  })

  const { cartItems, previewCheckoutMutation, placeOrderMutation } = useCart({
    accessToken,
    isAuthenticated,
    couponCode,
    setStatusMessage,
    clearSession,
  })

  const handlePreview = async () => {
    try {
      await previewCheckoutMutation.mutateAsync()
    } catch (error) {
      const { fieldErrors, formErrors } = parseApiValidationDetails(error)
      if (fieldErrors.couponCode?.[0]) {
        couponForm.setError('couponCode', { type: 'server', message: fieldErrors.couponCode[0] })
      }
      if (formErrors[0]) {
        couponForm.setError('root', { type: 'server', message: formErrors[0] })
      }
    }
  }

  const handlePlaceOrder = async (values: PlaceOrderFormValues) => {
    if (!previewCheckoutMutation.data) {
      setStatusMessage('Preview checkout before placing order.')
      return
    }

    try {
      const response = await placeOrderMutation.mutateAsync({
        couponCode: couponCode.trim() || undefined,
        paymentOutcome: 'AUTHORIZED',
        address: values,
      })

      setStatusMessage(`Order ${response.data.orderId} placed successfully.`)
      navigate(`/orders/${response.data.orderId}`)
    } catch (error) {
      const { fieldErrors, formErrors } = parseApiValidationDetails(error)
      const mapping: Record<string, keyof PlaceOrderFormValues> = {
        fullName: 'fullName',
        line1: 'line1',
        line2: 'line2',
        city: 'city',
        state: 'state',
        postalCode: 'postalCode',
        country: 'country',
      }

      Object.entries(mapping).forEach(([apiKey, formKey]) => {
        if (fieldErrors[apiKey]?.[0]) {
          orderForm.setError(formKey, { type: 'server', message: fieldErrors[apiKey][0] })
        }
      })

      if (formErrors[0]) {
        orderForm.setError('root', { type: 'server', message: formErrors[0] })
      }
    }
  }

  const preview = previewCheckoutMutation.data?.data

  return (
    <>
      <Seo
        title="Checkout Preview | Tamales Commerce"
        description="Review pricing, apply coupon, and place your order."
      />
      <Card className="animate-fade-up border-slate-200/80 bg-white/95">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Preview pricing, enter shipping details, and place your order.</CardDescription>
        </CardHeader>
        <CardContent>
          <section className="mb-4 grid gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 p-3 text-xs sm:grid-cols-3">
            <div className={`rounded-md px-3 py-2 ${preview ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-600'}`}>
              1. Preview totals
            </div>
            <div className={`rounded-md px-3 py-2 ${preview ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-600'}`}>
              2. Add shipping details
            </div>
            <div className={`rounded-md px-3 py-2 ${preview ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-600'}`}>
              3. Place order
            </div>
          </section>

          {cartItems.length === 0 ? (
            <section className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">Your cart is empty.</p>
              <p className="mt-1 text-sm text-amber-800">Add at least one item to preview and place an order.</p>
              <Link
                to="/products"
                className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-500"
              >
                Browse Products
              </Link>
            </section>
          ) : null}

          <form
            className="flex flex-col gap-3 rounded-lg border border-slate-200/80 bg-slate-50/80 p-4 sm:flex-row"
            onSubmit={(event) => void couponForm.handleSubmit(handlePreview)(event)}
          >
            <div className="w-full space-y-2">
              <Label htmlFor="coupon-code">Coupon code</Label>
              <Input id="coupon-code" placeholder="Optional, e.g. SAVE10" {...couponForm.register('couponCode')} />
              {couponForm.formState.errors.couponCode ? (
                <p className="text-xs text-destructive">{couponForm.formState.errors.couponCode.message}</p>
              ) : null}
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={previewCheckoutMutation.isPending || cartItems.length === 0 || !!couponForm.formState.errors.couponCode}
                className="w-full sm:w-auto"
              >
                {previewCheckoutMutation.isPending ? 'Previewing...' : 'Preview Order Summary'}
              </Button>
            </div>
          </form>

          {preview ? (
            <>
              <div className="mt-4 animate-fade-up space-y-2 rounded-lg border border-slate-200/80 bg-slate-50 p-4 text-sm">
                <p>Subtotal: {formatCurrency(preview.pricing.subtotalCents)}</p>
                <p>Discount: -{formatCurrency(preview.pricing.discountCents)}</p>
                <p>Shipping: {formatCurrency(preview.pricing.shippingCents)}</p>
                <p>Tax: {formatCurrency(preview.pricing.taxCents)}</p>
                <p className="font-semibold">Total: {formatCurrency(preview.pricing.totalCents)}</p>
                <p className="text-xs text-slate-500">Applied coupon: {preview.appliedCouponCode ?? 'None'}</p>
              </div>

              <form
                className="mt-4 animate-fade-up grid gap-3 rounded-lg border border-slate-200/80 bg-white p-4 md:grid-cols-2"
                onSubmit={(event) => void orderForm.handleSubmit(handlePlaceOrder)(event)}
              >
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" {...orderForm.register('fullName')} />
                  {orderForm.formState.errors.fullName ? <p className="text-xs text-destructive">{orderForm.formState.errors.fullName.message}</p> : null}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="line1">Address Line 1</Label>
                  <Input id="line1" {...orderForm.register('line1')} />
                  {orderForm.formState.errors.line1 ? <p className="text-xs text-destructive">{orderForm.formState.errors.line1.message}</p> : null}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="line2">Address Line 2 (optional)</Label>
                  <Input id="line2" {...orderForm.register('line2')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...orderForm.register('city')} />
                  {orderForm.formState.errors.city ? <p className="text-xs text-destructive">{orderForm.formState.errors.city.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...orderForm.register('state')} />
                  {orderForm.formState.errors.state ? <p className="text-xs text-destructive">{orderForm.formState.errors.state.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" {...orderForm.register('postalCode')} />
                  {orderForm.formState.errors.postalCode ? <p className="text-xs text-destructive">{orderForm.formState.errors.postalCode.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" {...orderForm.register('country')} />
                  {orderForm.formState.errors.country ? <p className="text-xs text-destructive">{orderForm.formState.errors.country.message}</p> : null}
                </div>
                {orderForm.formState.errors.root?.message ? <p className="text-xs text-destructive md:col-span-2">{orderForm.formState.errors.root.message}</p> : null}
                <div className="md:col-span-2">
                  <Button type="submit" disabled={placeOrderMutation.isPending} className="w-full animate-pulse-soft sm:w-auto">
                    {placeOrderMutation.isPending ? 'Placing order...' : 'Place Order Now'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Preview checkout to continue to order placement.</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
