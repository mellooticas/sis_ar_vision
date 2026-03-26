'use client'

import { useState, useCallback } from 'react'
import { GitCompareArrows, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ComparisonView } from '@/components/ar/ComparisonView'
import type { CaptureItem } from '@/lib/ar/capture'

export default function CompararPage() {
  const [captures, setCaptures] = useState<CaptureItem[]>([])

  const handleAddImage = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return

      Array.from(files).forEach((file) => {
        const localUrl = URL.createObjectURL(file)
        const item: CaptureItem = {
          id: crypto.randomUUID(),
          blob: file,
          localUrl,
          timestamp: Date.now(),
          productName: file.name.replace(/\.[^.]+$/, ''),
        }
        setCaptures((prev) => [...prev, item].slice(0, 4))
      })
    }
    input.click()
  }, [])

  const handleRemove = useCallback((id: string) => {
    setCaptures((prev) => {
      const item = prev.find((c) => c.id === id)
      if (item) URL.revokeObjectURL(item.localUrl)
      return prev.filter((c) => c.id !== id)
    })
  }, [])

  const handleClear = useCallback(() => {
    captures.forEach((c) => URL.revokeObjectURL(c.localUrl))
    setCaptures([])
  }, [captures])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <GitCompareArrows className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Comparar Armacoes</h1>
            <p className="text-sm text-muted-foreground">
              Compare ate 4 armacoes lado a lado para ajudar o cliente na decisao
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button onClick={handleAddImage} disabled={captures.length >= 4}>
          <Upload className="mr-2 h-4 w-4" />
          Adicionar Foto ({captures.length}/4)
        </Button>
        {captures.length > 0 && (
          <Button variant="outline" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Limpar
          </Button>
        )}
        <p className="text-xs text-muted-foreground ml-auto">
          Use fotos capturadas no Try-On ou envie imagens do cliente
        </p>
      </div>

      {/* Thumbnails for removal */}
      {captures.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {captures.map((capture) => (
            <div key={capture.id} className="relative shrink-0 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capture.localUrl}
                alt={capture.productName ?? ''}
                className="h-16 w-20 rounded-lg object-cover border"
              />
              <button
                type="button"
                onClick={() => handleRemove(capture.id)}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Comparison */}
      <ComparisonView captures={captures} />

      {/* Hint */}
      {captures.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <GitCompareArrows className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-2">
            Adicione fotos do try-on para comparar armacoes lado a lado
          </p>
          <p className="text-xs text-muted-foreground">
            Dica: Capture fotos com diferentes armacoes na prova virtual e depois compare aqui
          </p>
        </div>
      )}
    </div>
  )
}
