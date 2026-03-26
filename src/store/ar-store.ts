import { create } from 'zustand'
import type { GlassesTransform, PDMeasurement } from '@/types/ar'

interface ARState {
  // Camera
  cameraReady: boolean
  facingMode: 'user' | 'environment'

  // Face tracking
  isTracking: boolean
  faceDetected: boolean
  fps: number
  landmarks: Array<{ x: number; y: number; z: number }> | null
  glassesTransform: GlassesTransform | null

  // Glasses
  selectedGlassesId: string | null
  selectedGlassesModelUrl: string | null

  // PD Measurement
  pdMeasurement: PDMeasurement | null
  pdMode: 'iris' | 'card'

  // Actions
  setCameraReady: (ready: boolean) => void
  setFacingMode: (mode: 'user' | 'environment') => void
  setTracking: (tracking: boolean) => void
  setFaceDetected: (detected: boolean) => void
  setFps: (fps: number) => void
  setLandmarks: (landmarks: Array<{ x: number; y: number; z: number }> | null) => void
  setGlassesTransform: (transform: GlassesTransform | null) => void
  setSelectedGlasses: (id: string | null, modelUrl: string | null) => void
  setPdMeasurement: (measurement: PDMeasurement | null) => void
  setPdMode: (mode: 'iris' | 'card') => void
  reset: () => void
}

const initialState = {
  cameraReady: false,
  facingMode: 'user' as const,
  isTracking: false,
  faceDetected: false,
  fps: 0,
  landmarks: null,
  glassesTransform: null,
  selectedGlassesId: null,
  selectedGlassesModelUrl: null,
  pdMeasurement: null,
  pdMode: 'iris' as const,
}

export const useARStore = create<ARState>((set) => ({
  ...initialState,

  setCameraReady: (ready) => set({ cameraReady: ready }),
  setFacingMode: (mode) => set({ facingMode: mode }),
  setTracking: (tracking) => set({ isTracking: tracking }),
  setFaceDetected: (detected) => set({ faceDetected: detected }),
  setFps: (fps) => set({ fps }),
  setLandmarks: (landmarks) => set({ landmarks }),
  setGlassesTransform: (transform) => set({ glassesTransform: transform }),
  setSelectedGlasses: (id, modelUrl) => set({ selectedGlassesId: id, selectedGlassesModelUrl: modelUrl }),
  setPdMeasurement: (measurement) => set({ pdMeasurement: measurement }),
  setPdMode: (mode) => set({ pdMode: mode }),
  reset: () => set(initialState),
}))
