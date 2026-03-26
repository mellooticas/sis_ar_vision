import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

export interface FaceLandmarks {
  landmarks: NormalizedLandmark[]
  facialTransformationMatrix: number[] | null
  timestamp: number
}

export interface GlassesTransform {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export interface PDMeasurement {
  value: number
  mode: 'iris' | 'card'
  confidence: number
  samples: number[]
  timestamp: number
}

export interface CameraState {
  stream: MediaStream | null
  isReady: boolean
  facingMode: 'user' | 'environment'
  error: string | null
}

export interface ARSessionStats {
  fps: number
  faceDetected: boolean
  lightQuality: 'good' | 'fair' | 'poor'
  distance: 'close' | 'optimal' | 'far'
}
