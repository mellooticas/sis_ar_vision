'use client'

import { COATING_LAYERS } from '@/lib/optics/coating-simulator'

interface CoatingToggleProps {
  activeIds: Set<string>
  onToggle: (id: string) => void
}

export function CoatingToggle({ activeIds, onToggle }: CoatingToggleProps) {
  return (
    <div className="space-y-2">
      {COATING_LAYERS.map((layer) => {
        const active = activeIds.has(layer.id)
        return (
          <button
            key={layer.id}
            type="button"
            onClick={() => onToggle(layer.id)}
            className={[
              'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
              active
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-card hover:bg-accent/50',
            ].join(' ')}
          >
            {/* Toggle indicator */}
            <div
              className={[
                'flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                active ? 'bg-primary justify-end' : 'bg-muted justify-start',
              ].join(' ')}
            >
              <div
                className={[
                  'h-4 w-4 rounded-full bg-white shadow-sm transition-transform mx-0.5',
                ].join(' ')}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{layer.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {layer.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
