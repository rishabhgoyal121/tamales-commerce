import { Router } from 'express'
import { getHealthApiController } from './modules/health/api/health-api.controller.js'
import {
  createAdminProductApiController,
  getProductDetailApiController,
  getProductDetailBySlugApiController,
  listAdminCategoriesApiController,
  listAdminProductsApiController,
  listProductsApiController,
  updateAdminProductApiController,
  updateAdminProductInventoryApiController,
} from './modules/products/api/products-api.controller.js'
import {
  addCartItemApiController,
  clearCartApiController,
  getCartApiController,
  removeCartItemApiController,
  updateCartItemApiController,
} from './modules/cart/api/cart-api.controller.js'
import {
  getMyOrderDetailApiController,
  listAdminOrderStatusTransitionsApiController,
  listAdminOrdersApiController,
  listMyOrdersApiController,
  updateAdminOrderStatusApiController,
} from './modules/orders/api/orders-api.controller.js'
import {
  placeOrderApiController,
  previewCheckoutApiController,
} from './modules/checkout/api/checkout-api.controller.js'
import {
  adminCheckApiController,
  loginApiController,
  logoutApiController,
  meApiController,
  refreshApiController,
  registerApiController,
} from './modules/auth/api/auth-api.controller.js'
import { authenticate } from './shared/middleware/authenticate.js'
import { requireRole } from './shared/middleware/require-role.js'

export const router = Router()

router.get('/health', getHealthApiController)
router.get('/products', listProductsApiController)
router.get('/products/slug/:slug', getProductDetailBySlugApiController)
router.get('/products/:productId', getProductDetailApiController)
router.post('/auth/register', registerApiController)
router.post('/auth/login', loginApiController)
router.post('/auth/refresh', refreshApiController)
router.post('/auth/logout', logoutApiController)
router.get('/auth/me', authenticate, meApiController)
router.get('/auth/admin-check', authenticate, requireRole('ADMIN'), adminCheckApiController)
router.get('/admin/categories', authenticate, requireRole('ADMIN'), listAdminCategoriesApiController)
router.get('/admin/products', authenticate, requireRole('ADMIN'), listAdminProductsApiController)
router.post('/admin/products', authenticate, requireRole('ADMIN'), createAdminProductApiController)
router.patch('/admin/products/:productId', authenticate, requireRole('ADMIN'), updateAdminProductApiController)
router.patch(
  '/admin/products/:productId/inventory',
  authenticate,
  requireRole('ADMIN'),
  updateAdminProductInventoryApiController,
)
router.get('/orders', authenticate, listMyOrdersApiController)
router.get('/orders/:orderId', authenticate, getMyOrderDetailApiController)
router.get('/admin/orders', authenticate, requireRole('ADMIN'), listAdminOrdersApiController)
router.patch(
  '/admin/orders/:orderId/status',
  authenticate,
  requireRole('ADMIN'),
  updateAdminOrderStatusApiController,
)
router.get(
  '/admin/orders/:orderId/status-transitions',
  authenticate,
  requireRole('ADMIN'),
  listAdminOrderStatusTransitionsApiController,
)
router.get('/cart', authenticate, getCartApiController)
router.post('/cart/items', authenticate, addCartItemApiController)
router.patch('/cart/items/:itemId', authenticate, updateCartItemApiController)
router.delete('/cart/items/:itemId', authenticate, removeCartItemApiController)
router.delete('/cart', authenticate, clearCartApiController)
router.post('/checkout/preview', authenticate, previewCheckoutApiController)
router.post('/checkout/place-order', authenticate, placeOrderApiController)
