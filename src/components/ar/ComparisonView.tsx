'use client'

import { cn } from '@/lib/utils'
import type { CaptureItem } from '@/lib/ar/capture'

interface ComparisonViewProps {
  captures: CaptureItem[]
  className?: string
}

/**
 * Side-by-side comparison of try-on captures.
 * Shows 2-4 captures in a grid for easy visual comparison.
 */
export function ComparisonView({ captures, className }: ComparisonViewProps) {
  if (captures.length < 2) {
    return (
      <div className={cn('flex items-center justify-center rounded-xl border border-dashed p-12', className)}>
        <p className="text-sm text-muted-foreground">
          Selecione pelo menos 2 fotos para comparar
        </p>
      </div>
    )
  }

  const gridCols = captures.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'

  return (
    <div className={cn('grid gap-3', gridCols, className)}>
      {captures.map((capture) => (
        <div
          key={capture.id}
          className="relative overflow-hidden rounded-xl border bg-card"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capture.localUrl}
            alt={capture.productName ?? 'Captura try-on'}
            className="aspect-[3/4] w-full object-cover"
          />
          {capture.productName && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
              <p className="text-sm font-medium text-white">{capture.productName}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
