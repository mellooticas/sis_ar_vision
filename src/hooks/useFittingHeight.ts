'use client'

import { useState, useCallback, useRef } from 'react'
import { calculateFittingHeight, type FittingHeightResult } from '@/lib/ar/fitting-height-calculator'
import type { Point3D } from '@/lib/ar/face-math'

/**
 * Hook for stable fitting height measurement.
 * Uses a sample buffer — stabilizes when stddev < 0.8mm over 10+ samples.
 */
export function useFittingHeight(options?: {
  frameMetadata?: { lens_height_mm?: number }
  maxSamples?: number
}) {
  const { frameMetadata, maxSamples = 15 } = options ?? {}

  const [currentReading, setCurrentReading] = useState<FittingHeightResult | null>(null)
  const [stableReading, setStableReading] = useState<FittingHeightResult | null>(null)
  const [isStable, setIsStable] = useState(false)
  const [sampleCount, setSampleCount] = useState(0)

  const samplesRef = useRef<number[]>([])

  const processSample = useCallback((landmarks: Point3D[]) => {
    const result = calculateFittingHeight(landmarks, frameMetadata)
    if (!result) return

    setCurrentReading(result)

    samplesRef.current.push(result.value)
    if (samplesRef.current.length > maxSamples) samplesRef.current.shift()
    setSampleCount(samplesRef.current.length)

    // Check stability: 10+ samples with stddev < 0.8mm
    if (samplesRef.current.length >= 10) {
      const values = samplesRef.current
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length
      const stddev = Math.sqrt(variance)

      if (stddev < 0.8) {
        setIsStable(true)
        setStableReading({
          ...result,
          value: Math.round(mean * 10) / 10,
        })
      }
    }
  }, [frameMetadata, maxSamples])

  const reset = useCallback(() => {
    samplesRef.current = []
    setCurrentReading(null)
    setStableReading(null)
    setIsStable(false)
    setSampleCount(0)
  }, [])

  return { currentReading, stableReading, isStable, sampleCount, processSample, reset }
}
