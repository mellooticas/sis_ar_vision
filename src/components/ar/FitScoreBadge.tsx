'use client'

import { cn } from '@/lib/utils'
import type { FitScoreResult } from '@/lib/ar/fit-score'

interface FitScoreBadgeProps {
  result: FitScoreResult
  compact?: boolean
  className?: string
}

// Tokens semanticos canonicos (DS 2026-05-18). Dark mode adapta via CSS vars.
const CATEGORY_COLORS = {
  perfeito:   { bg: 'bg-success',     text: 'text-success',     ring: 'stroke-success' },
  aceitavel:  { bg: 'bg-warning',     text: 'text-warning',     ring: 'stroke-warning' },
  inadequado: { bg: 'bg-destructive', text: 'text-destructive', ring: 'stroke-destructive' },
}

const CATEGORY_LABELS = {
  perfeito: 'Perfeito',
  aceitavel: 'Aceitavel',
  inadequado: 'Inadequado',
}

export function FitScoreBadge({ result, compact, className }: FitScoreBadgeProps) {
  const colors = CATEGORY_COLORS[result.category]
  const circumference = 2 * Math.PI * 18
  const progress = (result.score / 100) * circumference

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1', colors.bg, 'bg-opacity-20', className)}>
        <span className={cn('text-xs font-bold', colors.text)}>{result.score}</span>
        <span className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[result.category]}</span>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Circular gauge */}
      <div className="relative h-14 w-14">
        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20" cy="20" r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted/30"
          />
          <circle
            cx="20" cy="20" r="18"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className={colors.ring}
          />
        </svg>
        <span className={cn('absolute inset-0 flex items-center justify-center text-sm font-bold', colors.text)}>
          {result.score}
        </span>
      </div>
      <div className="text-center">
        <p className={cn('text-xs font-semibold', colors.text)}>
          {CATEGORY_LABELS[result.category]}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {result.recommendation}
        </p>
      </div>
    </div>
  )
}
