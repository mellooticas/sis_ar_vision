'use client'

import { useState, useCallback } from 'react'
import { captureCompositeImage } from '@/lib/ar/capture'
import { uploadProductPhoto, registerProductImage } from '@/lib/data/storage'
import { REQUIRED_ANGLES } from '@/types/frame-photo'
import type { FramePhoto, FramePhotoAngle, FrameShapeType } from '@/types/frame-photo'

/**
 * Hook for managing standardized frame photo captures.
 * Captures photos at up to 5 standard angles and uploads them to Supabase Storage.
 * First 3 angles (frontal, 45°, lateral) are required; closed and detail are optional.
 */
export function useFrameCapture() {
  const [photos, setPhotos] = useState<FramePhoto[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const captureFramePhoto = useCallback(async (
    videoEl: HTMLVideoElement,
    angle: FramePhotoAngle,
    silhouetteSvg?: SVGSVGElement | null,
  ): Promise<FramePhoto> => {
    setIsCapturing(true)
    try {
      const blob = await captureCompositeImage(videoEl, null, silhouetteSvg, {
        mirror: false,
        quality: 0.92,
        format: 'image/jpeg',
      })
      const localUrl = URL.createObjectURL(blob)
      const photo: FramePhoto = {
        angle,
        blob,
        localUrl,
        timestamp: Date.now(),
      }

      setPhotos((prev) => {
        const filtered = prev.filter((p) => p.angle !== angle)
        return [...filtered, photo]
      })

      return photo
    } finally {
      setIsCapturing(false)
    }
  }, [])

  const uploadFramePhotos = useCallback(async (
    productId: string,
    frameShape?: FrameShapeType | null,
  ): Promise<string[]> => {
    setIsUploading(true)
    setUploadProgress(0)
    const urls: string[] = []

    try {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]

        if (photo.remoteUrl) {
          urls.push(photo.remoteUrl)
          setUploadProgress(((i + 1) / photos.length) * 100)
          continue
        }

        // Upload file to Storage
        const { signedUrl, storagePath } = await uploadProductPhoto(
          photo.blob, productId, photo.angle,
        )
        urls.push(signedUrl)

        // Register in database
        try {
          await registerProductImage({
            productId,
            angle: photo.angle,
            frameShape: frameShape ?? null,
            storagePath,
            fileSizeBytes: photo.blob.size,
            metadata: {
              captured_at: new Date(photo.timestamp).toISOString(),
              source: 'ar_vision_frame_capture',
            },
          })
        } catch {
          // DB registration can fail if migration not applied yet — photo is still in storage
          console.warn(`[useFrameCapture] DB registration failed for ${photo.angle}, photo still uploaded`)
        }

        setPhotos((prev) =>
          prev.map((p) => (p.angle === photo.angle ? { ...p, remoteUrl: signedUrl } : p)),
        )
        setUploadProgress(((i + 1) / photos.length) * 100)
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
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

  /** Check if all 3 required angles have been captured */
  const requiredComplete = REQUIRED_ANGLES.every((angle) =>
    photos.some((p) => p.angle === angle),
  )

  return {
    photos,
    isCapturing,
    isUploading,
    uploadProgress,
    requiredComplete,
    captureFramePhoto,
    uploadFramePhotos,
    removePhoto,
    resetPhotos,
    getPhoto,
  }
}
