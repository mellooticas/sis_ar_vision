'use client'

import { LENS_TINTS, type LensTint } from '@/types/lens-demo'

interface LensTintSelectorProps {
  selected: LensTint
  onSelect: (tint: LensTint) => void
}

export function LensTintSelector({ selected, onSelect }: LensTintSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Cor da Lente</p>
      <div className="flex flex-wrap gap-2">
        {LENS_TINTS.map((tint) => {
          const isSelected = selected.id === tint.id
          const isTransparent = tint.color === 'transparent'

          return (
            <button
              key={tint.id}
              type="button"
              onClick={() => onSelect(tint)}
              title={tint.name}
              className={[
                'relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                isSelected
                  ? 'border-primary ring-2 ring-primary/30 scale-110'
                  : 'border-border hover:scale-105',
              ].join(' ')}
            >
              {isTransparent ? (
                <div className="h-5 w-5 rounded-full border border-dashed border-muted-foreground/40" />
              ) : tint.gradient ? (
                <div
                  className="h-5 w-5 rounded-full"
                  style={{
                    background: `linear-gradient(to bottom, ${tint.color} 0%, transparent 100%)`,
                    opacity: tint.opacity,
                  }}
                />
              ) : (
                <div
                  className="h-5 w-5 rounded-full"
                  style={{
                    backgroundColor: tint.color,
                    opacity: tint.opacity,
                  }}
                />
              )}
              {tint.mirror && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
              )}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">{selected.name}</p>
    </div>
  )
}
