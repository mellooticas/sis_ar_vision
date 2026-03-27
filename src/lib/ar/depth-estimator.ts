/**
 * Iris-based depth estimation and silhouette cross-validation.
 *
 * Uses the known iris diameter (11.7mm) as a reference to estimate
 * the distance from camera to face, then cross-validates against
 * the expected distance when the face fills the silhouette guide.
 */

import {
  estimateIrisDiameter,
  LEFT_IRIS_POINTS,
  RIGHT_IRIS_POINTS,
  AVERAGE_IRIS_DIAMETER_MM,
} from './face-math'
import type { Point3D } from './face-math'

export interface DepthEstimate {
  /** Estimated distance from camera to face in mm */
  depthMm: number
  /** Measured iris diameter in pixels */
  irisDiameterPx: number
  /** Confidence based on iris symmetry (0-1) */
  confidence: number
}

/**
 * Approximate focal length in pixels for typical webcam/phone cameras.
 * For a 640px-wide image with ~60° horizontal FOV:
 *   f_px = width / (2 * tan(FOV/2)) = 640 / (2 * tan(30°)) ≈ 554
 *
 * This is scaled linearly with actual video width.
 */
const REFERENCE_FOCAL_PX = 554
const REFERENCE_WIDTH_PX = 640

/**
 * Estimate face-to-camera distance using iris apparent diameter.
 *
 * Formula: depth_mm = focal_length_px * IRIS_DIAMETER_MM / iris_diameter_px
 *
 * @param landmarks - 478 MediaPipe face landmarks (normalized 0-1)
 * @param videoWidthPx - Width of the video feed in pixels
 * @param focalLengthPx - Optional known focal length in pixels
 */
export function estimateDepthFromIris(
  landmarks: Point3D[],
  videoWidthPx: number = 640,
  focalLengthPx?: number,
): DepthEstimate | null {
  if (landmarks.length < 478) return null

  const leftIrisPoints = LEFT_IRIS_POINTS.map((i) => landmarks[i])
  const rightIrisPoints = RIGHT_IRIS_POINTS.map((i) => landmarks[i])
  const leftDiam = estimateIrisDiameter(leftIrisPoints)
  const rightDiam = estimateIrisDiameter(rightIrisPoints)

  if (leftDiam === 0 || rightDiam === 0) return null

  const avgIrisDiamNorm = (leftDiam + rightDiam) / 2

  // Convert from normalized coordinates to pixel space
  const irisPx = avgIrisDiamNorm * videoWidthPx

  // Scale focal length proportionally to video width
  const fPx = focalLengthPx ?? (videoWidthPx / REFERENCE_WIDTH_PX) * REFERENCE_FOCAL_PX

  const depthMm = (fPx * AVERAGE_IRIS_DIAMETER_MM) / irisPx

  // Confidence: iris symmetry (left vs right should be similar)
  const symmetry = Math.min(leftDiam, rightDiam) / Math.max(leftDiam, rightDiam)

  return {
    depthMm: Math.round(depthMm),
    irisDiameterPx: Math.round(irisPx * 10) / 10,
    confidence: Math.round(symmetry * 100) / 100,
  }
}

/**
 * Expected depth when face fills the PD measurement silhouette guide (~40cm).
 */
const SILHOUETTE_EXPECTED_DEPTH_MM = 400
const DEPTH_TOLERANCE = 0.15 // 15%

/**
 * Cross-validate iris-estimated depth against silhouette-expected depth.
 *
 * If the face is aligned with the silhouette guide, the distance should
 * be approximately 400mm. Divergence >15% suggests inaccurate conditions.
 *
 * @param irisDepthMm - Depth estimated from iris diameter
 * @param silhouetteAligned - Whether the face fills the silhouette guide
 */
export function crossValidateDepth(
  irisDepthMm: number,
  silhouetteAligned: boolean,
): { valid: boolean; divergencePct: number } {
  if (!silhouetteAligned) {
    return { valid: true, divergencePct: 0 } // No cross-validation possible
  }

  const divergencePct =
    Math.round(
      (Math.abs(irisDepthMm - SILHOUETTE_EXPECTED_DEPTH_MM) / SILHOUETTE_EXPECTED_DEPTH_MM) * 100,
    )

  return {
    valid: divergencePct <= DEPTH_TOLERANCE * 100,
    divergencePct,
  }
}
