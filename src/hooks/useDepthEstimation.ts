'use client'

import { useMemo } from 'react'
import {
  estimateDepthFromIris,
  crossValidateDepth,
  type DepthEstimate,
} from '@/lib/ar/depth-estimator'
import type { Point3D } from '@/lib/ar/face-math'

interface DepthEstimationResult extends DepthEstimate {
  /** Whether depth cross-validation passed */
  valid: boolean
  /** Divergence percentage from expected depth */
  divergencePct: number
}

/**
 * Hook that estimates face-to-camera distance from iris diameter
 * and cross-validates against the silhouette guide constraint.
 */
export function useDepthEstimation(
  landmarks: Point3D[] | null,
  videoWidth: number,
  silhouetteAligned?: boolean,
): DepthEstimationResult | null {
  return useMemo(() => {
    if (!landmarks || landmarks.length < 478) return null

    const estimate = estimateDepthFromIris(landmarks, videoWidth)
    if (!estimate) return null

    const validation = crossValidateDepth(estimate.depthMm, silhouetteAligned ?? false)

    return {
      ...estimate,
      ...validation,
    }
  }, [landmarks, videoWidth, silhouetteAligned])
}
