'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { FramePhotoAngle } from '@/types/frame-photo'

interface FrameSilhouetteProps {
  angle: FramePhotoAngle
  aligned?: boolean
  className?: string
}

const ANGLE_LABELS: Record<FramePhotoAngle, string> = {
  frontal: 'Frontal',
  lateral: 'Lateral',
  '45deg': '45°',
}

/**
 * SVG silhouette overlay for standardized frame photography.
 * Shows an eyeglass frame outline so staff can position the physical
 * frame correctly for consistent catalog photos.
 *
 * Green when aligned, dashed white when waiting.
 */
export const FrameSilhouette = forwardRef<SVGSVGElement, FrameSilhouetteProps>(function FrameSilhouette({ angle, aligned = false, className }, ref) {
  const strokeColor = aligned ? 'rgba(16,185,129,0.7)' : 'rgba(255,255,255,0.4)'
  const strokeWidth = aligned ? 2.5 : 2
  const dashArray = aligned ? 'none' : '6 4'
  const labelColor = aligned ? 'rgba(16,185,129,0.9)' : 'rgba(255,255,255,0.6)'
  const guideColor = 'rgba(255,255,255,0.3)'

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      <svg
        ref={ref}
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Distance guide */}
        <text
          x="200"
          y="24"
          textAnchor="middle"
          fill={guideColor}
          fontSize="11"
          fontFamily="sans-serif"
        >
          Posicione a armacao a ~30cm
        </text>

        {/* Center crosshair (subtle) */}
        <line x1="195" y1="150" x2="205" y2="150" stroke={guideColor} strokeWidth={0.8} />
        <line x1="200" y1="145" x2="200" y2="155" stroke={guideColor} strokeWidth={0.8} />

        {angle === 'frontal' && <FrontalSilhouette stroke={strokeColor} strokeWidth={strokeWidth} dashArray={dashArray} />}
        {angle === 'lateral' && <LateralSilhouette stroke={strokeColor} strokeWidth={strokeWidth} dashArray={dashArray} />}
        {angle === '45deg' && <PerspectiveSilhouette stroke={strokeColor} strokeWidth={strokeWidth} dashArray={dashArray} />}

        {/* Angle label */}
        <rect x="10" y="268" width={angle === '45deg' ? 40 : 70} height="22" rx="4" fill="rgba(0,0,0,0.5)" />
        <text
          x={angle === '45deg' ? 30 : 45}
          y="283"
          textAnchor="middle"
          fill={labelColor}
          fontSize="12"
          fontWeight="600"
          fontFamily="sans-serif"
        >
          {ANGLE_LABELS[angle]}
        </text>

        {/* Alignment feedback */}
        {aligned && (
          <text
            x="200"
            y="283"
            textAnchor="middle"
            fill="rgba(16,185,129,0.9)"
            fontSize="12"
            fontWeight="600"
            fontFamily="sans-serif"
          >
            Alinhado — Pode capturar
          </text>
        )}
      </svg>
    </div>
  )
})

/** Frontal view: two lenses + bridge + temples spread open */
function FrontalSilhouette({ stroke, strokeWidth, dashArray }: SilhouetteProps) {
  return (
    <g className="transition-all duration-300">
      {/* Left lens */}
      <rect
        x="85" y="115" width="95" height="70" rx="20"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none"
      />
      {/* Right lens */}
      <rect
        x="220" y="115" width="95" height="70" rx="20"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none"
      />
      {/* Bridge */}
      <path
        d="M 180 145 Q 200 135 220 145"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none" strokeLinecap="round"
      />
      {/* Left temple */}
      <path
        d="M 85 140 L 40 135"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        strokeLinecap="round"
      />
      {/* Right temple */}
      <path
        d="M 315 140 L 360 135"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        strokeLinecap="round"
      />
      {/* Temple tips */}
      <circle cx="40" cy="135" r="3" fill={stroke} opacity={0.5} />
      <circle cx="360" cy="135" r="3" fill={stroke} opacity={0.5} />
    </g>
  )
}

/** Lateral (90°) view: single lens profile + curved temple */
function LateralSilhouette({ stroke, strokeWidth, dashArray }: SilhouetteProps) {
  return (
    <g className="transition-all duration-300">
      {/* Lens profile (rounded rect, slightly angled) */}
      <rect
        x="100" y="115" width="90" height="70" rx="18"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none"
      />
      {/* Front rim thickness */}
      <line
        x1="100" y1="125" x2="100" y2="175"
        stroke={stroke} strokeWidth={strokeWidth + 1} strokeDasharray={dashArray}
        strokeLinecap="round"
      />
      {/* Temple arm going back */}
      <path
        d="M 190 145 L 310 140 Q 330 138 340 145 Q 350 155 345 165"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none" strokeLinecap="round"
      />
      {/* Temple tip (ear hook) */}
      <path
        d="M 345 165 Q 340 180 330 185"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none" strokeLinecap="round"
      />
      {/* Nose pad */}
      <circle cx="108" cy="180" r="4" stroke={stroke} strokeWidth={1.5} fill="none" />
    </g>
  )
}

/** 45° perspective view: both lenses with depth */
function PerspectiveSilhouette({ stroke, strokeWidth, dashArray }: SilhouetteProps) {
  return (
    <g className="transition-all duration-300">
      {/* Near lens (larger, left) */}
      <rect
        x="70" y="110" width="105" height="75" rx="22"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none"
      />
      {/* Far lens (smaller, right, offset up) */}
      <rect
        x="210" y="118" width="75" height="60" rx="16"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none"
      />
      {/* Bridge (angled) */}
      <path
        d="M 175 140 Q 193 132 210 138"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none" strokeLinecap="round"
      />
      {/* Near temple (going to viewer) */}
      <path
        d="M 70 140 L 35 138"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        strokeLinecap="round"
      />
      {/* Far temple (going away, foreshortened) */}
      <path
        d="M 285 142 L 320 148 Q 335 152 340 160"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none" strokeLinecap="round"
      />
    </g>
  )
}

interface SilhouetteProps {
  stroke: string
  strokeWidth: number
  dashArray: string
}
