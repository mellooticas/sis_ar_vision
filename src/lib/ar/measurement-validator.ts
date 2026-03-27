/**
 * Advanced measurement buffer with outlier rejection,
 * confidence weighting, and stability window enforcement.
 *
 * Replaces the simple PDSampleBuffer for higher-precision measurements.
 */

export interface MeasurementSample {
  value: number
  confidence: number
  timestamp: number
}

export interface StabilizedResult {
  /** Confidence-weighted mean */
  value: number
  /** Average confidence of accepted samples */
  confidence: number
  /** Standard deviation */
  stddev: number
  /** Number of accepted samples in buffer */
  sampleCount: number
  /** True when stability criteria are met */
  isStable: boolean
  /** 0-100 score: higher = more repeatable */
  repeatabilityScore: number
}

export class StabilizedMeasurementBuffer {
  private samples: MeasurementSample[] = []
  private maxSamples: number
  private outlierThreshold: number
  private stabilityWindow: number
  private maxStddev: number
  private consecutiveStableFrames = 0

  constructor(options?: {
    maxSamples?: number
    /** Reject samples beyond this many stddevs from mean (default 2.0) */
    outlierThreshold?: number
    /** Consecutive stable frames required (default 5) */
    stabilityWindow?: number
    /** Max stddev to consider stable (default 1.0) */
    maxStddev?: number
  }) {
    this.maxSamples = options?.maxSamples ?? 20
    this.outlierThreshold = options?.outlierThreshold ?? 2.0
    this.stabilityWindow = options?.stabilityWindow ?? 5
    this.maxStddev = options?.maxStddev ?? 1.0
  }

  add(value: number, confidence: number = 1.0): void {
    // Outlier rejection: if we have enough samples, reject values >N stddev from mean
    if (this.samples.length >= 5) {
      const stats = this.computeStats()
      if (stats && Math.abs(value - stats.value) > this.outlierThreshold * stats.stddev) {
        return // reject outlier
      }
    }

    this.samples.push({
      value,
      confidence,
      timestamp: performance.now(),
    })

    if (this.samples.length > this.maxSamples) {
      this.samples.shift()
    }

    // Track consecutive stability
    const currentStats = this.computeStats()
    if (currentStats && currentStats.stddev < this.maxStddev) {
      this.consecutiveStableFrames++
    } else {
      this.consecutiveStableFrames = 0
    }
  }

  computeStats(): StabilizedResult | null {
    if (this.samples.length < 3) return null

    // Confidence-weighted average
    const totalWeight = this.samples.reduce((sum, s) => sum + s.confidence, 0)
    if (totalWeight === 0) return null

    const weightedMean =
      this.samples.reduce((sum, s) => sum + s.value * s.confidence, 0) / totalWeight

    // Weighted standard deviation
    const variance =
      this.samples.reduce((sum, s) => sum + s.confidence * (s.value - weightedMean) ** 2, 0) /
      totalWeight
    const stddev = Math.sqrt(variance)

    // Stability: N consecutive frames below maxStddev and enough samples
    const isStable = this.consecutiveStableFrames >= this.stabilityWindow && this.samples.length >= 8

    // Repeatability score (0-100)
    const stddevScore = Math.max(0, 100 - stddev * 50) // 0mm = 100, 2mm = 0
    const countScore = Math.min(100, (this.samples.length / this.maxSamples) * 100)
    const repeatabilityScore = Math.round(stddevScore * 0.7 + countScore * 0.3)

    return {
      value: Math.round(weightedMean * 10) / 10,
      confidence: totalWeight / this.samples.length,
      stddev: Math.round(stddev * 100) / 100,
      sampleCount: this.samples.length,
      isStable,
      repeatabilityScore,
    }
  }

  get isStable(): boolean {
    const stats = this.computeStats()
    return stats?.isStable ?? false
  }

  get count(): number {
    return this.samples.length
  }

  reset(): void {
    this.samples = []
    this.consecutiveStableFrames = 0
  }
}
