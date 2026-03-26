'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseCameraOptions {
  facingMode?: 'user' | 'environment'
  width?: number
  height?: number
  autoStart?: boolean
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  stream: MediaStream | null
  isReady: boolean
  error: string | null
  facingMode: 'user' | 'environment'
  start: () => Promise<void>
  stop: () => void
  switchCamera: () => Promise<void>
}

/**
 * Detect in-app browsers that restrict camera access.
 */
function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()
  return (
    ua.includes('instagram') ||
    ua.includes('fban') ||
    ua.includes('fbav') ||
    ua.includes('tiktok') ||
    ua.includes('snapchat') ||
    ua.includes('line/')
  )
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    facingMode: initialFacingMode = 'user',
    width = 1280,
    height = 720,
    autoStart = false,
  } = options

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialFacingMode)

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsReady(false)
  }, [])

  const start = useCallback(async () => {
    setError(null)

    if (isInAppBrowser()) {
      setError('Abra no navegador do sistema (Chrome/Safari) para usar a camera. Navegadores integrados de apps como Instagram e TikTok nao suportam acesso a camera.')
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Seu navegador nao suporta acesso a camera.')
      return
    }

    // Stop any existing stream
    stop()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsReady(true)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'

      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setError('Permissao de camera negada. Habilite nas configuracoes do navegador.')
      } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
        setError('Nenhuma camera encontrada no dispositivo.')
      } else if (msg.includes('NotReadable') || msg.includes('TrackStartError')) {
        setError('Camera em uso por outro aplicativo.')
      } else {
        setError(`Erro ao acessar camera: ${msg}`)
      }
    }
  }, [facingMode, width, height, stop])

  const switchCamera = useCallback(async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newMode)
    // start() will be called by the effect below
  }, [facingMode])

  // Re-start when facingMode changes (if already running)
  useEffect(() => {
    if (streamRef.current) {
      start()
    }
  }, [facingMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-start
  useEffect(() => {
    if (autoStart) {
      start()
    }
    return () => stop()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    videoRef,
    stream: streamRef.current,
    isReady,
    error,
    facingMode,
    start,
    stop,
    switchCamera,
  }
}
