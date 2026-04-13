import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addCartItem,
  clearCart,
  getCart,
  previewCheckout,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from '@/lib/auth-api'

type UseCartParams = {
  accessToken: string
  isAuthenticated: boolean
  couponCode: string
  setStatusMessage: (value: string) => void
}

export function useCart({ accessToken, isAuthenticated, couponCode, setStatusMessage }: UseCartParams) {
  const queryClient = useQueryClient()
  const cartQueryKey = ['cart', accessToken]

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
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to remove cart item')
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: () => clearCart(accessToken),
    onSuccess: (data) => {
      queryClient.setQueryData(cartQueryKey, data)
      setStatusMessage('Cart cleared.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to clear cart')
    },
  })

  const previewCheckoutMutation = useMutation({
    mutationKey: ['checkout-preview', accessToken],
    mutationFn: () => previewCheckout(accessToken, couponCode.trim() || undefined),
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Checkout preview failed')
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
  }
}
