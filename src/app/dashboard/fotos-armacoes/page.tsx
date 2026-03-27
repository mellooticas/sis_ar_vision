'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, ArrowLeft, ChevronRight, Check, Search, ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CameraFeed } from '@/components/ar/CameraFeed'
import { CaptureButton } from '@/components/ar/CaptureButton'
import { FrameSilhouette } from '@/components/ar/FrameSilhouette'
import { PermissionPrompt } from '@/components/ar/PermissionPrompt'
import { useCamera } from '@/hooks/useCamera'
import { useFrameCapture } from '@/hooks/useFrameCapture'
import { useProductList } from '@/hooks/use-products'
import { FRAME_PHOTO_ANGLES, ANGLE_LABELS } from '@/types/frame-photo'
import type { FramePhotoAngle } from '@/types/frame-photo'
import type { Product } from '@/types/product'

type PageState = 'select' | 'capture'

export default function FotosArmacoesPage() {
  const [state, setState] = useState<PageState>('select')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [currentAngleIndex, setCurrentAngleIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const silhouetteRef = useRef<SVGSVGElement>(null)

  const { data: products = [] } = useProductList()
  const camera = useCamera({ autoStart: false, facingMode: 'environment' })
  const frameCapture = useFrameCapture()

  const currentAngle = FRAME_PHOTO_ANGLES[currentAngleIndex]

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
    setState('capture')
  }, [frameCapture])

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
      await frameCapture.uploadFramePhotos(selectedProduct.id)
      toast.success(`${frameCapture.photos.length} fotos salvas para ${selectedProduct.name}`)
      camera.stop()
      setPermissionGranted(false)
      frameCapture.resetPhotos()
      setState('select')
      setSelectedProduct(null)
    } catch {
      toast.error('Erro ao fazer upload das fotos. Verifique se o bucket existe no Supabase.')
    }
  }, [selectedProduct, frameCapture, camera])

  const handleBack = useCallback(() => {
    camera.stop()
    setPermissionGranted(false)
    frameCapture.resetPhotos()
    setState('select')
    setSelectedProduct(null)
  }, [camera, frameCapture])

  const allAnglesCaptured = FRAME_PHOTO_ANGLES.every((angle) =>
    frameCapture.photos.some((p) => p.angle === angle),
  )

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
              Fotografe armacoes com guia de alinhamento para padronizar o catalogo
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

  // ── Capture state ──
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold font-heading truncate">
            {selectedProduct?.name}
          </h1>
          <p className="text-xs text-muted-foreground">{selectedProduct?.brand}</p>
        </div>
      </div>

      {/* Camera permission */}
      {!permissionGranted && (
        <PermissionPrompt onAllow={handleAllowCamera} error={cameraError ?? undefined} />
      )}

      {/* Camera + silhouette */}
      {permissionGranted && (
        <>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black">
            <CameraFeed ref={videoRef} mirrored={false} />
            <FrameSilhouette
              ref={silhouetteRef}
              angle={currentAngle}
              aligned={camera.isReady}
            />

            {/* Angle indicator */}
            <div className="absolute top-3 right-3 rounded-lg bg-black/60 px-3 py-1.5">
              <p className="text-xs font-semibold text-white">
                Angulo {currentAngleIndex + 1}/{FRAME_PHOTO_ANGLES.length} — {ANGLE_LABELS[currentAngle]}
              </p>
            </div>
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
          <div className="flex gap-2 justify-center">
            {FRAME_PHOTO_ANGLES.map((angle, i) => {
              const photo = frameCapture.getPhoto(angle)
              const isCurrent = i === currentAngleIndex

              return (
                <button
                  key={angle}
                  type="button"
                  onClick={() => setCurrentAngleIndex(i)}
                  className={[
                    'relative flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors min-w-[80px]',
                    isCurrent ? 'border-primary bg-primary/5' : 'border-border',
                    photo ? 'opacity-100' : 'opacity-60',
                  ].join(' ')}
                >
                  {photo ? (
                    <div className="relative h-12 w-16 rounded overflow-hidden">
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
                    <div className="flex h-12 w-16 items-center justify-center rounded bg-muted">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-[10px] font-medium">{ANGLE_LABELS[angle]}</span>
                </button>
              )
            })}
          </div>

          {/* Finish */}
          {allAnglesCaptured && (
            <div className="flex justify-center">
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
            </div>
          )}
        </>
      )}
    </div>
  )
}
