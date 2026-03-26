'use client'

import { cn } from '@/lib/utils'
import {
  FACE_SHAPE_LABELS,
  FACE_SHAPE_DESCRIPTIONS,
  type FaceShapeResult,
} from '@/lib/ar/face-shape-classifier'
import { Badge } from '@/components/ui/badge'

interface FaceShapeCardProps {
  result: FaceShapeResult
  className?: string
}

const SHAPE_ICONS: Record<string, string> = {
  oval: '⬮',
  round: '●',
  square: '■',
  heart: '♥',
  oblong: '▮',
  diamond: '◆',
  triangle: '▲',
}

export function FaceShapeCard({ result, className }: FaceShapeCardProps) {
  const confidencePercent = Math.round(result.confidence * 100)
  const confidenceColor =
    confidencePercent >= 80 ? 'text-emerald-500' :
    confidencePercent >= 60 ? 'text-amber-500' : 'text-red-400'

  return (
    <div className={cn('rounded-xl border bg-card p-6 space-y-4', className)}>
      {/* Shape header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-3xl">
          {SHAPE_ICONS[result.shape] || '○'}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">
            Rosto {FACE_SHAPE_LABELS[result.shape]}
          </h3>
          <p className={cn('text-sm font-medium', confidenceColor)}>
            {confidencePercent}% confianca
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground">
        {FACE_SHAPE_DESCRIPTIONS[result.shape]}
      </p>

      {/* Recommendations */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-foreground">
          Armacoes Recomendadas
        </h4>
        <div className="space-y-2">
          {result.recommendations.map((rec) => (
            <div
              key={rec.style}
              className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
            >
              <Badge variant="secondary" className="shrink-0 mt-0.5">
                {rec.style}
              </Badge>
              <span className="text-sm text-muted-foreground">{rec.reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Measurements (debug/advanced) */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer opacity-60 hover:opacity-100">
          Medidas detalhadas
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-1 font-mono">
          <span>Comprimento/Largura:</span>
          <span>{result.measurements.lengthToWidthRatio.toFixed(2)}</span>
          <span>Testa/Mandibula:</span>
          <span>{result.measurements.foreheadToJawRatio.toFixed(2)}</span>
          <span>Macas/Mandibula:</span>
          <span>{result.measurements.cheekToJawRatio.toFixed(2)}</span>
        </div>
      </details>
    </div>
  )
}
