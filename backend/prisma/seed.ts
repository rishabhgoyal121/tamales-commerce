import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function upsertCategory(name: string, slug: string) {
  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: { name, slug },
  })
}

async function upsertProduct(args: {
  slug: string
  title: string
  description: string
  priceCents: number
  categoryId: string
  inventoryQty: number
}) {
  const product = await prisma.product.upsert({
    where: { slug: args.slug },
    update: {
      title: args.title,
      description: args.description,
      priceCents: args.priceCents,
      categoryId: args.categoryId,
      isActive: true,
    },
    create: {
      title: args.title,
      slug: args.slug,
      description: args.description,
      priceCents: args.priceCents,
      categoryId: args.categoryId,
      isActive: true,
    },
  })

  await prisma.inventory.upsert({
    where: { productId: product.id },
    update: { quantity: args.inventoryQty },
    create: { productId: product.id, quantity: args.inventoryQty },
  })
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@tamales.dev'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'AdminPass123'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  })

  const [electronics, home, fitness] = await Promise.all([
    upsertCategory('Electronics', 'electronics'),
    upsertCategory('Home Essentials', 'home-essentials'),
    upsertCategory('Fitness', 'fitness'),
  ])

  await Promise.all([
    upsertProduct({
      slug: 'wireless-headphones-pro',
      title: 'Wireless Headphones Pro',
      description: 'Noise-cancelling headphones with 40-hour battery backup.',
      priceCents: 8999,
      categoryId: electronics.id,
      inventoryQty: 120,
    }),
    upsertProduct({
      slug: 'mechanical-keyboard-lite',
      title: 'Mechanical Keyboard Lite',
      description: 'Compact 75% mechanical keyboard with hot-swappable switches.',
      priceCents: 5499,
      categoryId: electronics.id,
      inventoryQty: 85,
    }),
    upsertProduct({
      slug: 'smart-desk-lamp',
      title: 'Smart Desk Lamp',
      description: 'Adjustable warm/cool lighting with touch controls.',
      priceCents: 2499,
      categoryId: home.id,
      inventoryQty: 160,
    }),
    upsertProduct({
      slug: 'ceramic-coffee-mug-set',
      title: 'Ceramic Coffee Mug Set',
      description: 'Set of 4 matte-finish mugs for everyday use.',
      priceCents: 1799,
      categoryId: home.id,
      inventoryQty: 200,
    }),
    upsertProduct({
      slug: 'yoga-mat-grip-plus',
      title: 'Yoga Mat Grip Plus',
      description: '6mm anti-slip mat suitable for indoor/outdoor practice.',
      priceCents: 2199,
      categoryId: fitness.id,
      inventoryQty: 140,
    }),
    upsertProduct({
      slug: 'adjustable-dumbbells-20kg',
      title: 'Adjustable Dumbbells 20kg',
      description: 'Space-saving adjustable dumbbells with quick-lock mechanism.',
      priceCents: 11999,
      categoryId: fitness.id,
      inventoryQty: 45,
    }),
  ])

  await prisma.coupon.upsert({
    where: { code: 'SAVE10' },
    update: {
      description: '10% off on eligible orders',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minSpendCents: 3000,
      isActive: true,
    },
    create: {
      code: 'SAVE10',
      description: '10% off on eligible orders',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minSpendCents: 3000,
      isActive: true,
    },
  })

  console.log('Seed complete: admin, categories, products, inventory, coupon')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
