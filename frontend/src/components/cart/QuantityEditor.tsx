import { useEffect, useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      <Input
        className="h-8 w-14 px-1 text-center"
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
