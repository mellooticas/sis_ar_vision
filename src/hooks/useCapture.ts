'use client'

import { useState, useCallback } from 'react'
import { captureCompositeImage, type CaptureItem } from '@/lib/ar/capture'
import { uploadTryOnCapture } from '@/lib/data/storage'

/**
 * Hook for managing try-on photo captures.
 * Captures composite images and optionally uploads to Supabase Storage.
 */
export function useCapture() {
  const [captures, setCaptures] = useState<CaptureItem[]>([])
  const [isCapturing, setIsCapturing] = useState(false)

  const capturePhoto = useCallback(async (
    videoEl: HTMLVideoElement,
    threeCanvas: HTMLCanvasElement | null,
    silhouette?: SVGSVGElement | null,
    productName?: string,
  ): Promise<CaptureItem> => {
    setIsCapturing(true)
    try {
      const blob = await captureCompositeImage(videoEl, threeCanvas, silhouette)
      const localUrl = URL.createObjectURL(blob)
      const item: CaptureItem = {
        id: crypto.randomUUID(),
        blob,
        localUrl,
        timestamp: Date.now(),
        productName,
      }
      setCaptures((prev) => [...prev, item])
      return item
    } finally {
      setIsCapturing(false)
    }
  }, [])

  const uploadCapture = useCallback(async (
    captureId: string,
    sessionId: string,
  ): Promise<string | null> => {
    const capture = captures.find((c) => c.id === captureId)
    if (!capture) return null

    const index = captures.indexOf(capture)
    const url = await uploadTryOnCapture(capture.blob, sessionId, index)

    setCaptures((prev) =>
      prev.map((c) => (c.id === captureId ? { ...c, remoteUrl: url } : c)),
    )
    return url
  }, [captures])

  const uploadAllCaptures = useCallback(async (sessionId: string): Promise<string[]> => {
    const urls: string[] = []
    for (let i = 0; i < captures.length; i++) {
      const c = captures[i]
      if (c.remoteUrl) {
        urls.push(c.remoteUrl)
        continue
      }
      const url = await uploadTryOnCapture(c.blob, sessionId, i)
      urls.push(url)
    }
    return urls
  }, [captures])

  const removeCapture = useCallback((captureId: string) => {
    setCaptures((prev) => {
      const item = prev.find((c) => c.id === captureId)
      if (item) URL.revokeObjectURL(item.localUrl)
      return prev.filter((c) => c.id !== captureId)
    })
  }, [])

  const clearCaptures = useCallback(() => {
    for (const c of captures) {
      URL.revokeObjectURL(c.localUrl)
    }
    setCaptures([])
  }, [captures])

  return {
    captures,
    isCapturing,
    capturePhoto,
    uploadCapture,
    uploadAllCaptures,
    removeCapture,
    clearCaptures,
  }
}
