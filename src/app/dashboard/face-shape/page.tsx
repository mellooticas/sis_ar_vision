'use client'

import { useCallback, useEffect, useState } from 'react'
import { useCamera } from '@/hooks/useCamera'
import { useFaceLandmarker } from '@/hooks/useFaceLandmarker'
import { useFaceShape } from '@/hooks/useFaceShape'
import { CameraFeed } from '@/components/ar/CameraFeed'
import { PermissionPrompt } from '@/components/ar/PermissionPrompt'
import { QualityIndicator } from '@/components/ar/QualityIndicator'
import { FaceShapeCard } from '@/components/ar/FaceShapeCard'
import { FaceSilhouette } from '@/components/pd/FaceSilhouette'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { RotateCcw, ScanFace } from 'lucide-react'

export default function FaceShapePage() {
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const { videoRef, isReady: cameraReady, error: cameraError, start, stop } = useCamera()
  const { result: faceResult, fps, startDetection, stopDetection, isLoading } = useFaceLandmarker()
  const { result: shapeResult, isStable, processSample, reset: resetShape } = useFaceShape()

  // Process landmarks for face shape
  useEffect(() => {
    if (analyzing && faceResult?.landmarks) {
      processSample(faceResult.landmarks)
    }
  }, [analyzing, faceResult, processSample])

  // Auto-stop when stable
  useEffect(() => {
    if (analyzing && isStable) {
      setAnalyzing(false)
    }
  }, [analyzing, isStable])

  // Start face detection when camera ready
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

  const handleStart = useCallback(() => {
    resetShape()
    setAnalyzing(true)
  }, [resetShape])

  const handleRetry = useCallback(() => {
    resetShape()
    setAnalyzing(true)
  }, [resetShape])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formato do Rosto"
        description="Analise automatica por IA para recomendar armacoes ideais"
      />

      {!permissionGranted ? (
        <div className="flex items-center justify-center rounded-xl bg-black min-h-100">
          <PermissionPrompt onAllow={handleAllow} error={cameraError} />
        </div>
      ) : shapeResult && isStable ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Camera preview with silhouette */}
          <div className="relative overflow-hidden rounded-xl bg-black aspect-4/3">
            <CameraFeed ref={videoRef} mirrored className="h-full w-full" />
            <FaceSilhouette aligned={!!faceResult} />
            <div className="absolute top-3 left-3">
              <QualityIndicator faceDetected={!!faceResult} fps={fps} />
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4">
            <FaceShapeCard result={shapeResult} />
            <Button onClick={handleRetry} variant="outline" className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Analisar Novamente
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Camera view */}
          <div className="relative overflow-hidden rounded-xl bg-black aspect-4/3">
            <CameraFeed ref={videoRef} mirrored className="h-full w-full" />

            {cameraReady && !isLoading && (
              <FaceSilhouette aligned={!!faceResult} measuring={analyzing} />
            )}

            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <QualityIndicator faceDetected={!!faceResult} fps={fps} />
              {analyzing && (
                <span className="text-xs text-white/80 bg-black/50 rounded-full px-3 py-1">
                  Analisando...
                </span>
              )}
            </div>

            {/* Current shape preview */}
            {analyzing && shapeResult && (
              <div className="absolute bottom-12 left-0 right-0 text-center">
                <span className="inline-block bg-black/70 rounded-lg px-4 py-2 text-white font-mono text-lg">
                  {shapeResult.shape}
                </span>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <p className="text-sm">Carregando modelo...</p>
                </div>
              </div>
            )}

            {cameraReady && !analyzing && !isLoading && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="inline-block rounded-full bg-black/60 px-4 py-2 text-xs text-white">
                  Encaixe seu rosto na silhueta e clique em Analisar
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={analyzing ? () => setAnalyzing(false) : handleStart}
              disabled={!cameraReady || !faceResult}
            >
              <ScanFace className="mr-2 h-4 w-4" />
              {analyzing ? 'Parar' : 'Analisar Formato'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
