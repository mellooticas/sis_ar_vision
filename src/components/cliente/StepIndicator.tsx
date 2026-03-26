'use client'

import { cn } from '@/lib/utils'
import type { ClientStep } from '@/store/client-session-store'

const STEPS: { id: ClientStep; label: string }[] = [
  { id: 'identify', label: 'Identificar' },
  { id: 'face-shape', label: 'Formato' },
  { id: 'recommendations', label: 'Sugestoes' },
  { id: 'try-on', label: 'Provar' },
  { id: 'measurements', label: 'Medidas' },
  { id: 'summary', label: 'Resumo' },
]

interface StepIndicatorProps {
  currentStep: ClientStep
  completedSteps: ClientStep[]
  className?: string
}

export function StepIndicator({ currentStep, completedSteps, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {STEPS.map((step, i) => {
        const isCurrent = step.id === currentStep
        const isCompleted = completedSteps.includes(step.id)

        return (
          <div key={step.id} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'h-1.5 w-full rounded-full transition-colors',
                  isCompleted ? 'bg-primary' : isCurrent ? 'bg-primary/50' : 'bg-muted',
                )}
              />
              <span
                className={cn(
                  'mt-1 text-[10px]',
                  isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
