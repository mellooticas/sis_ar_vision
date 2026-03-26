'use client'

import { cn } from '@/lib/utils'
import { LensCrossSection } from './LensCrossSection'
import type { LensComparisonResult } from '@/lib/optics/lens-thickness'

interface LensThicknessComparisonProps {
  comparison: LensComparisonResult
  className?: string
}

const MATERIAL_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']

export function LensThicknessComparison({ comparison, className }: LensThicknessComparisonProps) {
  const isMinus = comparison.prescription.sph <= 0
  const thinnest = Math.min(...comparison.results.map((r) => r.maxThickness))

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {comparison.results.map((result, i) => {
          const isBest = result.maxThickness === thinnest
          const reductionPercent = comparison.results[0].maxThickness > 0
            ? Math.round((1 - result.maxThickness / comparison.results[0].maxThickness) * 100)
            : 0

          return (
            <div
              key={result.material.id}
              className={cn(
                'relative rounded-xl border p-4 transition-colors',
                isBest
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-card',
              )}
            >
              {isBest && (
                <span className="absolute -top-2.5 left-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Mais fina
                </span>
              )}

              <div className="text-center mb-3">
                <p className="text-sm font-semibold">{result.material.name}</p>
                <p className="text-xs text-muted-foreground">Indice {result.material.index}</p>
              </div>

              <LensCrossSection
                centerThickness={result.centerThickness}
                edgeThickness={result.edgeThickness}
                isMinus={isMinus}
                color={MATERIAL_COLORS[i]}
              />

              <div className="mt-3 space-y-1 text-center">
                <p className="text-lg font-bold">
                  {result.maxThickness}<span className="text-xs font-normal text-muted-foreground ml-0.5">mm</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Peso: ~{result.weight}g
                </p>
                {i > 0 && reductionPercent > 0 && (
                  <p className="text-xs font-medium text-emerald-500">
                    -{reductionPercent}% vs CR-39
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <p>
          Receita: {comparison.prescription.sph >= 0 ? '+' : ''}{comparison.prescription.sph.toFixed(2)}
          {comparison.prescription.cyl !== 0 && ` / ${comparison.prescription.cyl.toFixed(2)}`}
          {' | '}Diametro: {comparison.diameter}mm
        </p>
        <p className="mt-1">
          Valores aproximados para fins de comparacao. Espessura real pode variar conforme formato da armacao e centro optico.
        </p>
      </div>
    </div>
  )
}
