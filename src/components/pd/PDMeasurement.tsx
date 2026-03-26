'use client'

import { useCallback, useEffect, useState } from 'react'
import { useCamera } from '@/hooks/useCamera'
import { useFaceLandmarker } from '@/hooks/useFaceLandmarker'
import { usePupillaryDistance } from '@/hooks/usePupillaryDistance'
import { CameraFeed } from '@/components/ar/CameraFeed'
import { PermissionPrompt } from '@/components/ar/PermissionPrompt'
import { QualityIndicator } from '@/components/ar/QualityIndicator'
import { PDResult } from './PDResult'
import { FaceSilhouette } from './FaceSilhouette'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Pause, Play } from 'lucide-react'
import type { PDResult as PDResultType } from '@/lib/ar/pd-calculator'

interface PDMeasurementProps {
  mode?: 'iris' | 'card'
  onComplete?: (result: PDResultType) => void
  className?: string
}

export function PDMeasurement({ mode = 'iris', onComplete, className }: PDMeasurementProps) {
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [measuring, setMeasuring] = useState(false)
  const [finalResult, setFinalResult] = useState<PDResultType | null>(null)

  const { videoRef, isReady: cameraReady, error: cameraError, start, stop } = useCamera()
  const { result: faceResult, fps, startDetection, stopDetection, isLoading } = useFaceLandmarker()
  const { currentReading, stableReading, isStable, sampleCount, processSample, reset: resetPD } = usePupillaryDistance({ mode })

  // Process landmarks for PD when measuring
  useEffect(() => {
    if (measuring && faceResult?.landmarks) {
      processSample(faceResult.landmarks)
    }
  }, [measuring, faceResult, processSample])

  // Auto-capture when stable
  useEffect(() => {
    if (measuring && isStable && stableReading) {
      setMeasuring(false)
      setFinalResult(stableReading)
    }
  }, [measuring, isStable, stableReading])

  // Start face detection when camera is ready
  useEffect(() => {
    if (cameraReady && videoRef.current) {
      startDetection(videoRef.current)
    }
    return () => stopDetection()
  }, [cameraReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAllow = useCallback(() => {
    setPermissionGranted(true)
    start()
  }, [start])

  const handleStartMeasuring = useCallback(() => {
    resetPD()
    setFinalResult(null)
    setMeasuring(true)
  }, [resetPD])

  const handleRetry = useCallback(() => {
    setFinalResult(null)
    resetPD()
    setMeasuring(true)
  }, [resetPD])

  const handleAccept = useCallback((value: number) => {
    if (finalResult) {
      onComplete?.(finalResult)
    }
  }, [finalResult, onComplete])

  if (!permissionGranted) {
    return (
      <div className={cn('flex items-center justify-center bg-black rounded-xl min-h-100', className)}>
        <PermissionPrompt onAllow={handleAllow} error={cameraError} />
      </div>
    )
  }

  // Show result
  if (finalResult) {
    return (
      <div className={cn('space-y-4', className)}>
        <PDResult
          result={finalResult}
          onRetry={handleRetry}
          onAccept={handleAccept}
        />
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Camera view */}
      <div className="relative overflow-hidden rounded-xl bg-black aspect-[4/3]">
        <CameraFeed ref={videoRef} mirrored className="h-full w-full" />

        {/* Face silhouette guide — always visible when camera is on */}
        {cameraReady && !isLoading && (
          <FaceSilhouette
            aligned={!!faceResult}
            measuring={measuring}
          />
        )}

        {/* Top overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <QualityIndicator faceDetected={!!faceResult} fps={fps} />
          {measuring && (
            <span className="text-xs text-white/80 bg-black/50 rounded-full px-3 py-1">
              {sampleCount}/15 amostras
            </span>
          )}
        </div>

        {/* Current reading overlay */}
        {measuring && currentReading && (
          <div className="absolute bottom-12 left-0 right-0 text-center">
            <span className="inline-block bg-black/70 rounded-lg px-4 py-2 text-white font-mono text-lg">
              {currentReading.value} mm
            </span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <p className="text-sm">Carregando modelo...</p>
            </div>
          </div>
        )}

        {/* Hint when not measuring */}
        {cameraReady && !measuring && !isLoading && (
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="inline-block rounded-full bg-black/60 px-4 py-2 text-xs text-white">
              Encaixe seu rosto na silhueta e clique em Medir
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={measuring ? () => setMeasuring(false) : handleStartMeasuring}
          disabled={!cameraReady || !faceResult}
        >
          {measuring ? (
            <>
              <Pause className="mr-2 h-4 w-4" /> Parar
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Medir PD
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
