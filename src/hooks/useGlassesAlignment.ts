'use client'

import { useMemo } from 'react'
import { computeGlassesTransform } from '@/lib/ar/glasses-transform'
import type { GlassesTransform } from '@/types/ar'
import type { CalibrationState } from '@/types/measurement'

interface UseGlassesAlignmentOptions {
  landmarks: Array<{ x: number; y: number; z: number }> | null
  facialTransformationMatrix?: number[] | null
  videoWidth: number
  videoHeight: number
  /** Calibration for real-size rendering */
  calibration?: CalibrationState | null
  /** Estimated depth from iris (mm) */
  estimatedDepthMm?: number | null
  /** Frame total width in mm (from product metadata) */
  frameWidthMm?: number | null
}

/**
 * Converts face landmarks to a Three.js transform for the glasses model.
 * Returns null if no landmarks are available.
 */
export function useGlassesAlignment(options: UseGlassesAlignmentOptions): GlassesTransform | null {
  const {
    landmarks,
    facialTransformationMatrix,
    videoWidth,
    videoHeight,
    calibration,
    estimatedDepthMm,
    frameWidthMm,
  } = options

  return useMemo(() => {
    if (!landmarks || landmarks.length < 468 || videoWidth === 0 || videoHeight === 0) {
      return null
    }

    return computeGlassesTransform({
      landmarks,
      facialTransformationMatrix: facialTransformationMatrix ?? null,
      videoWidth,
      videoHeight,
      calibration: calibration ?? null,
      estimatedDepthMm: estimatedDepthMm ?? null,
      frameWidthMm: frameWidthMm ?? null,
    })
  }, [landmarks, facialTransformationMatrix, videoWidth, videoHeight, calibration, estimatedDepthMm, frameWidthMm])
}
