import { prisma } from '../../../shared/prisma/client.js'

export async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })
}

export async function getCartByUserId(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
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

  if (cart) {
    return cart
  }

  const created = await getOrCreateCart(userId)
  return prisma.cart.findUniqueOrThrow({
    where: { id: created.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
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

export async function findProductForCart(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      isActive: true,
      inventory: {
        select: {
          quantity: true,
        },
      },
    },
  })
}

export async function findCartItem(cartId: string, productId: string) {
  return prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId,
        productId,
      },
    },
  })
}

export async function addCartItem(cartId: string, productId: string, quantity: number) {
  return prisma.cartItem.create({
    data: {
      cartId,
      productId,
      quantity,
    },
  })
}

export async function updateCartItemQuantityById(cartId: string, itemId: string, quantity: number) {
  return prisma.cartItem.updateMany({
    where: {
      id: itemId,
      cartId,
    },
    data: {
      quantity,
    },
  })
}

export async function updateCartItemQuantityByProduct(
  cartId: string,
  productId: string,
  quantity: number,
) {
  return prisma.cartItem.update({
    where: {
      cartId_productId: {
        cartId,
        productId,
      },
    },
    data: {
      quantity,
    },
  })
}

export async function removeCartItem(cartId: string, itemId: string) {
  return prisma.cartItem.deleteMany({
    where: {
      cartId,
      id: itemId,
    },
  })
}

export async function clearCart(cartId: string) {
  return prisma.cartItem.deleteMany({
    where: { cartId },
  })
}
