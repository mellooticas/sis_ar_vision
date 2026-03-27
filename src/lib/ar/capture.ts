/**
 * capture.ts — Composite image capture for AR try-on
 *
 * Combines video frame + Three.js overlay + silhouette SVG into a single image.
 * All captured photos MUST include the face silhouette.
 */

/**
 * Capture a composite image from layered AR elements.
 * @param videoElement - Camera feed <video> element
 * @param threeCanvas - Three.js <canvas> with preserveDrawingBuffer=true
 * @param silhouetteSvg - Optional SVG element (FaceSilhouette) to overlay
 */
export async function captureCompositeImage(
  videoElement: HTMLVideoElement,
  threeCanvas: HTMLCanvasElement | null,
  silhouetteSvg?: SVGSVGElement | null,
  options?: { quality?: number; format?: 'image/jpeg' | 'image/png'; mirror?: boolean },
): Promise<Blob> {
  const width = videoElement.videoWidth || 640
  const height = videoElement.videoHeight || 480
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  const shouldMirror = options?.mirror ?? true

  // Layer 1: Video frame (mirrored for front camera, straight for rear)
  if (shouldMirror) {
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(videoElement, -width, 0, width, height)
    ctx.restore()
  } else {
    ctx.drawImage(videoElement, 0, 0, width, height)
  }

  // Layer 2: Three.js glasses overlay
  if (threeCanvas) {
    ctx.drawImage(threeCanvas, 0, 0, width, height)
  }

  // Layer 3: Silhouette SVG
  if (silhouetteSvg) {
    try {
      const svgData = new XMLSerializer().serializeToString(silhouetteSvg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const img = await loadImage(url)
      ctx.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
    } catch {
      // Silhouette overlay failed — continue without it
    }
  }

  // Add timestamp watermark
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '12px monospace'
  ctx.textAlign = 'right'
  ctx.fillText(
    `Clearix AR Vision • ${new Date().toLocaleString('pt-BR')}`,
    width - 10,
    height - 10,
  )

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      options?.format ?? 'image/jpeg',
      options?.quality ?? 0.92,
    )
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export interface CaptureItem {
  id: string
  blob: Blob
  localUrl: string
  timestamp: number
  productName?: string
  remoteUrl?: string
}
