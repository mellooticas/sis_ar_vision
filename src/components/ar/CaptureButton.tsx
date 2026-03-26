'use client'

import { Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CaptureButtonProps {
  onClick: () => void
  disabled?: boolean
  isCapturing?: boolean
  className?: string
}

export function CaptureButton({ onClick, disabled, isCapturing, className }: CaptureButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isCapturing}
      className={cn(
        'relative flex h-14 w-14 items-center justify-center rounded-full',
        'bg-white text-black shadow-lg transition-all',
        'hover:scale-105 active:scale-95',
        'disabled:opacity-40 disabled:hover:scale-100',
        isCapturing && 'animate-pulse',
        className,
      )}
      aria-label="Capturar foto"
    >
      <Camera className="h-6 w-6" />
      {/* Shutter ring */}
      <span className="absolute inset-0 rounded-full border-[3px] border-white/60" />
    </button>
  )
}
