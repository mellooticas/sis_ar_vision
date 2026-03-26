'use client'

import { useEffect, useRef, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Dialog({ open, onClose, children, size = 'md', className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={cn(
          'relative z-10 w-full rounded-xl border border-border bg-card shadow-xl animate-fade-in max-h-[90vh] overflow-y-auto',
          sizeClasses[size],
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({
  children,
  onClose,
  className,
}: {
  children: React.ReactNode
  onClose?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-between border-b border-border p-6', className)}>
      <div className="text-lg font-semibold font-heading">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('p-6', className)}>{children}</div>
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center justify-end gap-3 border-t border-border p-6', className)}>
      {children}
    </div>
  )
}
