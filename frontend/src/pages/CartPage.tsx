import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { CartTable } from '@/components/cart/CartTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useCart } from '@/hooks/useCart'
import { parseApiValidationDetails } from '@/lib/api-error'
import { formatCurrency } from '@/lib/currency'
import { addCartItemSchema, type AddCartItemFormValues } from '@/lib/validation/cart'

export function CartPage() {
  const { accessToken, isAuthenticated, setStatusMessage, clearSession } = useAuthSession()
  const [couponCode] = useState('')
  const {
    register,
    handleSubmit,
    resetField,
    setError,
    formState: { errors, touchedFields, submitCount },
  } = useForm<AddCartItemFormValues>({
    resolver: zodResolver(addCartItemSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      productId: '',
      quantity: 1,
    },
  })

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
    clearSession,
  })

  const handleAddToCart = async (values: AddCartItemFormValues) => {
    try {
      await addCartItemMutation.mutateAsync({
        productId: values.productId.trim(),
        quantity: values.quantity,
      })
      resetField('productId')
    } catch (error) {
      const { fieldErrors, formErrors } = parseApiValidationDetails(error)

      if (fieldErrors.productId?.[0]) {
        setError('productId', { type: 'server', message: fieldErrors.productId[0] })
      }
      if (fieldErrors.quantity?.[0]) {
        setError('quantity', { type: 'server', message: fieldErrors.quantity[0] })
      }
      if (formErrors[0]) {
        setError('root', { type: 'server', message: formErrors[0] })
      }
    }
  }
  const showProductIdError = !!errors.productId && (touchedFields.productId || submitCount > 0)
  const showQuantityError = !!errors.quantity && (touchedFields.quantity || submitCount > 0)
  const showRootError = !!errors.root && submitCount > 0

  return (
    <Card className="border-slate-200/80 bg-white/95">
      <CardHeader>
        <CardTitle>Cart Workspace</CardTitle>
        <CardDescription>
          Quantity updates are optimistic and debounced for rapid input handling.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 rounded-lg border border-slate-200/80 bg-slate-50/80 p-4 sm:grid-cols-4"
          onSubmit={(event) => void handleSubmit(handleAddToCart)(event)}
        >
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="product-id">Product ID</Label>
            <Input id="product-id" placeholder="prod_xxx" {...register('productId')} />
            {showProductIdError ? (
              <p className="text-xs text-destructive">{errors.productId?.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={999}
              {...register('quantity', {
                setValueAs: (value) => Number.parseInt(value, 10) || 1,
              })}
            />
            {showQuantityError ? (
              <p className="text-xs text-destructive">{errors.quantity?.message}</p>
            ) : null}
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={addCartItemMutation.isPending} className="w-full">
              Add Item
            </Button>
          </div>
          {showRootError ? (
            <p className="text-xs text-destructive sm:col-span-4">{errors.root?.message}</p>
          ) : null}
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

        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/80 px-4 py-3">
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
      </CardContent>
    </Card>
  )
}
