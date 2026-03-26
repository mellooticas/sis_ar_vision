'use client'

import { X, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CaptureItem } from '@/lib/ar/capture'

interface CaptureGalleryProps {
  captures: CaptureItem[]
  onRemove?: (id: string) => void
  className?: string
}

export function CaptureGallery({ captures, onRemove, className }: CaptureGalleryProps) {
  if (captures.length === 0) return null

  const handleDownload = (capture: CaptureItem) => {
    const a = document.createElement('a')
    a.href = capture.localUrl
    a.download = `tryon_${capture.productName ?? 'capture'}_${Date.now()}.jpg`
    a.click()
  }

  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-2', className)}>
      {captures.map((capture) => (
        <div
          key={capture.id}
          className="group relative shrink-0 overflow-hidden rounded-lg border bg-card"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={capture.localUrl}
            alt={capture.productName ?? 'Captura try-on'}
            className="h-20 w-28 object-cover"
          />

          {/* Overlay controls */}
          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => handleDownload(capture)}
              className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/40"
              aria-label="Baixar"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(capture.id)}
                className="rounded-full bg-white/20 p-1.5 text-white hover:bg-red-500/80"
                aria-label="Remover"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Product name */}
          {capture.productName && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5">
              <p className="truncate text-[10px] text-white">{capture.productName}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
