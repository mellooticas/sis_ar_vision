'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LandmarkSmoother } from '@/lib/ar/landmark-smoother'

interface FaceDetectionResult {
  landmarks: Array<{ x: number; y: number; z: number }>
  facialTransformationMatrix: number[] | null
}

interface UseFaceLandmarkerOptions {
  /** Max number of faces to detect (default: 1) */
  maxFaces?: number
  /** Whether to output blend shapes (default: false) */
  outputBlendShapes?: boolean
  /** Whether to output transformation matrix (default: true) */
  outputTransformationMatrix?: boolean
  /** Enable landmark smoothing (default: true) */
  smoothing?: boolean
}

interface UseFaceLandmarkerReturn {
  isLoading: boolean
  isReady: boolean
  error: string | null
  result: FaceDetectionResult | null
  fps: number
  startDetection: (video: HTMLVideoElement) => void
  stopDetection: () => void
}

export function useFaceLandmarker(options: UseFaceLandmarkerOptions = {}): UseFaceLandmarkerReturn {
  const {
    maxFaces = 1,
    outputTransformationMatrix = true,
    smoothing = true,
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FaceDetectionResult | null>(null)
  const [fps, setFps] = useState(0)

  const landmarkerRef = useRef<any>(null)
  const rafRef = useRef<number | null>(null)
  const smoother = useRef(new LandmarkSmoother({ minCutoff: 1.5, beta: 0.01 }))
  const frameCountRef = useRef(0)
  const lastFpsTimeRef = useRef(0)

  // Initialize MediaPipe Face Landmarker
  const initialize = useCallback(async () => {
    if (landmarkerRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      )

      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: maxFaces,
        outputFacialTransformationMatrixes: outputTransformationMatrix,
        outputFaceBlendshapes: false,
      })

      landmarkerRef.current = faceLandmarker
      setIsReady(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(`Erro ao inicializar Face Landmarker: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }, [maxFaces, outputTransformationMatrix])

  // Detection loop
  const startDetection = useCallback((video: HTMLVideoElement) => {
    if (!landmarkerRef.current) {
      initialize().then(() => {
        if (landmarkerRef.current) {
          runLoop(video)
        }
      })
      return
    }
    runLoop(video)

    function runLoop(videoEl: HTMLVideoElement) {
      let lastTimestamp = -1

      const detect = () => {
        if (!landmarkerRef.current || !videoEl || videoEl.paused || videoEl.ended) {
          rafRef.current = requestAnimationFrame(detect)
          return
        }

        const now = performance.now()

        // Only process new frames
        if (videoEl.currentTime !== lastTimestamp) {
          lastTimestamp = videoEl.currentTime

          try {
            const detectionResult = landmarkerRef.current.detectForVideo(videoEl, now)

            if (detectionResult.faceLandmarks && detectionResult.faceLandmarks.length > 0) {
              let landmarks = detectionResult.faceLandmarks[0] as Array<{ x: number; y: number; z: number }>

              if (smoothing) {
                landmarks = smoother.current.smooth(landmarks, now / 1000)
              }

              const matrix = detectionResult.facialTransformationMatrixes?.[0]?.data ?? null

              setResult({
                landmarks,
                facialTransformationMatrix: matrix,
              })
            } else {
              setResult(null)
            }
          } catch {
            // Frame processing error — skip
          }

          // FPS counter
          frameCountRef.current++
          if (now - lastFpsTimeRef.current >= 1000) {
            setFps(frameCountRef.current)
            frameCountRef.current = 0
            lastFpsTimeRef.current = now
          }
        }

        rafRef.current = requestAnimationFrame(detect)
      }

      detect()
    }
  }, [initialize, smoothing])

  const stopDetection = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    setResult(null)
    setFps(0)
    smoother.current.reset()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection()
      if (landmarkerRef.current) {
        landmarkerRef.current.close()
        landmarkerRef.current = null
      }
    }
  }, [stopDetection])

  return {
    isLoading,
    isReady,
    error,
    result,
    fps,
    startDetection,
    stopDetection,
  }
}
