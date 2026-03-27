/**
 * Head pose extraction from MediaPipe's 4x4 facial transformation matrix.
 *
 * Extracts yaw, pitch, and roll as Euler angles (XYZ order).
 * Used for PD yaw correction and measurement validation.
 */

export interface HeadPose {
  /** Yaw (left-right rotation) in radians */
  yaw: number
  /** Pitch (up-down tilt) in radians */
  pitch: number
  /** Roll (sideways tilt) in radians */
  roll: number
  /** Yaw in degrees */
  yawDeg: number
  /** Pitch in degrees */
  pitchDeg: number
  /** Roll in degrees */
  rollDeg: number
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

const TO_DEG = 180 / Math.PI

/**
 * Extract Euler angles from MediaPipe's 4x4 row-major facial transformation matrix.
 *
 * The matrix layout (row-major):
 *   [r00, r01, r02, tx,
 *    r10, r11, r12, ty,
 *    r20, r21, r22, tz,
 *      0,   0,   0,  1]
 *
 * Euler extraction order: XYZ (pitch, yaw, roll).
 */
export function extractHeadPose(matrix: number[]): HeadPose | null {
  if (!matrix || matrix.length < 16) return null

  const r00 = matrix[0]
  const r10 = matrix[4]
  const r11 = matrix[5]
  const r12 = matrix[6]
  const r20 = matrix[8]
  const r21 = matrix[9]
  const r22 = matrix[10]

  // Yaw = asin(-r20)
  const yaw = Math.asin(-clamp(r20, -1, 1))

  let pitch: number
  let roll: number

  if (Math.abs(r20) < 0.9999) {
    pitch = Math.atan2(r21, r22)
    roll = Math.atan2(r10, r00)
  } else {
    // Gimbal lock
    pitch = Math.atan2(-r12, r11)
    roll = 0
  }

  return {
    yaw,
    pitch,
    roll,
    yawDeg: yaw * TO_DEG,
    pitchDeg: pitch * TO_DEG,
    rollDeg: roll * TO_DEG,
  }
}
