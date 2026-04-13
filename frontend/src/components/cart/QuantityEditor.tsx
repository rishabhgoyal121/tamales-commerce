import { useEffect, useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'

type QuantityEditorProps = {
  initialQuantity: number
  disabled: boolean
  onCommit: (quantity: number) => void
}

export function QuantityEditor({ initialQuantity, disabled, onCommit }: QuantityEditorProps) {
  const [localQuantity, setLocalQuantity] = useState(initialQuantity)
  const [isPending, startTransition] = useTransition()
  const debounceTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setLocalQuantity(initialQuantity)
  }, [initialQuantity])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const scheduleCommit = (nextQuantity: number) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = window.setTimeout(() => {
      onCommit(nextQuantity)
    }, 250)
  }

  const setQuantity = (nextQuantity: number) => {
    const clamped = Math.max(1, Math.min(999, nextQuantity))

    startTransition(() => {
      setLocalQuantity(clamped)
    })

    scheduleCommit(clamped)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setQuantity(localQuantity - 1)}
        disabled={disabled || localQuantity <= 1 || isPending}
      >
        -
      </Button>
      <input
        className="w-14 rounded border border-slate-300 px-2 py-1 text-center text-sm"
        type="number"
        min={1}
        max={999}
        value={localQuantity}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10)
          if (!Number.isNaN(parsed)) {
            setQuantity(parsed)
          }
        }}
        disabled={disabled}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => setQuantity(localQuantity + 1)}
        disabled={disabled || isPending}
      >
        +
      </Button>
    </div>
  )
}
