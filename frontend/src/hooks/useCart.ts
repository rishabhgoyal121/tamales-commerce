import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addCartItem,
  clearCart,
  getCart,
  isApiClientError,
  placeOrder,
  previewCheckout,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from '@/lib/auth-api'
import { toStatusMessage } from '@/lib/api-error'
import { notifyError, notifyInfo, notifySuccess } from '@/lib/notify'

type UseCartParams = {
  accessToken: string
  isAuthenticated: boolean
  couponCode: string
  setStatusMessage: (value: string) => void
  clearSession: (reason?: string) => void
}

export function useCart({
  accessToken,
  isAuthenticated,
  couponCode,
  setStatusMessage,
  clearSession,
}: UseCartParams) {
  const queryClient = useQueryClient()
  const cartQueryKey = ['cart', accessToken]
  const handleMutationError = (error: unknown, fallback: string) => {
    if (isApiClientError(error)) {
      if (error.status === 401) {
        clearSession('Session expired during cart operation. Please login again.')
      } else if (error.status === 403) {
        const message = 'Forbidden: this action is not allowed for your role.'
        setStatusMessage(message)
        notifyError(message)
      } else {
        const message = toStatusMessage(error, fallback)
        setStatusMessage(message)
        notifyError(message)
      }
      return
    }

    const message = toStatusMessage(error, fallback)
    setStatusMessage(message)
    notifyError(message)
  }

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
      notifySuccess('Item added to cart.')
    },
    onError: (error) => {
      handleMutationError(error, 'Failed to add item to cart')
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
      handleMutationError(error, 'Failed to update cart item')
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
      notifyInfo('Item removed from cart.')
    },
    onError: (error) => {
      handleMutationError(error, 'Failed to remove cart item')
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: () => clearCart(accessToken),
    onSuccess: (data) => {
      queryClient.setQueryData(cartQueryKey, data)
      setStatusMessage('Cart cleared.')
      notifyInfo('Cart cleared.')
    },
    onError: (error) => {
      handleMutationError(error, 'Failed to clear cart')
    },
  })

  const previewCheckoutMutation = useMutation({
    mutationKey: ['checkout-preview', accessToken],
    mutationFn: () => previewCheckout(accessToken, couponCode.trim() || undefined),
    onError: (error) => {
      handleMutationError(error, 'Checkout preview failed')
    },
  })

  const placeOrderMutation = useMutation({
    mutationFn: (payload: {
      couponCode?: string
      paymentOutcome?: 'PENDING' | 'AUTHORIZED' | 'FAILED'
      address: {
        fullName: string
        line1: string
        line2?: string
        city: string
        state: string
        postalCode: string
        country: string
      }
    }) => placeOrder(accessToken, payload),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['cart', accessToken] })
      setStatusMessage('Order placed successfully.')
      notifySuccess('Order placed successfully.')
    },
    onError: (error) => {
      handleMutationError(error, 'Order placement failed')
    },
  })

  const cartItems = cartQuery.data?.data.items ?? []
  const cartSubtotalCents = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity * item.product.priceCents, 0),
    [cartItems],
  )

  return {
    cartQuery,
    cartItems,
    cartSubtotalCents,
    addCartItemMutation,
    updateCartItemMutation,
    removeCartItemMutation,
    clearCartMutation,
    previewCheckoutMutation,
    placeOrderMutation,
  }
}
