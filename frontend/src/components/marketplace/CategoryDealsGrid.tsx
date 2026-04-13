import { Link } from 'react-router-dom'
import { SmartImage } from '@/components/common/SmartImage'
import type { MarketplaceCategoryCard } from '@/lib/marketplace-data'

type CategoryDealsGridProps = {
  title: string
  items: MarketplaceCategoryCard[]
}

export function CategoryDealsGrid({ title, items }: CategoryDealsGridProps) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Link key={item.id} to={item.href} className="group overflow-hidden rounded-lg border border-slate-200/80">
            <SmartImage
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <div className="p-3">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
