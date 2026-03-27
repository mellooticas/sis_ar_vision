/**
 * glasses-transform.ts — Convert MediaPipe face landmarks to Three.js transform
 *
 * Maps 2D normalized landmark positions to 3D position/rotation/scale
 * for rendering glasses over the face.
 */

import type { GlassesTransform } from '@/types/ar'
import type { CalibrationState } from '@/types/measurement'
import {
  NOSE_BRIDGE_TOP,
  NOSE_BRIDGE_MID,
  LEFT_EYE_OUTER,
  RIGHT_EYE_OUTER,
  FACE_OVAL_TOP,
  FACE_OVAL_BOTTOM,
  distance2D,
  midpoint,
  type Point3D,
} from './face-math'

interface ComputeTransformOptions {
  /** Canvas/video width in pixels */
  videoWidth: number
  /** Canvas/video height in pixels */
  videoHeight: number
  /** Landmarks from MediaPipe (normalized 0-1) */
  landmarks: Point3D[]
  /** Facial transformation matrix from MediaPipe (4x4 row-major) */
  facialTransformationMatrix?: number[] | null
  /** Calibration data for real-size rendering */
  calibration?: CalibrationState | null
  /** Estimated depth from iris in mm (for depth-aware positioning) */
  estimatedDepthMm?: number | null
  /** Frame width in mm from product metadata (e.g., 140 for 54-20-140) */
  frameWidthMm?: number | null
}

/**
 * Computes position, rotation, and scale for a glasses 3D model
 * based on the detected face landmarks.
 */
export function computeGlassesTransform(options: ComputeTransformOptions): GlassesTransform {
  const {
    landmarks,
    videoWidth,
    videoHeight,
    facialTransformationMatrix,
    calibration,
    estimatedDepthMm,
    frameWidthMm,
  } = options

  // Anchor point: nose bridge
  const noseBridgeTop = landmarks[NOSE_BRIDGE_TOP]
  const noseBridgeMid = landmarks[NOSE_BRIDGE_MID]
  const noseBridge = midpoint(noseBridgeTop, noseBridgeMid)

  // Convert normalized coords to centered NDC (-1 to 1)
  const posX = -(noseBridge.x - 0.5) * 2
  const posY = -(noseBridge.y - 0.5) * 2
  const posZ = noseBridge.z * -5 // Depth — move closer/further

  // Scale based on face width (eye outer corners distance)
  const leftEyeOuter = landmarks[LEFT_EYE_OUTER]
  const rightEyeOuter = landmarks[RIGHT_EYE_OUTER]
  const eyeDistance = distance2D(leftEyeOuter, rightEyeOuter)

  // Face height for additional scaling reference
  const faceTop = landmarks[FACE_OVAL_TOP]
  const faceBottom = landmarks[FACE_OVAL_BOTTOM]
  const faceHeight = distance2D(faceTop, faceBottom)

  // Scale factor — use calibrated scale when available, fallback to heuristic
  let baseScale: number

  if (calibration && calibration.pxPerMm > 0 && frameWidthMm && frameWidthMm > 0) {
    // Calibrated: use known frame dimensions for real-size rendering
    // Convert frame width from mm to normalized coords via px_per_mm
    const frameWidthNorm = (frameWidthMm * calibration.pxPerMm) / videoWidth
    // Model assumed to be ~1 unit wide; adjust ratio as needed
    baseScale = frameWidthNorm * 2.0
  } else {
    // Heuristic fallback — magic number calibrated for typical .glb models
    baseScale = eyeDistance * 3.5
  }

  const scaleX = baseScale
  const scaleY = baseScale
  const scaleZ = baseScale

  // Rotation from facial transformation matrix or estimated from landmarks
  let rotX = 0
  let rotY = 0
  let rotZ = 0

  if (facialTransformationMatrix && facialTransformationMatrix.length >= 16) {
    // Extract Euler angles from 4x4 transformation matrix (row-major)
    const m = facialTransformationMatrix
    // Rotation matrix elements
    const r00 = m[0], r01 = m[1], r02 = m[2]
    const r10 = m[4], r11 = m[5], r12 = m[6]
    const r20 = m[8], r21 = m[9], r22 = m[10]

    // Extract Euler angles (XYZ order)
    rotY = Math.asin(-clamp(r20, -1, 1))

    if (Math.abs(r20) < 0.9999) {
      rotX = Math.atan2(r21, r22)
      rotZ = Math.atan2(r10, r00)
    } else {
      rotX = Math.atan2(-r12, r11)
      rotZ = 0
    }
  } else {
    // Fallback: estimate rotation from landmark positions
    // Yaw (left-right head turn)
    const leftDist = Math.abs(noseBridge.x - leftEyeOuter.x)
    const rightDist = Math.abs(noseBridge.x - rightEyeOuter.x)
    rotY = (rightDist - leftDist) * 2

    // Pitch (up-down head tilt) — estimated from nose bridge vs face center
    const faceCenter = midpoint(faceTop, faceBottom)
    rotX = (noseBridge.y - faceCenter.y) * -3

    // Roll (head tilt sideways)
    const eyeMidLine = Math.atan2(
      leftEyeOuter.y - rightEyeOuter.y,
      leftEyeOuter.x - rightEyeOuter.x
    )
    rotZ = -eyeMidLine
  }

  // Depth-aware Z correction: normalize to ~400mm expected distance
  let adjustedPosZ = posZ
  if (estimatedDepthMm && estimatedDepthMm > 0) {
    const EXPECTED_DEPTH_MM = 400
    adjustedPosZ = posZ * (EXPECTED_DEPTH_MM / estimatedDepthMm)
  }

  // Aspect ratio correction
  const aspect = videoWidth / videoHeight

  return {
    position: [posX * aspect, posY, adjustedPosZ],
    rotation: [rotX, rotY, rotZ],
    scale: [scaleX, scaleY, scaleZ],
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
