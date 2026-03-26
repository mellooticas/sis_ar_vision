/**
 * fitting-height-calculator.ts — Automatic fitting height measurement
 *
 * Fitting height = distance from pupil center to bottom of lens in mm.
 * This is critical for progressive/multifocal lenses — determines
 * where the reading zone begins.
 *
 * Two methods:
 * 1. Frame-reference: uses lens_height_mm from frame metadata (more accurate)
 * 2. Iris-calibrated: estimates from face landmarks (fallback)
 */

import {
  type Point3D,
  distance2D,
  midpoint,
  estimateIrisDiameter,
  LEFT_IRIS_CENTER,
  RIGHT_IRIS_CENTER,
  LEFT_IRIS_POINTS,
  RIGHT_IRIS_POINTS,
  FACE_OVAL_BOTTOM,
  AVERAGE_IRIS_DIAMETER_MM,
} from './face-math'

export interface FittingHeightResult {
  value: number
  leftEye: number
  rightEye: number
  confidence: number
  method: 'iris-calibrated' | 'frame-reference'
}

/** Fitting height valid range in mm */
const FH_MIN = 14
const FH_MAX = 30

/** Ratio of pupil position from bottom of lens (standard optical assumption) */
const PUPIL_POSITION_RATIO = 0.55

/** Empirical factor: fitting height ≈ 35% of pupil-to-chin distance */
const CHIN_FACTOR = 0.35

/**
 * Calculate fitting height from MediaPipe landmarks.
 *
 * @param landmarks - 478 MediaPipe face landmarks
 * @param frameMetadata - Optional frame dimensions for higher accuracy
 */
export function calculateFittingHeight(
  landmarks: Point3D[],
  frameMetadata?: { lens_height_mm?: number },
): FittingHeightResult | null {
  if (landmarks.length < 478) return null

  const leftIris = landmarks[LEFT_IRIS_CENTER]
  const rightIris = landmarks[RIGHT_IRIS_CENTER]

  // Calibrate pixels to mm via iris diameter
  const leftIrisPoints = LEFT_IRIS_POINTS.map((i) => landmarks[i])
  const rightIrisPoints = RIGHT_IRIS_POINTS.map((i) => landmarks[i])
  const leftDiamPx = estimateIrisDiameter(leftIrisPoints)
  const rightDiamPx = estimateIrisDiameter(rightIrisPoints)
  if (leftDiamPx === 0 || rightDiamPx === 0) return null

  const avgIrisDiamPx = (leftDiamPx + rightDiamPx) / 2
  const pxPerMm = avgIrisDiamPx / AVERAGE_IRIS_DIAMETER_MM

  // Method 1: Frame reference (if metadata available)
  if (frameMetadata?.lens_height_mm) {
    const fh = frameMetadata.lens_height_mm * PUPIL_POSITION_RATIO
    const clamped = Math.max(FH_MIN, Math.min(FH_MAX, fh))
    return {
      value: Math.round(clamped * 10) / 10,
      leftEye: Math.round(clamped * 10) / 10,
      rightEye: Math.round(clamped * 10) / 10,
      confidence: 0.80,
      method: 'frame-reference',
    }
  }

  // Method 2: Iris-calibrated estimation
  const chinPoint = landmarks[FACE_OVAL_BOTTOM]
  const pupilCenter = midpoint(leftIris, rightIris)

  const pupilToChinPx = distance2D(pupilCenter, chinPoint)
  const pupilToChinMm = pupilToChinPx / pxPerMm

  const estimatedFH = pupilToChinMm * CHIN_FACTOR
  const clamped = Math.max(FH_MIN, Math.min(FH_MAX, estimatedFH))

  // Per-eye values
  const leftFH = distance2D(leftIris, chinPoint) / pxPerMm * CHIN_FACTOR
  const rightFH = distance2D(rightIris, chinPoint) / pxPerMm * CHIN_FACTOR

  // Confidence based on iris symmetry
  const irisSymmetry = Math.min(leftDiamPx, rightDiamPx) / Math.max(leftDiamPx, rightDiamPx)

  return {
    value: Math.round(clamped * 10) / 10,
    leftEye: Math.round(Math.max(FH_MIN, Math.min(FH_MAX, leftFH)) * 10) / 10,
    rightEye: Math.round(Math.max(FH_MIN, Math.min(FH_MAX, rightFH)) * 10) / 10,
    confidence: Math.min(irisSymmetry * 0.75, 0.85),
    method: 'iris-calibrated',
  }
}
