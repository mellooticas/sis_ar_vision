'use client'

import { Suspense, forwardRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { GlassesModel } from './GlassesModel'
import type { GlassesTransform } from '@/types/ar'

interface LensTintConfig {
  color: string
  opacity: number
  mirror?: boolean
}

interface GlassesOverlayProps {
  modelUrl: string | null
  transform: GlassesTransform | null
  className?: string
  lensTint?: LensTintConfig | null
}

/**
 * Transparent R3F Canvas overlaid on top of the camera feed.
 * Renders glasses model when both modelUrl and transform are available.
 * ForwardRef exposes the underlying WebGL canvas for composite capture.
 */
export const GlassesOverlay = forwardRef<HTMLCanvasElement, GlassesOverlayProps>(
  function GlassesOverlay({ modelUrl, transform, className, lensTint }, ref) {
    const onCreated = useCallback(
      (state: { gl: { domElement: HTMLCanvasElement } }) => {
        if (typeof ref === 'function') ref(state.gl.domElement)
        else if (ref) (ref as React.MutableRefObject<HTMLCanvasElement | null>).current = state.gl.domElement
      },
      [ref],
    )

    if (!modelUrl || !transform) return null

    return (
      <div className={className} style={{ pointerEvents: 'none' }}>
        <Canvas
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
          camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 2] }}
          onCreated={onCreated}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[0, 2, 4]} intensity={0.6} />
          <Suspense fallback={null}>
            <GlassesModel
              modelUrl={modelUrl}
              transform={transform}
              lensTint={lensTint || undefined}
            />
          </Suspense>
        </Canvas>
      </div>
    )
  },
)
