import * as React from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  className,
  disabled,
  ...props
}: NumberInputProps) {
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleIncrement = React.useCallback(() => {
    onChange(Math.min(value + step, max))
  }, [onChange, value, step, max])

  const handleDecrement = React.useCallback(() => {
    onChange(Math.max(value - step, min))
  }, [onChange, value, step, min])

  const startIncrement = () => {
    handleIncrement()
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(handleIncrement, 100)
    }, 400)
  }

  const startDecrement = () => {
    handleDecrement()
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(handleDecrement, 100)
    }, 400)
  }

  const stopRepeating = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  React.useEffect(() => {
    return () => stopRepeating()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(max, newValue)))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Ensure value is within bounds on blur
    const newValue = parseFloat(e.target.value)
    if (isNaN(newValue)) {
      onChange(min)
    } else {
      onChange(Math.max(min, Math.min(max, newValue)))
    }
  }

  return (
    <div className={cn('flex items-center w-full', className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10 rounded-r-none border-r-0 shrink-0 hover:bg-muted active:bg-muted/80"
        onMouseDown={startDecrement}
        onMouseUp={stopRepeating}
        onMouseLeave={stopRepeating}
        onTouchStart={startDecrement}
        onTouchEnd={stopRepeating}
        disabled={disabled || value <= min}
      >
        <Minus className="size-4" />
      </Button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full min-w-0 border-y border-input bg-transparent px-3 py-2 text-center text-sm font-medium shadow-xs transition-colors',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:z-10 focus-visible:border-ring',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
        {...props}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-10 rounded-l-none border-l-0 shrink-0 hover:bg-muted active:bg-muted/80"
        onMouseDown={startIncrement}
        onMouseUp={stopRepeating}
        onMouseLeave={stopRepeating}
        onTouchStart={startIncrement}
        onTouchEnd={stopRepeating}
        disabled={disabled || value >= max}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  )
}
