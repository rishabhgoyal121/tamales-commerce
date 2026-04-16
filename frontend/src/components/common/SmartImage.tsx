import { useEffect, useMemo, useState, type ImgHTMLAttributes, type SyntheticEvent } from 'react'
import { cn } from '@/lib/utils'

const DEFAULT_FALLBACK_SRC = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#e2e8f0"/><stop offset="1" stop-color="#cbd5e1"/></linearGradient></defs><rect width="640" height="400" fill="url(#g)"/><g fill="#475569"><rect x="220" y="120" width="200" height="140" rx="12" opacity=".2"/><circle cx="280" cy="180" r="18" opacity=".5"/><path d="M250 235l45-38 30 28 25-20 40 30v15H250z" opacity=".5"/></g><text x="320" y="302" fill="#334155" font-family="Arial, sans-serif" font-size="18" text-anchor="middle">Image unavailable</text></svg>',
)}`

type SmartImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null
  sources?: string[]
  fallbackSrc?: string
  placeholderLabel?: string
}

export function SmartImage({
  src,
  sources = [],
  alt,
  className,
  onError,
  onLoad,
  loading,
  decoding,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  placeholderLabel,
  ...rest
}: SmartImageProps) {
  const safeFallbackSrc = fallbackSrc.trim() ? fallbackSrc : DEFAULT_FALLBACK_SRC
  const candidateSources = useMemo(() => {
    const values = [src ?? '', ...sources]
      .map((value) => value.trim())
      .filter((value) => value.length > 0)

    // Preserve order while removing duplicates.
    return [...new Set(values)]
  }, [src, sources])

  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(candidateSources[0] ?? safeFallbackSrc)
  const [showFallbackBlock, setShowFallbackBlock] = useState(false)

  useEffect(() => {
    setCurrentSourceIndex(0)
    setCurrentSrc(candidateSources[0] ?? safeFallbackSrc)
    setShowFallbackBlock(false)
  }, [candidateSources, safeFallbackSrc])

  const label = useMemo(() => placeholderLabel ?? alt ?? 'Image unavailable', [alt, placeholderLabel])

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    onError?.(event)

    const nextSource = candidateSources[currentSourceIndex + 1]
    if (nextSource) {
      setCurrentSourceIndex((value) => value + 1)
      setCurrentSrc(nextSource)
      return
    }

    if (currentSrc !== safeFallbackSrc) {
      setCurrentSrc(safeFallbackSrc)
      return
    }

    setShowFallbackBlock(true)
  }

  if (showFallbackBlock) {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          'flex items-center justify-center bg-slate-200 text-center text-xs font-medium text-slate-600',
          className,
        )}
      >
        <span className="px-2">{label}</span>
      </div>
    )
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading ?? 'lazy'}
      decoding={decoding ?? 'async'}
      onError={handleError}
      onLoad={onLoad}
      {...rest}
    />
  )
}
