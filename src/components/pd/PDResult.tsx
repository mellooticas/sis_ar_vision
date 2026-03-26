'use client'

import { Check, RotateCcw, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PDResult as PDResultType } from '@/lib/ar/pd-calculator'

interface PDResultProps {
  result: PDResultType
  onRetry?: () => void
  onAccept?: (value: number) => void
  className?: string
}

export function PDResult({ result, onRetry, onAccept, className }: PDResultProps) {
  const confidencePercent = Math.round(result.confidence * 100)
  const confidenceColor =
    confidencePercent >= 85 ? 'text-emerald-500' :
    confidencePercent >= 70 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className={cn('rounded-xl border border-border bg-card p-6', className)}>
      {/* Main PD value */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <Ruler className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">Distancia Interpupilar</span>
        </div>
        <p className="text-5xl font-bold font-heading text-foreground">
          {result.value}<span className="text-2xl text-muted-foreground ml-1">mm</span>
        </p>
        <p className={cn('text-sm mt-1', confidenceColor)}>
          Confianca: {confidencePercent}%
        </p>
      </div>

      {/* Monocular PD */}
      {result.leftPD && result.rightPD && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">OD (Direito)</p>
            <p className="text-lg font-semibold">{result.rightPD} mm</p>
          </div>
          <div className="text-center rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">OE (Esquerdo)</p>
            <p className="text-lg font-semibold">{result.leftPD} mm</p>
          </div>
        </div>
      )}

      {/* Mode badge */}
      <div className="text-center mb-6">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
          Modo: {result.mode === 'iris' ? 'Estimativa por Iris' : 'Calibracao por Card'}
        </span>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mb-6">
        Esta e uma estimativa. Para prescricoes medicas, confirme com instrumentos profissionais.
        Precisao: {result.mode === 'iris' ? '+/- 1-2mm' : '+/- 0.5mm'}.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Repetir
          </Button>
        )}
        {onAccept && (
          <Button onClick={() => onAccept(result.value)} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Aceitar
          </Button>
        )}
      </div>
    </div>
  )
}
