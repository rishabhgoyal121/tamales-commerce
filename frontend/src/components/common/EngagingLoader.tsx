import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const LOADING_FACT_STORAGE_KEY = 'tamales.loading-fact-index.v1'
const FACT_ROTATION_INTERVAL_MS = 4200

const LOADING_FACTS: readonly string[] = [
  'Octopuses have three hearts. Two pump blood to the gills, one to the rest of the body.',
  'Bananas are berries in botanical terms, but strawberries are not.',
  'Honey can last for years when stored properly because of its low moisture and acidity.',
  'A day on Venus is longer than a year on Venus because it rotates very slowly.',
  'Some bamboo species can grow more than a foot in a single day in ideal conditions.',
  'Sharks existed before trees appeared on Earth.',
  'The Eiffel Tower can be slightly taller in summer due to thermal expansion.',
  'Your brain uses roughly one-fifth of your body\'s oxygen while at rest.',
  'Saturn would float in a giant ocean because its average density is lower than water.',
  'Koalas have fingerprints so similar to humans that they can confuse scanners.',
  'The shortest war in recorded history lasted less than one hour.',
  'Some turtles can breathe through specialized tissues near their tail in cold water.',
]

type EngagingLoaderProps = {
  title?: string
  subtitle?: string
  className?: string
  compact?: boolean
}

function getInitialFactIndex() {
  if (typeof window === 'undefined') {
    return 0
  }

  try {
    const rawIndex = window.localStorage.getItem(LOADING_FACT_STORAGE_KEY)
    const parsedIndex = rawIndex === null ? Number.NaN : Number.parseInt(rawIndex, 10)
    const nextIndex = Number.isInteger(parsedIndex)
      ? (parsedIndex + 1) % LOADING_FACTS.length
      : Math.floor(Math.random() * LOADING_FACTS.length)

    window.localStorage.setItem(LOADING_FACT_STORAGE_KEY, String(nextIndex))

    return nextIndex
  } catch {
    return Math.floor(Math.random() * LOADING_FACTS.length)
  }
}

export function EngagingLoader({
  title = 'Loading fresh data',
  subtitle = 'Hang tight while we prepare your screen.',
  className,
  compact = false,
}: EngagingLoaderProps) {
  const [factIndex, setFactIndex] = useState(() => getInitialFactIndex())

  useEffect(() => {
    if (LOADING_FACTS.length <= 1) {
      return
    }

    const intervalId = window.setInterval(() => {
      setFactIndex((current) => (current + 1) % LOADING_FACTS.length)
    }, FACT_ROTATION_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const activeFact = useMemo(
    () => LOADING_FACTS[factIndex] ?? 'Interesting fact coming up next...',
    [factIndex],
  )

  const content = (
    <Card
      className={cn(
        'w-full border-slate-200/90 bg-white/95 p-4 shadow-sm',
        compact ? 'max-w-none' : 'max-w-xl',
      )}
    >
      <div className={cn('flex gap-3', compact ? 'items-start' : 'items-center')}>
        <div className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
          <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-amber-300/40 motion-reduce:animate-none" />
          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 motion-reduce:animate-none" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-600">{subtitle}</p>
          <p className="rounded-md bg-amber-50/80 px-2.5 py-2 text-xs text-amber-900">
            Did you know? {activeFact}
          </p>
        </div>
      </div>
    </Card>
  )

  if (compact) {
    return (
      <div className={cn('w-full', className)} role="status" aria-live="polite" aria-busy="true">
        {content}
      </div>
    )
  }

  return (
    <div
      className={cn('flex min-h-[26vh] items-center justify-center', className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {content}
    </div>
  )
}
