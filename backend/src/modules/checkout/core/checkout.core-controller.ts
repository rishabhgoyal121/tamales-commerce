import { AppError } from '../../../shared/errors/app-error.js'
import type { OrderStatus, PaymentStatus } from '@prisma/client'
import {
  createOrderFromCart,
  findCouponByCode,
  getCartForCheckout,
} from '../service/checkout.service.js'
import type { PlaceOrderInput } from '../schema/checkout.schema.js'

const TAX_RATE = 0.18
const SHIPPING_FLAT_CENTS = 499
const FREE_SHIPPING_THRESHOLD_CENTS = 5000

async function buildCheckoutPreview(userId: string, couponCode?: string) {
  const cart = await getCartForCheckout(userId)

  if (!cart || cart.items.length === 0) {
    throw new AppError('CONFLICT', 'Cart is empty', 409)
  }

  let subtotalCents = 0

  const items = cart.items.map((item) => {
    if (!item.product.isActive) {
      throw new AppError('CONFLICT', `Product ${item.product.id} is inactive`, 409)
    }

    const stock = item.product.inventory?.quantity
    if (stock === undefined || item.quantity > stock) {
      throw new AppError('CONFLICT', `Insufficient stock for ${item.product.title}`, 409)
    }

    const lineTotalCents = item.product.priceCents * item.quantity
    subtotalCents += lineTotalCents

    return {
      itemId: item.id,
      productId: item.product.id,
      title: item.product.title,
      quantity: item.quantity,
      unitPriceCents: item.product.priceCents,
      lineTotalCents,
    }
  })

  let discountCents = 0
  let appliedCouponCode: string | null = null

  if (couponCode) {
    const coupon = await findCouponByCode(couponCode)
    if (!coupon || !coupon.isActive) {
      throw new AppError('CONFLICT', 'Coupon is invalid or inactive', 409)
    }

    const now = new Date()
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new AppError('CONFLICT', 'Coupon is not active yet', 409)
    }

    if (coupon.endsAt && coupon.endsAt < now) {
      throw new AppError('CONFLICT', 'Coupon has expired', 409)
    }

    if (coupon.minSpendCents && subtotalCents < coupon.minSpendCents) {
      throw new AppError('CONFLICT', `Coupon requires minimum spend of ${coupon.minSpendCents}`, 409)
    }

    if (coupon.discountType === 'PERCENTAGE') {
      discountCents = Math.round((subtotalCents * Math.min(coupon.discountValue, 100)) / 100)
    } else if (coupon.discountType === 'FIXED') {
      discountCents = coupon.discountValue
    }

    discountCents = Math.min(discountCents, subtotalCents)
    appliedCouponCode = coupon.code
  }

  const shippingCents = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS
  const taxableBaseCents = Math.max(subtotalCents - discountCents, 0)
  const taxCents = Math.round(taxableBaseCents * TAX_RATE)
  const totalCents = taxableBaseCents + shippingCents + taxCents

  return {
    cart,
    data: {
      cartId: cart.id,
      items,
      pricing: {
        subtotalCents,
        discountCents,
        shippingCents,
        taxCents,
        totalCents,
      },
      appliedCouponCode,
    },
  }
}

export async function previewCheckoutCoreController(userId: string, couponCode?: string) {
  const preview = await buildCheckoutPreview(userId, couponCode)
  return {
    data: preview.data,
  }
}

function mapPaymentOutcomeToOrderState(paymentOutcome: PlaceOrderInput['paymentOutcome']): {
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
} {
  if (paymentOutcome === 'FAILED') {
    return {
      paymentStatus: 'FAILED',
      orderStatus: 'CANCELLED',
    }
  }

  if (paymentOutcome === 'PENDING') {
    return {
      paymentStatus: 'PENDING',
      orderStatus: 'CREATED',
    }
  }

  return {
    paymentStatus: 'AUTHORIZED',
    orderStatus: 'CONFIRMED',
  }
}

export async function placeOrderCoreController(userId: string, input: PlaceOrderInput) {
  const preview = await buildCheckoutPreview(userId, input.couponCode)
  const { paymentStatus, orderStatus } = mapPaymentOutcomeToOrderState(input.paymentOutcome)

  const result = await createOrderFromCart({
    userId,
    cartId: preview.cart.id,
    items: preview.data.items,
    pricing: preview.data.pricing,
    address: input.address,
    appliedCouponCode: preview.data.appliedCouponCode,
    paymentStatus,
    orderStatus,
  })

  return {
    data: {
      orderId: result.orderId,
      status: result.status,
      paymentStatus: result.paymentStatus,
      totalCents: result.totalCents,
      itemCount: preview.data.items.length,
    },
  }
}
