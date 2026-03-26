/**
 * pd-calculator.ts — Pupillary Distance calculation algorithms
 *
 * Two modes:
 *   1. Iris estimation: uses average iris diameter (11.7mm) as reference
 *   2. Card calibration: uses a physical reference card (ISO/IEC 7810 = 85.6mm x 53.98mm)
 */

import {
  LEFT_IRIS_CENTER,
  RIGHT_IRIS_CENTER,
  LEFT_IRIS_POINTS,
  RIGHT_IRIS_POINTS,
  AVERAGE_IRIS_DIAMETER_MM,
  PD_MIN_MM,
  PD_MAX_MM,
  distance2D,
  estimateIrisDiameter,
  type Point3D,
} from './face-math'

export interface PDResult {
  value: number
  mode: 'iris' | 'card'
  confidence: number
  leftPD: number | null
  rightPD: number | null
}

/**
 * Calculate PD using iris diameter as reference.
 * Accuracy: +/- 1-2mm
 */
export function calculatePDByIris(landmarks: Point3D[]): PDResult | null {
  if (landmarks.length < 478) return null

  const leftIris = landmarks[LEFT_IRIS_CENTER]
  const rightIris = landmarks[RIGHT_IRIS_CENTER]

  // Calculate iris diameters for pixel-to-mm conversion
  const leftIrisPoints = LEFT_IRIS_POINTS.map(i => landmarks[i])
  const rightIrisPoints = RIGHT_IRIS_POINTS.map(i => landmarks[i])

  const leftDiameterPx = estimateIrisDiameter(leftIrisPoints)
  const rightDiameterPx = estimateIrisDiameter(rightIrisPoints)

  if (leftDiameterPx === 0 || rightDiameterPx === 0) return null

  // Average iris diameter in pixels
  const avgIrisDiameterPx = (leftDiameterPx + rightDiameterPx) / 2

  // Pixels per mm (using known iris diameter)
  const pxPerMm = avgIrisDiameterPx / AVERAGE_IRIS_DIAMETER_MM

  // Distance between iris centers in pixels
  const interPupillaryPx = distance2D(leftIris, rightIris)

  // Convert to mm
  const pdMm = interPupillaryPx / pxPerMm

  // Validate range
  if (pdMm < PD_MIN_MM - 5 || pdMm > PD_MAX_MM + 5) return null

  // Confidence based on how close left/right iris diameters match
  const irisSymmetry = Math.min(leftDiameterPx, rightDiameterPx) / Math.max(leftDiameterPx, rightDiameterPx)
  const confidence = Math.min(irisSymmetry, 0.95)

  // Monocular PD (from nose bridge center, approximated)
  const noseBridgeX = (leftIris.x + rightIris.x) / 2
  const leftPDPx = distance2D(leftIris, { x: noseBridgeX, y: leftIris.y, z: leftIris.z })
  const rightPDPx = distance2D(rightIris, { x: noseBridgeX, y: rightIris.y, z: rightIris.z })

  return {
    value: Math.round(pdMm * 10) / 10,
    mode: 'iris',
    confidence,
    leftPD: Math.round((leftPDPx / pxPerMm) * 10) / 10,
    rightPD: Math.round((rightPDPx / pxPerMm) * 10) / 10,
  }
}

/**
 * Calculate PD using a physical reference card for calibration.
 * Accuracy: +/- 0.5mm
 *
 * @param landmarks - Face landmarks from MediaPipe
 * @param cardWidthPx - Detected card width in pixels
 * @param cardWidthMm - Known card width in mm (default: 85.6mm for ISO card)
 */
export function calculatePDByCard(
  landmarks: Point3D[],
  cardWidthPx: number,
  cardWidthMm: number = 85.6,
): PDResult | null {
  if (landmarks.length < 478) return null
  if (cardWidthPx <= 0) return null

  const leftIris = landmarks[LEFT_IRIS_CENTER]
  const rightIris = landmarks[RIGHT_IRIS_CENTER]

  // Pixels per mm from card reference
  const pxPerMm = cardWidthPx / cardWidthMm

  // Distance between iris centers
  const interPupillaryPx = distance2D(leftIris, rightIris)
  const pdMm = interPupillaryPx / pxPerMm

  if (pdMm < PD_MIN_MM - 5 || pdMm > PD_MAX_MM + 5) return null

  // Higher confidence than iris method
  const confidence = 0.95

  const noseBridgeX = (leftIris.x + rightIris.x) / 2
  const leftPDPx = distance2D(leftIris, { x: noseBridgeX, y: leftIris.y, z: leftIris.z })
  const rightPDPx = distance2D(rightIris, { x: noseBridgeX, y: rightIris.y, z: rightIris.z })

  return {
    value: Math.round(pdMm * 10) / 10,
    mode: 'card',
    confidence,
    leftPD: Math.round((leftPDPx / pxPerMm) * 10) / 10,
    rightPD: Math.round((rightPDPx / pxPerMm) * 10) / 10,
  }
}

/**
 * Running average of PD samples for stable readings.
 */
export class PDSampleBuffer {
  private samples: number[] = []
  private maxSamples: number

  constructor(maxSamples: number = 15) {
    this.maxSamples = maxSamples
  }

  add(value: number): void {
    this.samples.push(value)
    if (this.samples.length > this.maxSamples) {
      this.samples.shift()
    }
  }

  get average(): number | null {
    if (this.samples.length === 0) return null
    const sum = this.samples.reduce((a, b) => a + b, 0)
    return Math.round((sum / this.samples.length) * 10) / 10
  }

  get standardDeviation(): number {
    if (this.samples.length < 2) return Infinity
    const avg = this.average!
    const variance = this.samples.reduce((sum, val) => sum + (val - avg) ** 2, 0) / this.samples.length
    return Math.sqrt(variance)
  }

  get isStable(): boolean {
    return this.samples.length >= 5 && this.standardDeviation < 1.5
  }

  get count(): number {
    return this.samples.length
  }

  reset(): void {
    this.samples = []
  }
}
