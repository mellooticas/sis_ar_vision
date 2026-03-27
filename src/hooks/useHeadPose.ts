'use client'

import { useMemo } from 'react'
import { extractHeadPose, type HeadPose } from '@/lib/ar/head-pose'

/**
 * Hook that extracts head pose (yaw, pitch, roll) from the
 * MediaPipe facial transformation matrix.
 */
export function useHeadPose(facialTransformationMatrix: number[] | null): HeadPose | null {
  return useMemo(() => {
    if (!facialTransformationMatrix) return null
    return extractHeadPose(facialTransformationMatrix)
  }, [facialTransformationMatrix])
}
