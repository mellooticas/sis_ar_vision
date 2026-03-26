'use client'

import { useState, useCallback, useRef } from 'react'
import { calculateFitScore, type FitScoreResult } from '@/lib/ar/fit-score'
import type { Point3D } from '@/lib/ar/face-math'

/**
 * Hook for stabilized fit score calculation.
 * Uses a 10-sample buffer — stabilizes when stddev < 3 over last 8 samples.
 */
export function useFitScore(frameWidthMm: number) {
  const [result, setResult] = useState<FitScoreResult | null>(null)
  const [isStable, setIsStable] = useState(false)
  const samplesRef = useRef<number[]>([])

  const processSample = useCallback((landmarks: Point3D[]) => {
    if (frameWidthMm <= 0) return

    const score = calculateFitScore(landmarks, frameWidthMm)
    if (!score) return

    setResult(score)

    samplesRef.current.push(score.score)
    if (samplesRef.current.length > 10) samplesRef.current.shift()

    if (samplesRef.current.length >= 8) {
      const values = samplesRef.current
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length
      const stddev = Math.sqrt(variance)
      setIsStable(stddev < 3)
    }
  }, [frameWidthMm])

  const reset = useCallback(() => {
    samplesRef.current = []
    setResult(null)
    setIsStable(false)
  }, [])

  return { result, isStable, processSample, reset }
}
