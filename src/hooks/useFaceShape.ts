'use client'

import { useState, useCallback, useRef } from 'react'
import { classifyFaceShape, type FaceShapeResult } from '@/lib/ar/face-shape-classifier'
import type { Point3D } from '@/lib/ar/face-math'

/**
 * Hook for stable face shape classification.
 * Uses a sample buffer (20 samples) — stabilizes when 70% agree on shape.
 */
export function useFaceShape() {
  const [result, setResult] = useState<FaceShapeResult | null>(null)
  const [isStable, setIsStable] = useState(false)
  const samplesRef = useRef<FaceShapeResult[]>([])

  const processSample = useCallback((landmarks: Point3D[]) => {
    const classification = classifyFaceShape(landmarks)
    if (!classification) return

    samplesRef.current.push(classification)
    if (samplesRef.current.length > 20) samplesRef.current.shift()

    // Update current result immediately
    setResult(classification)

    // Stability: check if last 10 samples agree on shape
    if (samplesRef.current.length >= 10) {
      const last10 = samplesRef.current.slice(-10)
      const shapeCounts = new Map<string, number>()
      for (const s of last10) {
        shapeCounts.set(s.shape, (shapeCounts.get(s.shape) ?? 0) + 1)
      }
      const [, maxCount] = [...shapeCounts.entries()].sort((a, b) => b[1] - a[1])[0]
      setIsStable(maxCount >= 7) // 70% agreement
    }
  }, [])

  const reset = useCallback(() => {
    samplesRef.current = []
    setResult(null)
    setIsStable(false)
  }, [])

  return { result, isStable, processSample, reset }
}
