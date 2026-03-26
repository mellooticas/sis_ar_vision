/**
 * landmark-smoother.ts — One Euro Filter for reducing landmark jitter
 *
 * Based on "1€ Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Interactive Systems"
 * Géry Casiez, Nicolas Roussel, Daniel Vogel — CHI 2012
 *
 * Params:
 *   minCutoff: lower = more smoothing (default 1.0)
 *   beta: higher = less lag when moving fast (default 0.0)
 *   dCutoff: cutoff for derivative filter (default 1.0)
 */

interface OneEuroFilterConfig {
  minCutoff?: number
  beta?: number
  dCutoff?: number
}

function smoothingFactor(te: number, cutoff: number): number {
  const r = 2 * Math.PI * cutoff * te
  return r / (r + 1)
}

function exponentialSmoothing(a: number, x: number, prevX: number): number {
  return a * x + (1 - a) * prevX
}

class OneEuroFilter {
  private minCutoff: number
  private beta: number
  private dCutoff: number
  private xPrev: number | null = null
  private dxPrev: number = 0
  private tPrev: number | null = null

  constructor(config: OneEuroFilterConfig = {}) {
    this.minCutoff = config.minCutoff ?? 1.0
    this.beta = config.beta ?? 0.0
    this.dCutoff = config.dCutoff ?? 1.0
  }

  filter(x: number, t: number): number {
    if (this.tPrev === null || this.xPrev === null) {
      this.xPrev = x
      this.tPrev = t
      this.dxPrev = 0
      return x
    }

    const te = t - this.tPrev
    if (te <= 0) return this.xPrev

    // Derivative
    const aD = smoothingFactor(te, this.dCutoff)
    const dx = (x - this.xPrev) / te
    const dxSmoothed = exponentialSmoothing(aD, dx, this.dxPrev)

    // Adaptive cutoff
    const cutoff = this.minCutoff + this.beta * Math.abs(dxSmoothed)
    const a = smoothingFactor(te, cutoff)
    const xSmoothed = exponentialSmoothing(a, x, this.xPrev)

    this.xPrev = xSmoothed
    this.dxPrev = dxSmoothed
    this.tPrev = t

    return xSmoothed
  }

  reset(): void {
    this.xPrev = null
    this.dxPrev = 0
    this.tPrev = null
  }
}

/**
 * Smoother for a set of 3D landmarks.
 * Creates one OneEuroFilter per coordinate (x, y, z) per landmark.
 */
export class LandmarkSmoother {
  private filters: Map<number, { x: OneEuroFilter; y: OneEuroFilter; z: OneEuroFilter }> = new Map()
  private config: OneEuroFilterConfig

  constructor(config: OneEuroFilterConfig = {}) {
    this.config = {
      minCutoff: config.minCutoff ?? 1.5,
      beta: config.beta ?? 0.01,
      dCutoff: config.dCutoff ?? 1.0,
    }
  }

  smooth(
    landmarks: Array<{ x: number; y: number; z: number }>,
    timestamp: number,
  ): Array<{ x: number; y: number; z: number }> {
    return landmarks.map((lm, i) => {
      if (!this.filters.has(i)) {
        this.filters.set(i, {
          x: new OneEuroFilter(this.config),
          y: new OneEuroFilter(this.config),
          z: new OneEuroFilter(this.config),
        })
      }

      const f = this.filters.get(i)!
      return {
        x: f.x.filter(lm.x, timestamp),
        y: f.y.filter(lm.y, timestamp),
        z: f.z.filter(lm.z, timestamp),
      }
    })
  }

  reset(): void {
    this.filters.clear()
  }
}
