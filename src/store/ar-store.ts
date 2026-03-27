import { create } from 'zustand'
import type { GlassesTransform, PDMeasurement } from '@/types/ar'
import type { FaceShapeResult } from '@/lib/ar/face-shape-classifier'
import type { FittingHeightResult } from '@/lib/ar/fitting-height-calculator'
import type { LensTint } from '@/types/lens-demo'

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
  lensTint: LensTint | null
  frameWidthMm: number | null

  // PD Measurement
  pdMeasurement: PDMeasurement | null
  pdMode: 'iris' | 'card'

  // Face Shape (Feature 3)
  faceShape: FaceShapeResult | null

  // Fitting Height (Feature 2)
  fittingHeight: FittingHeightResult | null

  // Patient selection (Feature 5)
  selectedPatientId: string | null

  // Comparison (Feature 7)
  comparisonFrameIds: string[]

  // Actions
  setCameraReady: (ready: boolean) => void
  setFacingMode: (mode: 'user' | 'environment') => void
  setTracking: (tracking: boolean) => void
  setFaceDetected: (detected: boolean) => void
  setFps: (fps: number) => void
  setLandmarks: (landmarks: Array<{ x: number; y: number; z: number }> | null) => void
  setGlassesTransform: (transform: GlassesTransform | null) => void
  setSelectedGlasses: (id: string | null, modelUrl: string | null) => void
  setLensTint: (tint: LensTint | null) => void
  setFrameWidthMm: (width: number | null) => void
  setPdMeasurement: (measurement: PDMeasurement | null) => void
  setPdMode: (mode: 'iris' | 'card') => void
  setFaceShape: (shape: FaceShapeResult | null) => void
  setFittingHeight: (fh: FittingHeightResult | null) => void
  setSelectedPatientId: (id: string | null) => void
  setComparisonFrameIds: (ids: string[]) => void
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
  lensTint: null,
  frameWidthMm: null,
  pdMeasurement: null,
  pdMode: 'iris' as const,
  faceShape: null,
  fittingHeight: null,
  selectedPatientId: null,
  comparisonFrameIds: [] as string[],
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
  setLensTint: (tint) => set({ lensTint: tint }),
  setFrameWidthMm: (width) => set({ frameWidthMm: width }),
  setPdMeasurement: (measurement) => set({ pdMeasurement: measurement }),
  setPdMode: (mode) => set({ pdMode: mode }),
  setFaceShape: (shape) => set({ faceShape: shape }),
  setFittingHeight: (fh) => set({ fittingHeight: fh }),
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
  setComparisonFrameIds: (ids) => set({ comparisonFrameIds: ids }),
  reset: () => set(initialState),
}))
