'use client'

import { cn } from '@/lib/utils'
import {
  MIN_DISTANCE_MM,
  MAX_DISTANCE_MM,
  OPTIMAL_DISTANCE_MIN_MM,
  OPTIMAL_DISTANCE_MAX_MM,
} from '@/lib/ar/calibration-constants'

interface QualityIndicatorProps {
  faceDetected: boolean
  fps: number
  /** Estimated face-to-camera distance in mm (from iris depth estimation) */
  distanceMm?: number | null
  className?: string
}

function getDistanceInfo(distanceMm: number | null | undefined) {
  if (!distanceMm || distanceMm <= 0) return null

  if (distanceMm < MIN_DISTANCE_MM) {
    return { label: 'Muito perto', color: 'text-red-400' }
  }
  if (distanceMm < OPTIMAL_DISTANCE_MIN_MM) {
    return { label: 'Perto', color: 'text-amber-400' }
  }
  if (distanceMm <= OPTIMAL_DISTANCE_MAX_MM) {
    return { label: 'Ideal', color: 'text-emerald-400' }
  }
  if (distanceMm <= MAX_DISTANCE_MM) {
    return { label: 'Longe', color: 'text-amber-400' }
  }
  return { label: 'Muito longe', color: 'text-red-400' }
}

/**
 * Displays real-time feedback about face detection status, FPS, and distance.
 */
export function QualityIndicator({ faceDetected, fps, distanceMm, className }: QualityIndicatorProps) {
  const fpsColor = fps >= 24 ? 'text-emerald-400' : fps >= 15 ? 'text-amber-400' : 'text-red-400'
  const distanceInfo = getDistanceInfo(distanceMm)

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
          {faceDetected ? 'Rosto' : 'Sem rosto'}
        </span>
      </div>

      {/* Distance indicator */}
      {faceDetected && distanceInfo && (
        <span className={cn(distanceInfo.color)}>
          {distanceInfo.label}
        </span>
      )}

      {/* FPS counter */}
      <div className={cn('tabular-nums', fpsColor)}>
        {fps} fps
      </div>
    </div>
  )
}
