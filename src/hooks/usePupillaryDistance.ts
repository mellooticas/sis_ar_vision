'use client'

import { useCallback, useRef, useState } from 'react'
import {
  calculatePDByIris,
  calculatePDByIrisCorrected,
  calculatePDByCard,
  type PDResult,
} from '@/lib/ar/pd-calculator'
import { StabilizedMeasurementBuffer } from '@/lib/ar/measurement-validator'

interface UsePupillaryDistanceOptions {
  mode?: 'iris' | 'card'
  /** Card width in pixels (required for card mode) */
  cardWidthPx?: number
  /** Number of samples for averaging (default: 20) */
  sampleCount?: number
  /** Use yaw-corrected iris mode when matrix is available (default: true) */
  useCorrectedMode?: boolean
}

interface UsePupillaryDistanceReturn {
  /** Current instantaneous reading */
  currentReading: PDResult | null
  /** Averaged stable reading */
  stableReading: PDResult | null
  /** Whether the reading has stabilized */
  isStable: boolean
  /** Number of samples collected */
  sampleCount: number
  /** Repeatability score 0-100 */
  repeatabilityScore: number
  /** Process a new frame of landmarks */
  processSample: (
    landmarks: Array<{ x: number; y: number; z: number }>,
    facialTransformationMatrix?: number[] | null,
  ) => void
  /** Reset all samples */
  reset: () => void
}

export function usePupillaryDistance(
  options: UsePupillaryDistanceOptions = {},
): UsePupillaryDistanceReturn {
  const { mode = 'iris', cardWidthPx = 0, sampleCount = 20, useCorrectedMode = true } = options

  const [currentReading, setCurrentReading] = useState<PDResult | null>(null)
  const [stableReading, setStableReading] = useState<PDResult | null>(null)
  const [isStable, setIsStable] = useState(false)
  const [repeatabilityScore, setRepeatabilityScore] = useState(0)

  const bufferRef = useRef(
    new StabilizedMeasurementBuffer({
      maxSamples: sampleCount,
      outlierThreshold: 2.0,
      stabilityWindow: 5,
      maxStddev: 1.0,
    }),
  )
  const leftBufferRef = useRef(
    new StabilizedMeasurementBuffer({ maxSamples: sampleCount, maxStddev: 1.5 }),
  )
  const rightBufferRef = useRef(
    new StabilizedMeasurementBuffer({ maxSamples: sampleCount, maxStddev: 1.5 }),
  )

  const processSample = useCallback(
    (
      landmarks: Array<{ x: number; y: number; z: number }>,
      facialTransformationMatrix?: number[] | null,
    ) => {
      let result: PDResult | null = null

      if (mode === 'iris') {
        // Use yaw-corrected mode when matrix is available
        if (useCorrectedMode && facialTransformationMatrix) {
          result = calculatePDByIrisCorrected(landmarks, facialTransformationMatrix)
        }
        // Fallback to uncorrected if corrected returned null (head too rotated)
        if (!result) {
          result = calculatePDByIris(landmarks)
        }
      } else if (mode === 'card' && cardWidthPx > 0) {
        result = calculatePDByCard(landmarks, cardWidthPx)
      }

      if (!result) return

      setCurrentReading(result)
      bufferRef.current.add(result.value, result.confidence)

      if (result.leftPD) leftBufferRef.current.add(result.leftPD, result.confidence)
      if (result.rightPD) rightBufferRef.current.add(result.rightPD, result.confidence)

      const stats = bufferRef.current.computeStats()
      const stable = stats?.isStable ?? false
      setIsStable(stable)
      setRepeatabilityScore(stats?.repeatabilityScore ?? 0)

      if (stable && stats) {
        const leftStats = leftBufferRef.current.computeStats()
        const rightStats = rightBufferRef.current.computeStats()

        setStableReading({
          value: stats.value,
          mode: result.mode,
          confidence: stats.confidence,
          leftPD: leftStats?.value ?? null,
          rightPD: rightStats?.value ?? null,
        })
      }
    },
    [mode, cardWidthPx, useCorrectedMode],
  )

  const reset = useCallback(() => {
    bufferRef.current.reset()
    leftBufferRef.current.reset()
    rightBufferRef.current.reset()
    setCurrentReading(null)
    setStableReading(null)
    setIsStable(false)
    setRepeatabilityScore(0)
  }, [])

  return {
    currentReading,
    stableReading,
    isStable,
    sampleCount: bufferRef.current.count,
    repeatabilityScore,
    processSample,
    reset,
  }
}
