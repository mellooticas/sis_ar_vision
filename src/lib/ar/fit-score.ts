/**
 * fit-score.ts — Face vs Frame fit scoring
 *
 * Compares face width (measured from landmarks 234→454, calibrated by iris)
 * against frame_width_mm from frame metadata.
 *
 * Score 0-100:
 *   95-100 = Perfeito (ratio 0.95-1.05)
 *   70-94  = Aceitavel (ratio 0.88-0.95 or 1.05-1.12)
 *   <70    = Inadequado (outside range)
 */

import {
  type Point3D,
  distance2D,
  estimateIrisDiameter,
  LEFT_IRIS_POINTS,
  RIGHT_IRIS_POINTS,
  AVERAGE_IRIS_DIAMETER_MM,
} from './face-math'

export type FitCategory = 'perfeito' | 'aceitavel' | 'inadequado'

export interface FitScoreResult {
  score: number
  category: FitCategory
  faceWidthMm: number
  frameWidthMm: number
  ratio: number
  recommendation: string
}

/** Cheekbone landmarks: left 234, right 454 */
const CHEEKBONE_LEFT = 234
const CHEEKBONE_RIGHT = 454

/**
 * Calculate fit score between face and frame.
 *
 * @param landmarks - 478 MediaPipe face landmarks
 * @param frameWidthMm - Frame total width in mm (from metadata)
 */
export function calculateFitScore(
  landmarks: Point3D[],
  frameWidthMm: number,
): FitScoreResult | null {
  if (landmarks.length < 478 || frameWidthMm <= 0) return null

  // Measure face width via cheekbones
  const leftCheek = landmarks[CHEEKBONE_LEFT]
  const rightCheek = landmarks[CHEEKBONE_RIGHT]
  const faceWidthPx = distance2D(leftCheek, rightCheek)

  // Calibrate via iris diameter
  const leftIrisPoints = LEFT_IRIS_POINTS.map((i) => landmarks[i])
  const rightIrisPoints = RIGHT_IRIS_POINTS.map((i) => landmarks[i])
  const leftDiamPx = estimateIrisDiameter(leftIrisPoints)
  const rightDiamPx = estimateIrisDiameter(rightIrisPoints)
  if (leftDiamPx === 0 || rightDiamPx === 0) return null

  const avgIrisDiamPx = (leftDiamPx + rightDiamPx) / 2
  const pxPerMm = avgIrisDiamPx / AVERAGE_IRIS_DIAMETER_MM

  const faceWidthMm = faceWidthPx / pxPerMm
  const ratio = faceWidthMm / frameWidthMm

  // Score calculation
  let score: number
  let category: FitCategory
  let recommendation: string

  if (ratio >= 0.95 && ratio <= 1.05) {
    // Perfect fit
    score = 95 + (1 - Math.abs(ratio - 1)) * 100
    score = Math.min(100, Math.round(score))
    category = 'perfeito'
    recommendation = 'Encaixe perfeito! Esta armacao esta proporcional ao seu rosto.'
  } else if (ratio >= 0.88 && ratio < 0.95) {
    // Acceptable — frame slightly wider
    score = 70 + ((ratio - 0.88) / 0.07) * 25
    score = Math.round(score)
    category = 'aceitavel'
    recommendation = 'Armacao um pouco larga. Funciona bem, mas considere um tamanho menor.'
  } else if (ratio > 1.05 && ratio <= 1.12) {
    // Acceptable — frame slightly narrow
    score = 70 + ((1.12 - ratio) / 0.07) * 25
    score = Math.round(score)
    category = 'aceitavel'
    recommendation = 'Armacao um pouco estreita. Funciona bem, mas considere um tamanho maior.'
  } else if (ratio < 0.88) {
    // Too wide
    score = Math.max(10, Math.round(ratio * 80))
    category = 'inadequado'
    recommendation = 'Armacao muito larga para o rosto. Recomendamos um tamanho menor.'
  } else {
    // Too narrow
    score = Math.max(10, Math.round((2 - ratio) * 60))
    category = 'inadequado'
    recommendation = 'Armacao muito estreita para o rosto. Recomendamos um tamanho maior.'
  }

  return {
    score,
    category,
    faceWidthMm: Math.round(faceWidthMm * 10) / 10,
    frameWidthMm,
    ratio: Math.round(ratio * 100) / 100,
    recommendation,
  }
}
