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
    return { label: 'Muito perto', color: 'text-destructive' }
  }
  if (distanceMm < OPTIMAL_DISTANCE_MIN_MM) {
    return { label: 'Perto', color: 'text-warning' }
  }
  if (distanceMm <= OPTIMAL_DISTANCE_MAX_MM) {
    return { label: 'Ideal', color: 'text-success' }
  }
  if (distanceMm <= MAX_DISTANCE_MM) {
    return { label: 'Longe', color: 'text-warning' }
  }
  return { label: 'Muito longe', color: 'text-destructive' }
}

/**
 * Displays real-time feedback about face detection status, FPS, and distance.
 */
export function QualityIndicator({ faceDetected, fps, distanceMm, className }: QualityIndicatorProps) {
  const fpsColor = fps >= 24 ? 'text-success' : fps >= 15 ? 'text-warning' : 'text-destructive'
  const distanceInfo = getDistanceInfo(distanceMm)

  return (
    <div className={cn('flex items-center gap-3 text-xs font-mono', className)}>
      {/* Face detection status */}
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            faceDetected ? 'bg-success animate-pulse' : 'bg-destructive'
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
