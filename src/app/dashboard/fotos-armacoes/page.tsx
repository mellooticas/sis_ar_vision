'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, ArrowLeft, ChevronRight, Check, Search, ImageIcon, X, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CameraFeed } from '@/components/ar/CameraFeed'
import { CaptureButton } from '@/components/ar/CaptureButton'
import { FrameSilhouette } from '@/components/ar/FrameSilhouette'
import { PermissionPrompt } from '@/components/ar/PermissionPrompt'
import { useCamera } from '@/hooks/useCamera'
import { useFrameCapture } from '@/hooks/useFrameCapture'
import { useProductList } from '@/hooks/use-products'
import {
  FRAME_PHOTO_ANGLES,
  ANGLE_LABELS,
  REQUIRED_ANGLES,
  FRAME_SHAPES,
  FRAME_SHAPE_LABELS,
} from '@/types/frame-photo'
import type { FramePhotoAngle, FrameShapeType } from '@/types/frame-photo'
import type { Product } from '@/types/product'

type PageState = 'select' | 'shape' | 'capture'

export default function FotosArmacoesPage() {
  const [state, setState] = useState<PageState>('select')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedShape, setSelectedShape] = useState<FrameShapeType | null>(null)
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const silhouetteRef = useRef<SVGSVGElement>(null)

  const { data: products = [] } = useProductList()
  const camera = useCamera({ autoStart: false, facingMode: 'environment', width: 1920, height: 1080 })
  const frameCapture = useFrameCapture()

  const currentAngle = FRAME_PHOTO_ANGLES[currentAngleIndex]
  const isRequired = REQUIRED_ANGLES.includes(currentAngle)

  // Filter products by search
  const filteredProducts = products.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q)
    )
  })

  const handleSelectProduct = useCallback((product: Product) => {
    setSelectedProduct(product)
    setCurrentAngleIndex(0)
    frameCapture.resetPhotos()
    setState('shape')
  }, [frameCapture])

  const handleSelectShape = useCallback((shape: FrameShapeType) => {
    setSelectedShape(shape)
    setState('capture')
  }, [])

  const handleSkipShape = useCallback(() => {
    setSelectedShape(null)
    setState('capture')
  }, [])

  const handleAllowCamera = useCallback(async () => {
    try {
      await camera.start()
      setPermissionGranted(true)
      setCameraError(null)
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : 'Erro ao acessar camera')
    }
  }, [camera])

  const handleCapture = useCallback(async () => {
    if (!videoRef.current) return

    const svgEl = silhouetteRef.current?.closest('svg') as SVGSVGElement | null
    await frameCapture.captureFramePhoto(videoRef.current, currentAngle, svgEl)

    // Auto-advance to next angle
    if (currentAngleIndex < FRAME_PHOTO_ANGLES.length - 1) {
      setCurrentAngleIndex((i) => i + 1)
    }

    toast.success(`Foto ${ANGLE_LABELS[currentAngle]} capturada`)
  }, [frameCapture, currentAngle, currentAngleIndex])

  const handleFinish = useCallback(async () => {
    if (!selectedProduct) return

    try {
      await frameCapture.uploadFramePhotos(selectedProduct.id, selectedShape)
      toast.success(`${frameCapture.photos.length} fotos salvas para ${selectedProduct.name}`)
      camera.stop()
      setPermissionGranted(false)
      frameCapture.resetPhotos()
      setState('select')
      setSelectedProduct(null)
      setSelectedShape(null)
    } catch {
      toast.error('Erro ao fazer upload das fotos. Verifique se o bucket existe no Supabase.')
    }
  }, [selectedProduct, frameCapture, camera, selectedShape])

  const handleBack = useCallback(() => {
    if (state === 'capture') {
      camera.stop()
      setPermissionGranted(false)
      frameCapture.resetPhotos()
      setState('shape')
      return
    }
    if (state === 'shape') {
      setState('select')
      setSelectedProduct(null)
      return
    }
    camera.stop()
    setPermissionGranted(false)
    frameCapture.resetPhotos()
    setState('select')
    setSelectedProduct(null)
    setSelectedShape(null)
  }, [camera, frameCapture, state])

  // ── Product selection state ──
  if (state === 'select') {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Fotos Padronizadas</h1>
            <p className="text-sm text-muted-foreground">
              Fotografe armações com guia de alinhamento — 5 ângulos para catálogo e AR
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, marca ou SKU..."
            className="w-full rounded-lg border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelectProduct(product)}
              className="flex items-center gap-3 rounded-xl border p-3 text-left hover:bg-accent/50 transition-colors group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <Camera className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? 'Nenhum produto encontrado' : 'Nenhum produto no catalogo'}
            </p>
          </div>
        )}
      </div>
    )
  }

  // ── Frame shape selection state ──
  if (state === 'shape') {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold font-heading truncate">
              {selectedProduct?.name}
            </h1>
            <p className="text-xs text-muted-foreground">Selecione o formato da armação</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          O formato selecionado ajusta as silhuetas-guia para alinhamento mais preciso durante a captura.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FRAME_SHAPES.map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => handleSelectShape(shape)}
              className="flex flex-col items-center gap-2 rounded-xl border p-4 hover:bg-accent/50 hover:border-primary/50 transition-colors"
            >
              <FrameShapeIcon shape={shape} />
              <span className="text-sm font-medium">{FRAME_SHAPE_LABELS[shape]}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={handleSkipShape}>
            Pular — usar silhueta genérica
          </Button>
        </div>
      </div>
    )
  }

  // ── Capture state ──
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold font-heading truncate">
            {selectedProduct?.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {selectedProduct?.brand}
            {selectedShape && ` • ${FRAME_SHAPE_LABELS[selectedShape]}`}
          </p>
        </div>
      </div>

      {/* Camera permission */}
      {!permissionGranted && (
        <PermissionPrompt onAllow={handleAllowCamera} error={cameraError ?? undefined} />
      )}

      {/* Camera + silhouette */}
      {permissionGranted && (
        <>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black">
            <CameraFeed ref={videoRef} mirrored={false} />
            <FrameSilhouette
              ref={silhouetteRef}
              angle={currentAngle}
              frameShape={selectedShape ?? undefined}
              aligned={camera.isReady}
            />

            {/* Angle indicator */}
            <div className="absolute top-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 flex items-center gap-2">
              {isRequired && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
              <p className="text-xs font-semibold text-white">
                Ângulo {currentAngleIndex + 1}/{FRAME_PHOTO_ANGLES.length} — {ANGLE_LABELS[currentAngle]}
              </p>
            </div>

            {/* Resolution indicator */}
            {videoRef.current && (
              <div className="absolute bottom-3 right-3 rounded bg-black/40 px-2 py-0.5">
                <p className="text-[10px] text-white/50 font-mono">
                  {videoRef.current.videoWidth}x{videoRef.current.videoHeight}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <CaptureButton
              onClick={handleCapture}
              isCapturing={frameCapture.isCapturing}
              disabled={!camera.isReady}
            />
          </div>

          {/* Angle progress */}
          <div className="flex gap-2 justify-center flex-wrap">
            {FRAME_PHOTO_ANGLES.map((angle, i) => {
              const photo = frameCapture.getPhoto(angle)
              const isCurrent = i === currentAngleIndex
              const required = REQUIRED_ANGLES.includes(angle)

              return (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setCurrentAngleIndex(i)}
                  className={[
                    'relative flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors min-w-[72px]',
                    isCurrent ? 'border-primary bg-primary/5' : 'border-border',
                    photo ? 'opacity-100' : 'opacity-60',
                  ].join(' ')}
                >
                  {photo ? (
                    <div className="relative h-11 w-14 rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.localUrl} alt={angle} className="h-full w-full object-cover" />
                      <div className="absolute top-0.5 right-0.5 rounded-full bg-green-500 p-0.5">
                        <Check className="h-2.5 w-2.5 text-white" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          frameCapture.removePhoto(angle)
                        }}
                        className="absolute top-0.5 left-0.5 rounded-full bg-destructive p-0.5 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <X className="h-2.5 w-2.5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-11 w-14 items-center justify-center rounded bg-muted">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {required && <Star className="h-2 w-2 text-amber-400 fill-amber-400" />}
                    <span className="text-[10px] font-medium">{ANGLE_LABELS[angle]}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Upload progress */}
          {frameCapture.isUploading && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${frameCapture.uploadProgress}%` }}
              />
            </div>
          )}

          {/* Finish */}
          {frameCapture.requiredComplete && (
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={handleFinish}
                disabled={frameCapture.isUploading}
                className="px-8"
              >
                {frameCapture.isUploading ? (
                  'Salvando...'
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Concluir ({frameCapture.photos.length} fotos)
                  </>
                )}
              </Button>
              {frameCapture.photos.length < FRAME_PHOTO_ANGLES.length && (
                <p className="text-xs text-muted-foreground">
                  {FRAME_PHOTO_ANGLES.length - frameCapture.photos.length} ângulo(s) opcional(is) restante(s)
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/** Mini SVG icon representing each frame shape */
function FrameShapeIcon({ shape }: { shape: FrameShapeType }) {
  const stroke = 'currentColor'
  const sw = 1.5

  return (
    <svg viewBox="0 0 60 30" fill="none" className="w-16 h-8 text-muted-foreground">
      {shape === 'rectangular' && (
        <>
          <rect x="3" y="5" width="22" height="18" rx="3" stroke={stroke} strokeWidth={sw} />
          <rect x="35" y="5" width="22" height="18" rx="3" stroke={stroke} strokeWidth={sw} />
          <path d="M 25 13 Q 30 10 35 13" stroke={stroke} strokeWidth={sw} fill="none" />
        </>
      )}
      {shape === 'round' && (
        <>
          <circle cx="15" cy="15" r="10" stroke={stroke} strokeWidth={sw} />
          <circle cx="45" cy="15" r="10" stroke={stroke} strokeWidth={sw} />
          <path d="M 25 13 Q 30 10 35 13" stroke={stroke} strokeWidth={sw} fill="none" />
        </>
      )}
      {shape === 'aviator' && (
        <>
          <path d="M 15 5 Q 27 5 25 14 Q 23 25 15 25 Q 7 25 5 14 Q 3 5 15 5 Z" stroke={stroke} strokeWidth={sw} fill="none" />
          <path d="M 45 5 Q 57 5 55 14 Q 53 25 45 25 Q 37 25 35 14 Q 33 5 45 5 Z" stroke={stroke} strokeWidth={sw} fill="none" />
          <path d="M 25 12 Q 30 9 35 12" stroke={stroke} strokeWidth={sw} fill="none" />
        </>
      )}
      {shape === 'cat_eye' && (
        <>
          <path d="M 5 18 Q 5 8 10 5 Q 20 3 25 7 Q 25 12 25 18 Q 15 22 5 18 Z" stroke={stroke} strokeWidth={sw} fill="none" />
          <path d="M 35 7 Q 40 3 50 5 Q 55 8 55 18 Q 45 22 35 18 Q 35 12 35 7 Z" stroke={stroke} strokeWidth={sw} fill="none" />
          <path d="M 25 12 Q 30 10 35 12" stroke={stroke} strokeWidth={sw} fill="none" />
        </>
      )}
      {shape === 'wayfarer' && (
        <>
          <path d="M 3 6 L 25 6 Q 27 6 27 8 L 27 22 Q 27 24 25 24 L 5 24 Q 3 24 3 22 Z" stroke={stroke} strokeWidth={sw} fill="none" />
          <path d="M 33 6 L 55 6 Q 57 6 57 8 L 57 22 Q 57 24 55 24 L 35 24 Q 33 24 33 22 Z" stroke={stroke} strokeWidth={sw} fill="none" />
          <path d="M 27 12 Q 30 10 33 12" stroke={stroke} strokeWidth={sw} fill="none" />
        </>
      )}
      {shape === 'oval' && (
        <>
          <ellipse cx="15" cy="15" rx="12" ry="10" stroke={stroke} strokeWidth={sw} />
          <ellipse cx="45" cy="15" rx="12" ry="10" stroke={stroke} strokeWidth={sw} />
          <path d="M 27 13 Q 30 10 33 13" stroke={stroke} strokeWidth={sw} fill="none" />
        </>
      )}
      {shape === 'wraparound' && (
        <>
          <path d="M 2 14 Q 5 4 15 5 Q 25 6 27 14 Q 25 22 15 22 Q 5 22 2 14 Z" stroke={stroke} strokeWidth={sw} fill="none" />
          <path d="M 33 14 Q 35 6 45 5 Q 55 4 58 14 Q 55 22 45 22 Q 35 22 33 14 Z" stroke={stroke} strokeWidth={sw} fill="none" />
          <path d="M 27 13 Q 30 11 33 13" stroke={stroke} strokeWidth={sw} fill="none" />
        </>
      )}
      {shape === 'other' && (
        <>
          <rect x="3" y="5" width="22" height="18" rx="9" stroke={stroke} strokeWidth={sw} />
          <rect x="35" y="5" width="22" height="18" rx="9" stroke={stroke} strokeWidth={sw} />
          <path d="M 25 13 Q 30 10 35 13" stroke={stroke} strokeWidth={sw} fill="none" />
        </>
      )}
    </svg>
  )
}
