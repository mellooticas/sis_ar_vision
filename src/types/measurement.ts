/**
 * Enhanced measurement types for the precision measurement pipeline.
 */

export interface CalibrationState {
  method: 'iris' | 'card' | 'frame-reference'
  /** Pixels per mm at the measurement plane */
  pxPerMm: number
  /** Confidence in the calibration (0-1) */
  confidence: number
  /** Frame width in mm (only for frame-reference method) */
  frameWidthMm?: number
}

export interface EnhancedPDResult {
  /** PD value in mm */
  value: number
  /** Measurement mode */
  mode: 'iris' | 'card' | 'iris-corrected' | 'frame-calibrated'
  /** Confidence in the measurement (0-1) */
  confidence: number
  /** Left eye monocular PD */
  leftPD: number | null
  /** Right eye monocular PD */
  rightPD: number | null
  /** Whether yaw correction was applied */
  yawCorrected: boolean
  /** Head yaw at time of measurement (degrees) */
  yawDeg?: number
  /** Repeatability score 0-100 */
  repeatabilityScore: number
  /** Whether depth cross-validation passed */
  depthValidated: boolean
  /** Calibration state used */
  calibration: CalibrationState
}
