import { AppError } from '../../../shared/errors/app-error.js'
import {
  addCartItem,
  clearCart,
  findCartItem,
  findProductForCart,
  getCartByUserId,
  getOrCreateCart,
  removeCartItem,
  updateCartItemQuantityById,
  updateCartItemQuantityByProduct,
} from '../service/cart.service.js'

function assertStockAvailable(stockQuantity: number | undefined, requestedQuantity: number) {
  if (stockQuantity === undefined) {
    throw new AppError('CONFLICT', 'Product inventory is not configured yet', 409)
  }

  if (requestedQuantity > stockQuantity) {
    throw new AppError(
      'CONFLICT',
      `Requested quantity ${requestedQuantity} exceeds stock ${stockQuantity}`,
      409,
    )
  }
}

export async function getCartCoreController(userId: string) {
  return getCartByUserId(userId)
}

export async function addCartItemCoreController(userId: string, productId: string, quantity: number) {
  const product = await findProductForCart(productId)
  if (!product || !product.isActive) {
    throw new AppError('NOT_FOUND', 'Product not available for cart', 404)
  }

  const cart = await getOrCreateCart(userId)
  const existingItem = await findCartItem(cart.id, productId)
  const finalQuantity = (existingItem?.quantity ?? 0) + quantity

  assertStockAvailable(product.inventory?.quantity, finalQuantity)

  if (existingItem) {
    await updateCartItemQuantityByProduct(cart.id, productId, finalQuantity)
  } else {
    await addCartItem(cart.id, productId, quantity)
  }

  return getCartByUserId(userId)
}

export async function updateCartItemCoreController(userId: string, itemId: string, quantity: number) {
  const cart = await getOrCreateCart(userId)

  const cartData = await getCartByUserId(userId)
  const item = cartData.items.find((entry) => entry.id === itemId)

  if (!item) {
    throw new AppError('NOT_FOUND', 'Cart item not found', 404)
  }

  assertStockAvailable(item.product.inventory?.quantity, quantity)

  const updated = await updateCartItemQuantityById(cart.id, itemId, quantity)
  if (updated.count === 0) {
    throw new AppError('NOT_FOUND', 'Cart item not found', 404)
  }

  return getCartByUserId(userId)
}

export async function removeCartItemCoreController(userId: string, itemId: string) {
  const cart = await getOrCreateCart(userId)
  await removeCartItem(cart.id, itemId)
  return getCartByUserId(userId)
}

export async function clearCartCoreController(userId: string) {
  const cart = await getOrCreateCart(userId)
  await clearCart(cart.id)
  return getCartByUserId(userId)
}
