import { cn } from '@/lib/utils'

interface PageHeaderProps {
  /**
   * Eyebrow opcional (overline canonico DS) — contexto editorial antes do titulo.
   */
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

/**
 * PageHeader canonico Clearix AR Vision.
 * - Eyebrow opcional (text-overline + uppercase + tracking-wide)
 * - Title em text-3xl + tracking-snug + font-heading (Montserrat)
 * - Description max-w-prose + muted
 * - Actions shrink-0
 */
export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-8', className)}>
      <div className="flex-1 min-w-0">
        {eyebrow && (
          <p className="text-overline font-medium text-muted-foreground uppercase tracking-wide">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-snug text-foreground font-heading">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-prose">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 mt-4 sm:mt-0 shrink-0">{actions}</div>}
    </div>
  )
}
