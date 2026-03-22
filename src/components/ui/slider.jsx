import * as React from 'react'

import { cn } from '@/lib/utils'

function Slider({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }) {
  const current = Array.isArray(value) ? value[0] : value

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center', className)} {...props}>
      <input
        type="range"
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-600"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(event) => onValueChange?.([Number(event.target.value)])}
      />
    </div>
  )
}

export { Slider }
