import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SmartImage } from '@/components/common/SmartImage'
import type { MarketplaceHeroSlide } from '@/lib/marketplace-data'

type HeroCarouselProps = {
  slides: MarketplaceHeroSlide[]
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-slate-900 text-white shadow-sm">
      <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <article key={slide.id} className="relative min-w-full">
            <SmartImage
              src={slide.imageUrl}
              alt={slide.title}
              className="h-[280px] w-full object-cover opacity-70 sm:h-[360px]"
              loading={slide.id === slides[0]?.id ? 'eager' : 'lazy'}
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-200">Featured</p>
              <h2 className="mt-2 max-w-xl text-2xl font-semibold leading-tight sm:text-4xl">{slide.title}</h2>
              <p className="mt-3 max-w-xl text-sm text-slate-100 sm:text-base">{slide.subtitle}</p>
              <div className="mt-5">
                <Link
                  to={slide.ctaHref}
                  className="inline-flex h-8 items-center rounded-lg bg-orange-500 px-3 text-sm font-medium text-white transition hover:bg-orange-400"
                >
                  {slide.ctaLabel}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/40 px-2 py-1">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={`h-2 w-2 rounded-full transition ${
              index === activeIndex ? 'bg-white' : 'bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  )
}
