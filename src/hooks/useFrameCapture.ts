'use client'

import { useState, useCallback } from 'react'
import { captureCompositeImage } from '@/lib/ar/capture'
import { uploadProductPhoto } from '@/lib/data/storage'
import type { FramePhoto, FramePhotoAngle } from '@/types/frame-photo'

/**
 * Hook for managing standardized frame photo captures.
 * Captures photos at 3 standard angles (frontal, lateral, 45°)
 * and uploads them to Supabase Storage.
 */
export function useFrameCapture() {
  const [photos, setPhotos] = useState<FramePhoto[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const captureFramePhoto = useCallback(async (
    videoEl: HTMLVideoElement,
    angle: FramePhotoAngle,
    silhouetteSvg?: SVGSVGElement | null,
  ): Promise<FramePhoto> => {
    setIsCapturing(true)
    try {
      const blob = await captureCompositeImage(videoEl, null, silhouetteSvg, { mirror: false })
      const localUrl = URL.createObjectURL(blob)
      const photo: FramePhoto = {
        angle,
        blob,
        localUrl,
        timestamp: Date.now(),
      }

      setPhotos((prev) => {
        // Replace if angle already captured
        const filtered = prev.filter((p) => p.angle !== angle)
        return [...filtered, photo]
      })

      return photo
    } finally {
      setIsCapturing(false)
    }
  }, [])

  const uploadFramePhotos = useCallback(async (productId: string): Promise<string[]> => {
    setIsUploading(true)
    const urls: string[] = []

    try {
      for (const photo of photos) {
        if (photo.remoteUrl) {
          urls.push(photo.remoteUrl)
          continue
        }

        const url = await uploadProductPhoto(photo.blob, productId, photo.angle)
        urls.push(url)

        setPhotos((prev) =>
          prev.map((p) => (p.angle === photo.angle ? { ...p, remoteUrl: url } : p)),
        )
      }
    } finally {
      setIsUploading(false)
    }

    return urls
  }, [photos])

  const removePhoto = useCallback((angle: FramePhotoAngle) => {
    setPhotos((prev) => {
      const item = prev.find((p) => p.angle === angle)
      if (item) URL.revokeObjectURL(item.localUrl)
      return prev.filter((p) => p.angle !== angle)
    })
  }, [])

  const resetPhotos = useCallback(() => {
    for (const p of photos) {
      URL.revokeObjectURL(p.localUrl)
    }
    setPhotos([])
  }, [photos])

  const getPhoto = useCallback((angle: FramePhotoAngle): FramePhoto | undefined => {
    return photos.find((p) => p.angle === angle)
  }, [photos])

  return {
    photos,
    isCapturing,
    isUploading,
    captureFramePhoto,
    uploadFramePhotos,
    removePhoto,
    resetPhotos,
    getPhoto,
  }
}
