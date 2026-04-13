import { Link } from 'react-router-dom'
import { SmartImage } from '@/components/common/SmartImage'
import type { MarketplaceCategoryCard } from '@/lib/marketplace-data'

type CategoryDealsGridProps = {
  title: string
  items: MarketplaceCategoryCard[]
  onQuickAdd?: (item: MarketplaceCategoryCard) => void
  quickAddPendingId?: string | null
}

export function CategoryDealsGrid({ title, items, onQuickAdd, quickAddPendingId }: CategoryDealsGridProps) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Link key={item.id} to={item.href} className="group overflow-hidden rounded-lg border border-slate-200/80">
            <div className="relative">
              <SmartImage
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <button
                type="button"
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white shadow transition hover:bg-slate-700 disabled:opacity-60"
                title="Add to cart"
                aria-label={`Quick add from ${item.title}`}
                disabled={!onQuickAdd || quickAddPendingId === item.id}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onQuickAdd?.(item)
                }}
              >
                +
              </button>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-slate-900">{item.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
