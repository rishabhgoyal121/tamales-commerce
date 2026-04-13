import { prisma } from '../../../shared/prisma/client.js'

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
