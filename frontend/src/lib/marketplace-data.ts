export type MarketplaceHeroSlide = {
  id: string
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  imageUrl: string
}

export type MarketplaceCategoryCard = {
  id: string
  title: string
  imageUrl: string
  href: string
}

export type MarketplaceProductCard = {
  id: string
  title: string
  priceLabel: string
  imageUrl: string
  badge?: string
  href: string
}

export const heroSlides: MarketplaceHeroSlide[] = [
  {
    id: 'hero-1',
    title: 'Smart Home Upgrades',
    subtitle: 'Save up to 35% on lighting, audio, and daily essentials.',
    ctaLabel: 'Shop electronics',
    ctaHref: '/products?q=smart',
    imageUrl:
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'hero-2',
    title: 'Fitness Week Deals',
    subtitle: 'Build your setup with mats, dumbbells, and accessories.',
    ctaLabel: 'Explore fitness',
    ctaHref: '/products?q=fitness',
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'hero-3',
    title: 'Everyday Picks',
    subtitle: 'Handpicked value products updated daily for your cart.',
    ctaLabel: 'Browse all products',
    ctaHref: '/products',
    imageUrl:
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=80',
  },
]

export const categoryDeals: MarketplaceCategoryCard[] = [
  {
    id: 'cat-1',
    title: 'Work from Home',
    imageUrl:
      'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    href: '/products?q=keyboard',
  },
  {
    id: 'cat-2',
    title: 'Kitchen & Dining',
    imageUrl:
      'https://images.unsplash.com/photo-1507914464562-6ff4ac29692f?auto=format&fit=crop&w=900&q=80',
    href: '/products?q=mug',
  },
  {
    id: 'cat-3',
    title: 'Home Workout',
    imageUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
    href: '/products?q=dumbbell',
  },
  {
    id: 'cat-4',
    title: 'Audio Essentials',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    href: '/products?q=headphones',
  },
]

export const featuredDeals: MarketplaceProductCard[] = [
  {
    id: 'deal-1',
    title: 'Wireless Headphones Pro',
    priceLabel: '$89.99',
    badge: 'Top Rated',
    href: '/products/slug/wireless-headphones-pro',
    imageUrl:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'deal-2',
    title: 'Smart Desk Lamp',
    priceLabel: '$24.99',
    badge: 'Deal',
    href: '/products/slug/smart-desk-lamp',
    imageUrl:
      'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'deal-3',
    title: 'Yoga Mat Grip Plus',
    priceLabel: '$21.99',
    badge: 'Trending',
    href: '/products/slug/yoga-mat-grip-plus',
    imageUrl:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'deal-4',
    title: 'Mechanical Keyboard Lite',
    priceLabel: '$54.99',
    href: '/products/slug/mechanical-keyboard-lite',
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'deal-5',
    title: 'Ceramic Mug Set',
    priceLabel: '$17.99',
    href: '/products/slug/ceramic-coffee-mug-set',
    imageUrl:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'deal-6',
    title: 'Adjustable Dumbbells',
    priceLabel: '$119.99',
    badge: 'Limited Stock',
    href: '/products/slug/adjustable-dumbbells-20kg',
    imageUrl:
      'https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4f4?auto=format&fit=crop&w=900&q=80',
  },
]

export const quickOffers = [
  'Free shipping over $50',
  'Extra 10% off with coupon SAVE10',
  'New user welcome deals live now',
  'Daily lightning deals refresh every 6 hours',
]
