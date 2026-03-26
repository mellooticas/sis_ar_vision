/**
 * face-math.ts — MediaPipe Face Landmarker constants & helpers
 *
 * MediaPipe Face Mesh: 478 landmarks (468 base + 10 iris)
 * Reference: https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
 */

// ---------------------------------------------------------------------------
// Landmark indices
// ---------------------------------------------------------------------------

/** Nose bridge — anchor point for glasses */
export const NOSE_BRIDGE_TOP = 6
export const NOSE_BRIDGE_MID = 197
export const NOSE_BRIDGE_BOTTOM = 195

/** Eye corners — used for glasses width estimation */
export const LEFT_EYE_OUTER = 263
export const LEFT_EYE_INNER = 362
export const RIGHT_EYE_OUTER = 33
export const RIGHT_EYE_INNER = 133

/** Iris centers — used for PD measurement */
export const LEFT_IRIS_CENTER = 473
export const RIGHT_IRIS_CENTER = 468

/** Iris boundary points — used for iris diameter estimation */
export const LEFT_IRIS_POINTS = [474, 475, 476, 477] as const
export const RIGHT_IRIS_POINTS = [469, 470, 471, 472] as const

/** Face oval — used for face size estimation */
export const FACE_OVAL_TOP = 10
export const FACE_OVAL_BOTTOM = 152
export const FACE_OVAL_LEFT = 234
export const FACE_OVAL_RIGHT = 454

/** Forehead — for glasses vertical positioning */
export const FOREHEAD_CENTER = 151

// ---------------------------------------------------------------------------
// Biological constants
// ---------------------------------------------------------------------------

/** Average human iris diameter in mm */
export const AVERAGE_IRIS_DIAMETER_MM = 11.7

/** Average adult interpupillary distance range in mm */
export const PD_MIN_MM = 54
export const PD_MAX_MM = 74
export const PD_AVERAGE_MM = 63

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

export interface Point3D {
  x: number
  y: number
  z: number
}

/** Euclidean distance between two 3D points */
export function distance3D(a: Point3D, b: Point3D): number {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2 +
    (a.z - b.z) ** 2
  )
}

/** Euclidean distance between two 2D points (ignoring z) */
export function distance2D(a: Point3D, b: Point3D): number {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2
  )
}

/** Midpoint between two 3D points */
export function midpoint(a: Point3D, b: Point3D): Point3D {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
  }
}

/** Calculate the average of an array of 3D points */
export function averagePoint(points: Point3D[]): Point3D {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }),
    { x: 0, y: 0, z: 0 }
  )
  const n = points.length
  return { x: sum.x / n, y: sum.y / n, z: sum.z / n }
}

/**
 * Estimate iris diameter in pixel space from 4 boundary landmarks.
 * Returns the average of horizontal and vertical diameters.
 */
export function estimateIrisDiameter(irisPoints: Point3D[]): number {
  if (irisPoints.length < 4) return 0
  const horizontal = distance2D(irisPoints[0], irisPoints[2])
  const vertical = distance2D(irisPoints[1], irisPoints[3])
  return (horizontal + vertical) / 2
}
