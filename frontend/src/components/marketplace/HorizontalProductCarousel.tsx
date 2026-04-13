import { Link } from 'react-router-dom'
import { SmartImage } from '@/components/common/SmartImage'
import type { MarketplaceProductCard } from '@/lib/marketplace-data'

type HorizontalProductCarouselProps = {
  title: string
  products: MarketplaceProductCard[]
}

export function HorizontalProductCarousel({ title, products }: HorizontalProductCarouselProps) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {products.map((product) => (
          <Link
            key={product.id}
            to={product.href}
            className="group min-w-[220px] rounded-lg border border-slate-200/80 bg-slate-50/70 p-3"
          >
            <div className="relative overflow-hidden rounded-md bg-white">
              <SmartImage
                src={product.imageUrl}
                alt={product.title}
                loading="lazy"
                decoding="async"
                className="h-32 w-full object-cover transition duration-300 group-hover:scale-105"
              />
              {product.badge ? (
                <span className="absolute left-2 top-2 rounded bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {product.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-900">{product.title}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{product.priceLabel}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
