'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Color, type Group } from 'three'
import type { GlassesTransform } from '@/types/ar'

interface LensTintConfig {
  color: string
  opacity: number
  mirror?: boolean
}

interface GlassesModelProps {
  modelUrl: string
  transform: GlassesTransform
  /** Opacity for fade-in effect */
  opacity?: number
  /** Lens tint color/opacity for AR preview */
  lensTint?: LensTintConfig
}

/**
 * Renders a .glb glasses model with position/rotation/scale from face tracking.
 */
export function GlassesModel({ modelUrl, transform, opacity = 1, lensTint }: GlassesModelProps) {
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
        // Apply opacity and lens tint to meshes
        onUpdate={(self: any) => {
          self.traverse((child: any) => {
            if (!child.isMesh || !child.material) return

            // Apply fade-in opacity
            if (opacity < 1) {
              child.material.transparent = true
              child.material.opacity = opacity
            }

            // Apply lens tint to lens meshes (name contains 'lens' or 'lente')
            const meshName = (child.name || '').toLowerCase()
            if (lensTint && lensTint.opacity > 0 && (meshName.includes('lens') || meshName.includes('lente') || meshName.includes('glass'))) {
              child.material.transparent = true
              child.material.opacity = lensTint.opacity
              child.material.color = new Color(lensTint.color)
              if (lensTint.mirror) {
                child.material.metalness = 0.8
                child.material.roughness = 0.1
              }
            }
          })
        }}
      />
    </group>
  )
}
