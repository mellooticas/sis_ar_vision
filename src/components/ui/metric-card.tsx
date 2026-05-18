import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'info'
  className?: string
}

/**
 * Variantes em tokens semanticos canonicos (--success, --warning, --destructive, --info).
 * Dark mode automatico via .dark { --success/warning/...: ... }.
 * bg-success(slash)15 = fundo sutil, cor de texto e o token (uma classe substitui 4 hardcoded).
 */
const variantClasses = {
  default: 'bg-muted/50 text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/15 text-destructive',
  info: 'bg-info/15 text-info',
}

/**
 * MetricCard canonico — icone + valor + label. Padrao DS:
 * - tabular-nums no valor (numeros alinham digito a digito entre cards)
 * - Variantes em tokens semanticos (dark mode automatico)
 * - leading-tight no valor pra densidade vertical
 */
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
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg shrink-0', variantClasses[variant])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums leading-tight font-heading">{value}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  )
}
