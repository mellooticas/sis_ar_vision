'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useCamera } from '@/hooks/useCamera'
import { useFaceLandmarker } from '@/hooks/useFaceLandmarker'
import { useGlassesAlignment } from '@/hooks/useGlassesAlignment'
import { useDepthEstimation } from '@/hooks/useDepthEstimation'
import { useCapture } from '@/hooks/useCapture'
import { useARStore } from '@/store/ar-store'
import { CameraFeed } from './CameraFeed'
import { GlassesOverlay } from './GlassesOverlay'
import { LensTintSelector } from './LensTintSelector'
import { PermissionPrompt } from './PermissionPrompt'
import { QualityIndicator } from './QualityIndicator'
import { CaptureButton } from './CaptureButton'
import { CaptureGallery } from './CaptureGallery'
import { cn } from '@/lib/utils'
import { FlipHorizontal2, X, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LENS_TINTS } from '@/types/lens-demo'

interface ARSceneProps {
  className?: string
  onClose?: () => void
}

function isARSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!(navigator.mediaDevices?.getUserMedia) && typeof WebAssembly === 'object'
}

/**
 * Orchestrator component: camera + face tracker + 3D overlay + UI controls.
 */
export function ARScene({ className, onClose }: ARSceneProps) {
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [supported] = useState(() => typeof window !== 'undefined' ? isARSupported() : true)
  const [showTintPanel, setShowTintPanel] = useState(false)
  const { videoRef, isReady: cameraReady, error: cameraError, start, stop, switchCamera, facingMode } = useCamera()
  const { result, fps, startDetection, stopDetection, isLoading: landmarkerLoading } = useFaceLandmarker()

  // Canvas ref for composite capture
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Capture system
  const { captures, isCapturing, capturePhoto, removeCapture } = useCapture()

  const selectedGlassesModelUrl = useARStore((s) => s.selectedGlassesModelUrl)
  const lensTint = useARStore((s) => s.lensTint)
  const frameWidthMm = useARStore((s) => s.frameWidthMm)
  const setLensTint = useARStore((s) => s.setLensTint)
  const setFaceDetected = useARStore((s) => s.setFaceDetected)
  const setFps = useARStore((s) => s.setFps)
  const setLandmarks = useARStore((s) => s.setLandmarks)
  const setCameraReady = useARStore((s) => s.setCameraReady)

  // Video dimensions for transform calculation
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 })

  // Depth estimation from iris
  const depthEstimate = useDepthEstimation(
    result?.landmarks ?? null,
    videoDimensions.width,
  )

  // Compute glasses transform from landmarks with calibration
  const glassesTransform = useGlassesAlignment({
    landmarks: result?.landmarks ?? null,
    facialTransformationMatrix: result?.facialTransformationMatrix,
    videoWidth: videoDimensions.width,
    videoHeight: videoDimensions.height,
    estimatedDepthMm: depthEstimate?.depthMm ?? null,
    frameWidthMm,
  })

  // Sync AR store
  useEffect(() => {
    setFaceDetected(!!result)
    setFps(fps)
    setLandmarks(result?.landmarks ?? null)
  }, [result, fps, setFaceDetected, setFps, setLandmarks])

  useEffect(() => {
    setCameraReady(cameraReady)
  }, [cameraReady, setCameraReady])

  // Start face detection when camera is ready
  useEffect(() => {
    if (cameraReady && videoRef.current) {
      const video = videoRef.current
      setVideoDimensions({ width: video.videoWidth, height: video.videoHeight })
      startDetection(video)
    }
    return () => stopDetection()
  }, [cameraReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAllow = useCallback(() => {
    setPermissionGranted(true)
    start()
  }, [start])

  const handleClose = useCallback(() => {
    stop()
    stopDetection()
    useARStore.getState().reset()
    onClose?.()
  }, [stop, stopDetection, onClose])

  const handleCapture = useCallback(() => {
    if (!videoRef.current) return
    capturePhoto(videoRef.current, threeCanvasRef.current, null, undefined)
  }, [capturePhoto, videoRef])

  // Unsupported browser fallback
  if (!supported) {
    return (
      <div className={cn('flex items-center justify-center bg-black rounded-xl min-h-100 p-8', className)}>
        <div className="text-center text-white max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <X className="h-8 w-8 text-white/60" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Navegador nao suportado</h3>
          <p className="text-sm text-white/70">
            Seu navegador nao suporta a prova virtual. Use Chrome, Safari ou Edge na versao mais recente.
          </p>
        </div>
      </div>
    )
  }

  if (!permissionGranted) {
    return (
      <div className={cn('flex items-center justify-center bg-black rounded-xl min-h-100', className)}>
        <PermissionPrompt onAllow={handleAllow} error={cameraError} />
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-black', className)}>
      {/* Camera feed */}
      <CameraFeed
        ref={videoRef}
        mirrored={facingMode === 'user'}
        className="h-full w-full"
      />

      {/* 3D Glasses overlay */}
      <GlassesOverlay
        ref={threeCanvasRef}
        modelUrl={selectedGlassesModelUrl}
        transform={glassesTransform}
        lensTint={lensTint ? { color: lensTint.color, opacity: lensTint.opacity, mirror: lensTint.mirror } : null}
        className="absolute inset-0"
      />

      {/* Top bar: quality indicator + close */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <QualityIndicator
          faceDetected={!!result}
          fps={fps}
        />
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Lens tint panel (slide-in from right) */}
      {showTintPanel && selectedGlassesModelUrl && (
        <div className="absolute top-14 right-3 w-48 rounded-xl bg-black/80 backdrop-blur-sm p-3 z-10">
          <LensTintSelector
            selected={lensTint ?? LENS_TINTS[0]}
            onSelect={(tint) => setLensTint(tint.opacity > 0 ? tint : null)}
          />
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={switchCamera}
          className="text-white hover:bg-white/20"
        >
          <FlipHorizontal2 className="mr-1.5 h-4 w-4" />
          Trocar Camera
        </Button>

        {/* Lens tint toggle */}
        {selectedGlassesModelUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTintPanel((v) => !v)}
            className={cn('text-white hover:bg-white/20', showTintPanel && 'bg-white/20')}
          >
            <Palette className="mr-1.5 h-4 w-4" />
            Lente
          </Button>
        )}

        {/* Capture button — only visible when glasses are active */}
        {selectedGlassesModelUrl && (
          <CaptureButton
            onClick={handleCapture}
            disabled={!cameraReady || !result}
            isCapturing={isCapturing}
          />
        )}
      </div>

      {/* Capture gallery strip */}
      {captures.length > 0 && (
        <div className="absolute bottom-20 left-3 right-3">
          <CaptureGallery captures={captures} onRemove={removeCapture} />
        </div>
      )}

      {/* Loading overlay */}
      {landmarkerLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <p className="text-sm">Carregando modelo de deteccao...</p>
          </div>
        </div>
      )}

      {/* No face hint */}
      {cameraReady && !result && !landmarkerLoading && (
        <div className="absolute bottom-16 left-0 right-0 text-center">
          <span className="inline-block rounded-full bg-black/60 px-4 py-2 text-xs text-white">
            Posicione seu rosto no centro da tela
          </span>
        </div>
      )}
    </div>
  )
}
