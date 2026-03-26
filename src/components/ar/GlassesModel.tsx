'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import type { GlassesTransform } from '@/types/ar'

interface GlassesModelProps {
  modelUrl: string
  transform: GlassesTransform
  /** Opacity for fade-in effect */
  opacity?: number
}

/**
 * Renders a .glb glasses model with position/rotation/scale from face tracking.
 */
export function GlassesModel({ modelUrl, transform, opacity = 1 }: GlassesModelProps) {
  const groupRef = useRef<Group>(null)
  const { scene } = useGLTF(modelUrl)

  // Smoothly interpolate to target transform each frame
  useFrame(() => {
    if (!groupRef.current) return

    const group = groupRef.current
    const [px, py, pz] = transform.position
    const [rx, ry, rz] = transform.rotation
    const [sx, sy, sz] = transform.scale

    // Lerp for smoother transitions
    const lerpFactor = 0.3
    group.position.lerp({ x: px, y: py, z: pz }, lerpFactor)
    group.rotation.x += (rx - group.rotation.x) * lerpFactor
    group.rotation.y += (ry - group.rotation.y) * lerpFactor
    group.rotation.z += (rz - group.rotation.z) * lerpFactor
    group.scale.lerp({ x: sx, y: sy, z: sz }, lerpFactor)
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene.clone()}
        scale={1}
        // Apply opacity to all meshes if needed
        onUpdate={(self: any) => {
          if (opacity < 1) {
            self.traverse((child: any) => {
              if (child.isMesh && child.material) {
                child.material.transparent = true
                child.material.opacity = opacity
              }
            })
          }
        }}
      />
    </group>
  )
}
