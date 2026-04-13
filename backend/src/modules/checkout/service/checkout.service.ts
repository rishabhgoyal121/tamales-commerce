import { prisma } from '../../../shared/prisma/client.js'
import { AppError } from '../../../shared/errors/app-error.js'

export async function getCartForCheckout(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              priceCents: true,
              isActive: true,
              inventory: {
                select: {
                  quantity: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function findCouponByCode(code: string) {
  return prisma.coupon.findUnique({
    where: { code },
  })
}

export async function createOrderFromCart(args: {
  userId: string
  cartId: string
  items: Array<{
    itemId: string
    productId: string
    title: string
    quantity: number
    unitPriceCents: number
    lineTotalCents: number
  }>
  pricing: {
    subtotalCents: number
    discountCents: number
    shippingCents: number
    taxCents: number
    totalCents: number
  }
  address: {
    fullName: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  appliedCouponCode: string | null
  paymentStatus: 'PENDING' | 'AUTHORIZED' | 'FAILED' | 'REFUNDED'
  orderStatus: 'CREATED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
}) {
  return prisma.$transaction(async (tx) => {
    for (const item of args.items) {
      const updated = await tx.inventory.updateMany({
        where: {
          productId: item.productId,
          quantity: { gte: item.quantity },
        },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      })

      if (updated.count !== 1) {
        throw new AppError(
          'CONFLICT',
          `Insufficient stock while placing order for product ${item.productId}`,
          409,
        )
      }
    }

    const address = await tx.address.create({
      data: {
        userId: args.userId,
        fullName: args.address.fullName,
        line1: args.address.line1,
        line2: args.address.line2?.trim() || null,
        city: args.address.city,
        state: args.address.state,
        postalCode: args.address.postalCode,
        country: args.address.country,
      },
    })

    let couponId: string | undefined
    if (args.appliedCouponCode) {
      const coupon = await tx.coupon.findUnique({
        where: { code: args.appliedCouponCode },
        select: { id: true },
      })

      if (!coupon) {
        throw new AppError('CONFLICT', 'Applied coupon no longer exists', 409)
      }

      couponId = coupon.id
    }

    const order = await tx.order.create({
      data: {
        userId: args.userId,
        addressId: address.id,
        couponId,
        status: args.orderStatus,
        subtotalCents: args.pricing.subtotalCents,
        discountCents: args.pricing.discountCents,
        shippingCents: args.pricing.shippingCents,
        taxCents: args.pricing.taxCents,
        totalCents: args.pricing.totalCents,
        paymentStatus: args.paymentStatus,
        items: {
          create: args.items.map((item) => ({
            productId: item.productId,
            titleSnapshot: item.title,
            unitPriceCents: item.unitPriceCents,
            quantity: item.quantity,
          })),
        },
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalCents: true,
      },
    })

    if (args.paymentStatus !== 'PENDING') {
      await tx.paymentTransition.create({
        data: {
          orderId: order.id,
          fromStatus: 'PENDING',
          toStatus: args.paymentStatus,
          note: 'Mock payment transition at order placement',
        },
      })
    }

    await tx.cartItem.deleteMany({
      where: { cartId: args.cartId },
    })

    return {
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalCents: order.totalCents,
    }
  })
}
