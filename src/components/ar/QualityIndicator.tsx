'use client'

import { cn } from '@/lib/utils'

interface QualityIndicatorProps {
  faceDetected: boolean
  fps: number
  className?: string
}

/**
 * Displays real-time feedback about face detection status and FPS.
 */
export function QualityIndicator({ faceDetected, fps, className }: QualityIndicatorProps) {
  const fpsColor = fps >= 24 ? 'text-emerald-500' : fps >= 15 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className={cn('flex items-center gap-3 text-xs font-mono', className)}>
      {/* Face detection status */}
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            faceDetected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
          )}
        />
        <span className="text-white/80">
          {faceDetected ? 'Rosto detectado' : 'Sem rosto'}
        </span>
      </div>

      {/* FPS counter */}
      <div className={cn('tabular-nums', fpsColor)}>
        {fps} fps
      </div>
    </div>
  )
}
