'use client'

import { useCallback, useRef, useState } from 'react'
import { calculatePDByIris, calculatePDByCard, PDSampleBuffer, type PDResult } from '@/lib/ar/pd-calculator'

interface UsePupillaryDistanceOptions {
  mode?: 'iris' | 'card'
  /** Card width in pixels (required for card mode) */
  cardWidthPx?: number
  /** Number of samples for averaging (default: 15) */
  sampleCount?: number
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
  /** Process a new frame of landmarks */
  processSample: (landmarks: Array<{ x: number; y: number; z: number }>) => void
  /** Reset all samples */
  reset: () => void
}

export function usePupillaryDistance(options: UsePupillaryDistanceOptions = {}): UsePupillaryDistanceReturn {
  const { mode = 'iris', cardWidthPx = 0, sampleCount = 15 } = options

  const [currentReading, setCurrentReading] = useState<PDResult | null>(null)
  const [stableReading, setStableReading] = useState<PDResult | null>(null)
  const [isStable, setIsStable] = useState(false)

  const bufferRef = useRef(new PDSampleBuffer(sampleCount))
  const leftBufferRef = useRef(new PDSampleBuffer(sampleCount))
  const rightBufferRef = useRef(new PDSampleBuffer(sampleCount))

  const processSample = useCallback((landmarks: Array<{ x: number; y: number; z: number }>) => {
    let result: PDResult | null = null

    if (mode === 'iris') {
      result = calculatePDByIris(landmarks)
    } else if (mode === 'card' && cardWidthPx > 0) {
      result = calculatePDByCard(landmarks, cardWidthPx)
    }

    if (!result) return

    setCurrentReading(result)
    bufferRef.current.add(result.value)

    if (result.leftPD) leftBufferRef.current.add(result.leftPD)
    if (result.rightPD) rightBufferRef.current.add(result.rightPD)

    const stable = bufferRef.current.isStable
    setIsStable(stable)

    if (stable) {
      setStableReading({
        value: bufferRef.current.average!,
        mode: result.mode,
        confidence: result.confidence,
        leftPD: leftBufferRef.current.average,
        rightPD: rightBufferRef.current.average,
      })
    }
  }, [mode, cardWidthPx])

  const reset = useCallback(() => {
    bufferRef.current.reset()
    leftBufferRef.current.reset()
    rightBufferRef.current.reset()
    setCurrentReading(null)
    setStableReading(null)
    setIsStable(false)
  }, [])

  return {
    currentReading,
    stableReading,
    isStable,
    sampleCount: bufferRef.current.count,
    processSample,
    reset,
  }
}
