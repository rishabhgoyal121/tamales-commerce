type OfferTickerProps = {
  offers: string[]
}

export function OfferTicker({ offers }: OfferTickerProps) {
  return (
    <section className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {offers.map((offer) => (
          <span key={offer} className="rounded-full bg-white px-3 py-1 text-xs font-medium">
            {offer}
          </span>
        ))}
      </div>
    </section>
  )
}
