'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { GlassesModel } from './GlassesModel'
import type { GlassesTransform } from '@/types/ar'

interface GlassesOverlayProps {
  modelUrl: string | null
  transform: GlassesTransform | null
  className?: string
}

/**
 * Transparent R3F Canvas overlaid on top of the camera feed.
 * Renders glasses model when both modelUrl and transform are available.
 */
export function GlassesOverlay({ modelUrl, transform, className }: GlassesOverlayProps) {
  if (!modelUrl || !transform) return null

  return (
    <div className={className} style={{ pointerEvents: 'none' }}>
      <Canvas
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
        camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0, 2] }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 2, 4]} intensity={0.6} />
        <Suspense fallback={null}>
          <GlassesModel modelUrl={modelUrl} transform={transform} />
        </Suspense>
      </Canvas>
    </div>
  )
}
