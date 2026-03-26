import { create } from 'zustand'
import type { FaceShapeResult } from '@/lib/ar/face-shape-classifier'
import type { FittingHeightResult } from '@/lib/ar/fitting-height-calculator'
import type { PDResult } from '@/lib/ar/pd-calculator'
import type { CaptureItem } from '@/lib/ar/capture'

export type ClientStep = 'identify' | 'face-shape' | 'recommendations' | 'try-on' | 'measurements' | 'summary'

interface ClientSessionState {
  // Patient
  patientId: string | null
  patientName: string | null

  // Flow
  currentStep: ClientStep
  completedSteps: ClientStep[]

  // Results
  faceShape: FaceShapeResult | null
  pdResult: PDResult | null
  fittingHeight: FittingHeightResult | null
  captures: CaptureItem[]
  selectedFrameId: string | null

  // Actions
  setPatient: (id: string, name: string) => void
  setStep: (step: ClientStep) => void
  completeStep: (step: ClientStep) => void
  setFaceShape: (shape: FaceShapeResult) => void
  setPdResult: (pd: PDResult) => void
  setFittingHeight: (fh: FittingHeightResult) => void
  addCapture: (capture: CaptureItem) => void
  setSelectedFrame: (id: string | null) => void
  reset: () => void
}

const initialState = {
  patientId: null as string | null,
  patientName: null as string | null,
  currentStep: 'identify' as ClientStep,
  completedSteps: [] as ClientStep[],
  faceShape: null as FaceShapeResult | null,
  pdResult: null as PDResult | null,
  fittingHeight: null as FittingHeightResult | null,
  captures: [] as CaptureItem[],
  selectedFrameId: null as string | null,
}

export const useClientSessionStore = create<ClientSessionState>((set) => ({
  ...initialState,

  setPatient: (id, name) => set({ patientId: id, patientName: name }),
  setStep: (step) => set({ currentStep: step }),
  completeStep: (step) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step],
    })),
  setFaceShape: (shape) => set({ faceShape: shape }),
  setPdResult: (pd) => set({ pdResult: pd }),
  setFittingHeight: (fh) => set({ fittingHeight: fh }),
  addCapture: (capture) => set((state) => ({ captures: [...state.captures, capture] })),
  setSelectedFrame: (id) => set({ selectedFrameId: id }),
  reset: () => set(initialState),
}))
