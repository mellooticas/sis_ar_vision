import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive'
  className?: string
}

const variantClasses = {
  default: 'bg-muted/50 text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  destructive: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  variant = 'primary',
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', variantClasses[variant])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold font-heading">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}
