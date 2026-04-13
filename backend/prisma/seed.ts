import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

type CategorySeed = {
  name: string
  slug: string
}

type ProductSeed = {
  slug: string
  title: string
  description: string
  priceCents: number
  categorySlug: string
  inventoryQty: number
}

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

const categoriesSeed: CategorySeed[] = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Home Essentials', slug: 'home-essentials' },
  { name: 'Fitness', slug: 'fitness' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Beauty', slug: 'beauty' },
  { name: 'Books', slug: 'books' },
  { name: 'Groceries', slug: 'groceries' },
  { name: 'Toys', slug: 'toys' },
]

const productsSeed: ProductSeed[] = [
  {
    slug: 'wireless-headphones-pro',
    title: 'Wireless Headphones Pro',
    description: 'Noise-cancelling headphones with 40-hour battery backup.',
    priceCents: 8999,
    categorySlug: 'electronics',
    inventoryQty: 120,
  },
  {
    slug: 'mechanical-keyboard-lite',
    title: 'Mechanical Keyboard Lite',
    description: 'Compact 75% mechanical keyboard with hot-swappable switches.',
    priceCents: 5499,
    categorySlug: 'electronics',
    inventoryQty: 85,
  },
  {
    slug: 'smart-desk-lamp',
    title: 'Smart Desk Lamp',
    description: 'Adjustable warm/cool lighting with touch controls.',
    priceCents: 2499,
    categorySlug: 'home-essentials',
    inventoryQty: 160,
  },
  {
    slug: 'ceramic-coffee-mug-set',
    title: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 matte-finish mugs for everyday use.',
    priceCents: 1799,
    categorySlug: 'home-essentials',
    inventoryQty: 200,
  },
  {
    slug: 'yoga-mat-grip-plus',
    title: 'Yoga Mat Grip Plus',
    description: '6mm anti-slip mat suitable for indoor/outdoor practice.',
    priceCents: 2199,
    categorySlug: 'fitness',
    inventoryQty: 140,
  },
  {
    slug: 'adjustable-dumbbells-20kg',
    title: 'Adjustable Dumbbells 20kg',
    description: 'Space-saving adjustable dumbbells with quick-lock mechanism.',
    priceCents: 11999,
    categorySlug: 'fitness',
    inventoryQty: 45,
  },
  {
    slug: 'bluetooth-speaker-mini',
    title: 'Bluetooth Speaker Mini',
    description: 'Portable speaker with deep bass and splash resistance.',
    priceCents: 3299,
    categorySlug: 'electronics',
    inventoryQty: 64,
  },
  {
    slug: '4k-webcam-ultra',
    title: '4K Webcam Ultra',
    description: 'Ultra HD webcam with autofocus and dual microphones.',
    priceCents: 7599,
    categorySlug: 'electronics',
    inventoryQty: 18,
  },
  {
    slug: 'usb-c-docking-hub',
    title: 'USB-C Docking Hub',
    description: '8-in-1 hub with HDMI, Ethernet, and card readers.',
    priceCents: 4599,
    categorySlug: 'electronics',
    inventoryQty: 30,
  },
  {
    slug: 'gaming-mouse-rgb',
    title: 'Gaming Mouse RGB',
    description: 'Ergonomic gaming mouse with programmable buttons.',
    priceCents: 2999,
    categorySlug: 'electronics',
    inventoryQty: 0,
  },
  {
    slug: 'wireless-earbuds-air',
    title: 'Wireless Earbuds Air',
    description: 'Compact earbuds with ENC mic and fast charging case.',
    priceCents: 4199,
    categorySlug: 'electronics',
    inventoryQty: 4,
  },
  {
    slug: 'smart-watch-active',
    title: 'Smart Watch Active',
    description: 'Fitness smartwatch with heart rate and SpO2 tracking.',
    priceCents: 9999,
    categorySlug: 'electronics',
    inventoryQty: 27,
  },
  {
    slug: 'air-fryer-compact',
    title: 'Air Fryer Compact',
    description: 'Digital air fryer with 7 presets and auto shut-off.',
    priceCents: 6899,
    categorySlug: 'home-essentials',
    inventoryQty: 23,
  },
  {
    slug: 'non-stick-pan-set',
    title: 'Non-Stick Pan Set',
    description: '3-piece non-stick cookware set for daily cooking.',
    priceCents: 3899,
    categorySlug: 'home-essentials',
    inventoryQty: 12,
  },
  {
    slug: 'memory-foam-pillow',
    title: 'Memory Foam Pillow',
    description: 'Ergonomic pillow designed for neck support.',
    priceCents: 2799,
    categorySlug: 'home-essentials',
    inventoryQty: 0,
  },
  {
    slug: 'cotton-bed-sheet-queen',
    title: 'Cotton Bed Sheet Queen',
    description: 'Breathable cotton bedsheet with two pillow covers.',
    priceCents: 3199,
    categorySlug: 'home-essentials',
    inventoryQty: 51,
  },
  {
    slug: 'robot-vacuum-basic',
    title: 'Robot Vacuum Basic',
    description: 'Self-charging vacuum with scheduled cleaning modes.',
    priceCents: 13999,
    categorySlug: 'home-essentials',
    inventoryQty: 9,
  },
  {
    slug: 'storage-organizer-bins',
    title: 'Storage Organizer Bins',
    description: 'Set of foldable bins for wardrobe and shelves.',
    priceCents: 1499,
    categorySlug: 'home-essentials',
    inventoryQty: 76,
  },
  {
    slug: 'resistance-bands-kit',
    title: 'Resistance Bands Kit',
    description: 'Workout resistance bands with handles and anchors.',
    priceCents: 2599,
    categorySlug: 'fitness',
    inventoryQty: 90,
  },
  {
    slug: 'jump-rope-speed',
    title: 'Jump Rope Speed',
    description: 'Adjustable jump rope with anti-slip grips.',
    priceCents: 899,
    categorySlug: 'fitness',
    inventoryQty: 133,
  },
  {
    slug: 'foam-roller-pro',
    title: 'Foam Roller Pro',
    description: 'Deep tissue foam roller for post-workout recovery.',
    priceCents: 1599,
    categorySlug: 'fitness',
    inventoryQty: 38,
  },
  {
    slug: 'kettlebell-12kg',
    title: 'Kettlebell 12kg',
    description: 'Powder-coated kettlebell for strength training.',
    priceCents: 3299,
    categorySlug: 'fitness',
    inventoryQty: 2,
  },
  {
    slug: 'running-shoes-light',
    title: 'Running Shoes Light',
    description: 'Lightweight running shoes with breathable upper.',
    priceCents: 4599,
    categorySlug: 'fashion',
    inventoryQty: 57,
  },
  {
    slug: 'hoodie-classic-fit',
    title: 'Hoodie Classic Fit',
    description: 'Cotton-blend hoodie with front pocket.',
    priceCents: 2499,
    categorySlug: 'fashion',
    inventoryQty: 44,
  },
  {
    slug: 'denim-jacket-stonewash',
    title: 'Denim Jacket Stonewash',
    description: 'Regular-fit denim jacket with button closure.',
    priceCents: 5299,
    categorySlug: 'fashion',
    inventoryQty: 0,
  },
  {
    slug: 'leather-wallet-slim',
    title: 'Leather Wallet Slim',
    description: 'RFID-protected slim wallet with coin pocket.',
    priceCents: 1899,
    categorySlug: 'fashion',
    inventoryQty: 73,
  },
  {
    slug: 'aviator-sunglasses',
    title: 'Aviator Sunglasses',
    description: 'UV-protected classic aviator frame sunglasses.',
    priceCents: 1699,
    categorySlug: 'fashion',
    inventoryQty: 21,
  },
  {
    slug: 'sneakers-street-low',
    title: 'Sneakers Street Low',
    description: 'Everyday low-top sneakers with cushioned sole.',
    priceCents: 3999,
    categorySlug: 'fashion',
    inventoryQty: 6,
  },
  {
    slug: 'vitamin-c-face-serum',
    title: 'Vitamin C Face Serum',
    description: 'Brightening serum for daily skincare routine.',
    priceCents: 1399,
    categorySlug: 'beauty',
    inventoryQty: 96,
  },
  {
    slug: 'matte-lipstick-trio',
    title: 'Matte Lipstick Trio',
    description: 'Set of long-lasting matte lipstick shades.',
    priceCents: 1199,
    categorySlug: 'beauty',
    inventoryQty: 62,
  },
  {
    slug: 'charcoal-face-wash',
    title: 'Charcoal Face Wash',
    description: 'Deep-cleanse face wash with activated charcoal.',
    priceCents: 799,
    categorySlug: 'beauty',
    inventoryQty: 149,
  },
  {
    slug: 'hair-dryer-ionic',
    title: 'Hair Dryer Ionic',
    description: 'Ionic hair dryer with cool-shot mode.',
    priceCents: 2799,
    categorySlug: 'beauty',
    inventoryQty: 11,
  },
  {
    slug: 'perfume-eau-de-parfum',
    title: 'Perfume Eau De Parfum',
    description: 'Long-lasting floral fragrance for daily wear.',
    priceCents: 3499,
    categorySlug: 'beauty',
    inventoryQty: 0,
  },
  {
    slug: 'self-help-atomic-habits',
    title: 'Atomic Habits (Paperback)',
    description: 'Build good habits and break bad ones.',
    priceCents: 699,
    categorySlug: 'books',
    inventoryQty: 81,
  },
  {
    slug: 'clean-code-paperback',
    title: 'Clean Code (Paperback)',
    description: 'Handbook of agile software craftsmanship.',
    priceCents: 899,
    categorySlug: 'books',
    inventoryQty: 33,
  },
  {
    slug: 'deep-work-paperback',
    title: 'Deep Work (Paperback)',
    description: 'Rules for focused success in a distracted world.',
    priceCents: 649,
    categorySlug: 'books',
    inventoryQty: 19,
  },
  {
    slug: 'kids-story-pack',
    title: 'Kids Story Pack',
    description: 'Illustrated story collection for early readers.',
    priceCents: 1199,
    categorySlug: 'books',
    inventoryQty: 5,
  },
  {
    slug: 'sql-interview-guide',
    title: 'SQL Interview Guide',
    description: 'Practical SQL problems and interview patterns.',
    priceCents: 799,
    categorySlug: 'books',
    inventoryQty: 0,
  },
  {
    slug: 'basmati-rice-5kg',
    title: 'Basmati Rice 5kg',
    description: 'Premium long-grain basmati rice for everyday meals.',
    priceCents: 899,
    categorySlug: 'groceries',
    inventoryQty: 110,
  },
  {
    slug: 'extra-virgin-olive-oil-1l',
    title: 'Extra Virgin Olive Oil 1L',
    description: 'Cold-pressed olive oil for cooking and salads.',
    priceCents: 1249,
    categorySlug: 'groceries',
    inventoryQty: 47,
  },
  {
    slug: 'almonds-roasted-500g',
    title: 'Almonds Roasted 500g',
    description: 'Roasted premium almonds with sea salt.',
    priceCents: 999,
    categorySlug: 'groceries',
    inventoryQty: 29,
  },
  {
    slug: 'dark-chocolate-bars-pack',
    title: 'Dark Chocolate Bars Pack',
    description: 'Pack of 5 rich dark chocolate bars.',
    priceCents: 599,
    categorySlug: 'groceries',
    inventoryQty: 94,
  },
  {
    slug: 'protein-granola-1kg',
    title: 'Protein Granola 1kg',
    description: 'Crunchy granola with nuts and seeds.',
    priceCents: 749,
    categorySlug: 'groceries',
    inventoryQty: 0,
  },
  {
    slug: 'green-tea-bags-100',
    title: 'Green Tea Bags (100)',
    description: 'Refreshing antioxidant-rich green tea bags.',
    priceCents: 449,
    categorySlug: 'groceries',
    inventoryQty: 140,
  },
  {
    slug: 'building-blocks-creative-set',
    title: 'Building Blocks Creative Set',
    description: '500-piece colorful building blocks for kids.',
    priceCents: 2199,
    categorySlug: 'toys',
    inventoryQty: 26,
  },
  {
    slug: 'remote-control-racing-car',
    title: 'Remote Control Racing Car',
    description: 'Rechargeable RC car with turbo speed mode.',
    priceCents: 2899,
    categorySlug: 'toys',
    inventoryQty: 14,
  },
  {
    slug: 'plush-bear-large',
    title: 'Plush Bear Large',
    description: 'Soft plush teddy bear for gifting and play.',
    priceCents: 1599,
    categorySlug: 'toys',
    inventoryQty: 65,
  },
  {
    slug: 'puzzle-1000-piece-landscape',
    title: 'Puzzle 1000 Piece Landscape',
    description: 'Premium quality 1000-piece landscape puzzle.',
    priceCents: 1099,
    categorySlug: 'toys',
    inventoryQty: 8,
  },
  {
    slug: 'board-game-family-night',
    title: 'Board Game Family Night',
    description: 'Fast-paced strategy board game for all ages.',
    priceCents: 1999,
    categorySlug: 'toys',
    inventoryQty: 0,
  },
  {
    slug: 'learning-flash-cards-kit',
    title: 'Learning Flash Cards Kit',
    description: 'Educational flash cards for numbers, letters, and shapes.',
    priceCents: 899,
    categorySlug: 'toys',
    inventoryQty: 39,
  },
]

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

  const categoryRecords = await Promise.all(
    categoriesSeed.map((category) => upsertCategory(category.name, category.slug)),
  )
  const categoryBySlug = new Map(categoryRecords.map((category) => [category.slug, category]))

  await Promise.all(
    productsSeed.map(async (product) => {
      const category = categoryBySlug.get(product.categorySlug)
      if (!category) {
        throw new Error(`Seed category not found for slug: ${product.categorySlug}`)
      }

      await upsertProduct({
        slug: product.slug,
        title: product.title,
        description: product.description,
        priceCents: product.priceCents,
        categoryId: category.id,
        inventoryQty: product.inventoryQty,
      })
    }),
  )

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

  console.log(
    `Seed complete: admin, ${categoriesSeed.length} categories, ${productsSeed.length} products, inventory, coupon`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
