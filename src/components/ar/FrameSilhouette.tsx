'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { FramePhotoAngle, FrameShapeType } from '@/types/frame-photo'
import { ANGLE_LABELS, ANGLE_DESCRIPTIONS } from '@/types/frame-photo'

interface FrameSilhouetteProps {
  angle: FramePhotoAngle
  frameShape?: FrameShapeType
  aligned?: boolean
  className?: string
}

interface SilhouetteProps {
  stroke: string
  strokeWidth: number
  dashArray: string
  frameShape?: FrameShapeType
}

/**
 * SVG silhouette overlay for standardized frame photography.
 * Shows an eyeglass frame outline so staff can position the physical
 * frame correctly for consistent catalog photos.
 *
 * Supports 5 angles and 8 frame shape variants.
 * Green when aligned, dashed white when waiting.
 */
export const FrameSilhouette = forwardRef<SVGSVGElement, FrameSilhouetteProps>(
  function FrameSilhouette({ angle, frameShape, aligned = false, className }, ref) {
    const strokeColor = aligned ? 'rgba(16,185,129,0.7)' : 'rgba(255,255,255,0.4)'
    const strokeWidth = aligned ? 2.5 : 2
    const dashArray = aligned ? 'none' : '6 4'
    const labelColor = aligned ? 'rgba(16,185,129,0.9)' : 'rgba(255,255,255,0.6)'
    const guideColor = 'rgba(255,255,255,0.3)'

    const isOptional = angle === 'closed' || angle === 'detail'

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
          {/* Distance/instruction guide */}
          <text
            x="200"
            y="24"
            textAnchor="middle"
            fill={guideColor}
            fontSize="11"
            fontFamily="sans-serif"
          >
            {angle === 'detail'
              ? 'Aproxime para capturar detalhe'
              : angle === 'closed'
                ? 'Feche a armação e posicione sobre a superfície'
                : 'Posicione a armação a ~30cm'}
          </text>

          {/* Rule of thirds grid (subtle) */}
          <line x1="133" y1="0" x2="133" y2="300" stroke={guideColor} strokeWidth={0.3} />
          <line x1="267" y1="0" x2="267" y2="300" stroke={guideColor} strokeWidth={0.3} />
          <line x1="0" y1="100" x2="400" y2="100" stroke={guideColor} strokeWidth={0.3} />
          <line x1="0" y1="200" x2="400" y2="200" stroke={guideColor} strokeWidth={0.3} />

          {/* Center crosshair (subtle) */}
          <line x1="195" y1="150" x2="205" y2="150" stroke={guideColor} strokeWidth={0.8} />
          <line x1="200" y1="145" x2="200" y2="155" stroke={guideColor} strokeWidth={0.8} />

          {/* 85% fill zone (e-commerce standard) */}
          <rect
            x="30" y="22" width="340" height="256" rx="4"
            stroke={guideColor} strokeWidth={0.5} strokeDasharray="4 8"
            fill="none"
          />

          {/* Angle-specific silhouette */}
          {angle === 'frontal' && (
            <FrontalSilhouette stroke={strokeColor} strokeWidth={strokeWidth} dashArray={dashArray} frameShape={frameShape} />
          )}
          {angle === '45deg' && (
            <PerspectiveSilhouette stroke={strokeColor} strokeWidth={strokeWidth} dashArray={dashArray} frameShape={frameShape} />
          )}
          {angle === 'lateral' && (
            <LateralSilhouette stroke={strokeColor} strokeWidth={strokeWidth} dashArray={dashArray} frameShape={frameShape} />
          )}
          {angle === 'closed' && (
            <ClosedSilhouette stroke={strokeColor} strokeWidth={strokeWidth} dashArray={dashArray} frameShape={frameShape} />
          )}
          {angle === 'detail' && (
            <DetailSilhouette stroke={strokeColor} strokeWidth={strokeWidth} dashArray={dashArray} />
          )}

          {/* Angle label badge */}
          <rect x="10" y="262" width="80" height="28" rx="6" fill="rgba(0,0,0,0.6)" />
          <text
            x="50"
            y="280"
            textAnchor="middle"
            fill={labelColor}
            fontSize="12"
            fontWeight="600"
            fontFamily="sans-serif"
          >
            {ANGLE_LABELS[angle]}
          </text>

          {/* Optional badge */}
          {isOptional && (
            <>
              <rect x="96" y="262" width="60" height="28" rx="6" fill="rgba(245,158,11,0.2)" />
              <text
                x="126"
                y="280"
                textAnchor="middle"
                fill="rgba(245,158,11,0.8)"
                fontSize="10"
                fontWeight="500"
                fontFamily="sans-serif"
              >
                Opcional
              </text>
            </>
          )}

          {/* Alignment feedback */}
          {aligned && (
            <text
              x="200"
              y="280"
              textAnchor="middle"
              fill="rgba(16,185,129,0.9)"
              fontSize="12"
              fontWeight="600"
              fontFamily="sans-serif"
            >
              Alinhado — Pode capturar
            </text>
          )}

          {/* Description text */}
          <text
            x="390"
            y="280"
            textAnchor="end"
            fill="rgba(255,255,255,0.3)"
            fontSize="9"
            fontFamily="sans-serif"
          >
            {ANGLE_DESCRIPTIONS[angle]}
          </text>
        </svg>
      </div>
    )
  },
)

// ── Lens shape helpers ──────────────────────────────────────────────────────

/** Returns lens rx/ry based on frame shape */
function getLensRadius(frameShape?: FrameShapeType): { rx: number; ry: number } {
  switch (frameShape) {
    case 'round':       return { rx: 35, ry: 35 }
    case 'oval':        return { rx: 30, ry: 35 }
    case 'cat_eye':     return { rx: 22, ry: 28 }
    case 'aviator':     return { rx: 24, ry: 32 }
    case 'wayfarer':    return { rx: 16, ry: 16 }
    case 'wraparound':  return { rx: 28, ry: 24 }
    case 'rectangular': return { rx: 8, ry: 8 }
    default:            return { rx: 20, ry: 20 }
  }
}

/** Aviator lens: a teardrop/pear shape path */
function AviatorLens({ cx, cy, w, h, stroke, strokeWidth, dashArray }: {
  cx: number; cy: number; w: number; h: number
  stroke: string; strokeWidth: number; dashArray: string
}) {
  // Teardrop: wider at top, narrowing at bottom
  const top = cy - h / 2
  const bot = cy + h / 2
  const left = cx - w / 2
  const right = cx + w / 2
  return (
    <path
      d={`M ${cx} ${top}
          Q ${right + 5} ${top} ${right} ${cy - 5}
          Q ${right - 2} ${bot - 5} ${cx} ${bot}
          Q ${left + 2} ${bot - 5} ${left} ${cy - 5}
          Q ${left - 5} ${top} ${cx} ${top} Z`}
      stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
      fill="none"
    />
  )
}

/** Cat-eye lens: upswept corners */
function CatEyeLens({ cx, cy, w, h, stroke, strokeWidth, dashArray }: {
  cx: number; cy: number; w: number; h: number
  stroke: string; strokeWidth: number; dashArray: string
}) {
  const top = cy - h / 2
  const bot = cy + h / 2
  const left = cx - w / 2
  const right = cx + w / 2
  return (
    <path
      d={`M ${left + 10} ${top}
          Q ${cx} ${top + 2} ${right - 5} ${top - 8}
          Q ${right + 5} ${top} ${right} ${cy}
          Q ${right} ${bot} ${cx} ${bot + 2}
          Q ${left} ${bot} ${left} ${cy}
          Q ${left} ${top} ${left + 10} ${top} Z`}
      stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
      fill="none"
    />
  )
}

// ── Angle silhouettes ───────────────────────────────────────────────────────

/** Frontal view: two lenses + bridge + temples spread open */
function FrontalSilhouette({ stroke, strokeWidth, dashArray, frameShape }: SilhouetteProps) {
  const { rx, ry } = getLensRadius(frameShape)
  const isAviator = frameShape === 'aviator'
  const isCatEye = frameShape === 'cat_eye'

  return (
    <g className="transition-all duration-300">
      {/* Lenses */}
      {isAviator ? (
        <>
          <AviatorLens cx={132} cy={150} w={95} h={70} stroke={stroke} strokeWidth={strokeWidth} dashArray={dashArray} />
          <AviatorLens cx={268} cy={150} w={95} h={70} stroke={stroke} strokeWidth={strokeWidth} dashArray={dashArray} />
        </>
      ) : isCatEye ? (
        <>
          <CatEyeLens cx={132} cy={150} w={95} h={70} stroke={stroke} strokeWidth={strokeWidth} dashArray={dashArray} />
          <CatEyeLens cx={268} cy={150} w={95} h={70} stroke={stroke} strokeWidth={strokeWidth} dashArray={dashArray} />
        </>
      ) : (
        <>
          <rect
            x="85" y="115" width="95" height="70" rx={rx} ry={ry}
            stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
            fill="none"
          />
          <rect
            x="220" y="115" width="95" height="70" rx={rx} ry={ry}
            stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
            fill="none"
          />
        </>
      )}

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
function LateralSilhouette({ stroke, strokeWidth, dashArray, frameShape }: SilhouetteProps) {
  const { rx } = getLensRadius(frameShape)
  const lensRx = Math.min(rx, 18)

  return (
    <g className="transition-all duration-300">
      {/* Lens profile */}
      <rect
        x="100" y="115" width="90" height="70" rx={lensRx}
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

      {/* Hinge detail indicator */}
      <circle cx="190" cy="145" r="5" stroke={stroke} strokeWidth={1} strokeDasharray="2 2" fill="none" />
    </g>
  )
}

/** 45° perspective view: both lenses with depth */
function PerspectiveSilhouette({ stroke, strokeWidth, dashArray, frameShape }: SilhouetteProps) {
  const { rx, ry } = getLensRadius(frameShape)
  const nearRx = rx
  const nearRy = ry
  const farRx = Math.max(rx - 6, 6)
  const farRy = Math.max(ry - 6, 6)

  return (
    <g className="transition-all duration-300">
      {/* Near lens (larger, left) */}
      <rect
        x="70" y="110" width="105" height="75" rx={nearRx} ry={nearRy}
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none"
      />
      {/* Far lens (smaller, right, offset up) */}
      <rect
        x="210" y="118" width="75" height="60" rx={farRx} ry={farRy}
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

/** Closed/folded view: top-down, arms folded in */
function ClosedSilhouette({ stroke, strokeWidth, dashArray, frameShape }: SilhouetteProps) {
  const { rx } = getLensRadius(frameShape)
  const lensRx = Math.min(rx, 16)

  return (
    <g className="transition-all duration-300">
      {/* Frame front (top-down view — narrower) */}
      <rect
        x="100" y="130" width="200" height="40" rx={lensRx}
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none"
      />

      {/* Left folded temple (going down) */}
      <path
        d="M 105 155 L 105 170 Q 105 210 115 220 L 120 225"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none" strokeLinecap="round"
      />

      {/* Right folded temple (going down) */}
      <path
        d="M 295 155 L 295 170 Q 295 210 285 220 L 280 225"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none" strokeLinecap="round"
      />

      {/* Bridge (top-down, centered bump) */}
      <path
        d="M 185 130 Q 200 120 215 130"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none" strokeLinecap="round"
      />

      {/* Nose pads (from above) */}
      <circle cx="190" cy="135" r="3" stroke={stroke} strokeWidth={1} fill="none" />
      <circle cx="210" cy="135" r="3" stroke={stroke} strokeWidth={1} fill="none" />

      {/* Hinge indicators */}
      <circle cx="105" cy="155" r="4" stroke={stroke} strokeWidth={1} strokeDasharray="2 2" fill="none" />
      <circle cx="295" cy="155" r="4" stroke={stroke} strokeWidth={1} strokeDasharray="2 2" fill="none" />

      {/* Brand text zone indicator */}
      <rect x="140" y="160" width="120" height="12" rx="2"
        stroke="rgba(255,255,255,0.15)" strokeWidth={0.8} strokeDasharray="3 3" fill="none"
      />
      <text x="200" y="170" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="sans-serif">
        Marca / inscricoes
      </text>
    </g>
  )
}

/** Detail/macro view: focus zone with magnification indicator */
function DetailSilhouette({ stroke, strokeWidth, dashArray }: SilhouetteProps) {
  return (
    <g className="transition-all duration-300">
      {/* Circular focus zone */}
      <circle
        cx="200" cy="150" r="70"
        stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={dashArray}
        fill="none"
      />

      {/* Inner focus ring */}
      <circle
        cx="200" cy="150" r="50"
        stroke={stroke} strokeWidth={strokeWidth * 0.6} strokeDasharray="3 6"
        fill="none" opacity={0.5}
      />

      {/* Crosshair */}
      <line x1="200" y1="110" x2="200" y2="130" stroke={stroke} strokeWidth={1} opacity={0.4} />
      <line x1="200" y1="170" x2="200" y2="190" stroke={stroke} strokeWidth={1} opacity={0.4} />
      <line x1="160" y1="150" x2="180" y2="150" stroke={stroke} strokeWidth={1} opacity={0.4} />
      <line x1="220" y1="150" x2="240" y2="150" stroke={stroke} strokeWidth={1} opacity={0.4} />

      {/* Corner focus brackets */}
      {/* Top-left */}
      <path d="M 115 95 L 115 80 L 130 80" stroke={stroke} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      {/* Top-right */}
      <path d="M 285 95 L 285 80 L 270 80" stroke={stroke} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      {/* Bottom-left */}
      <path d="M 115 205 L 115 220 L 130 220" stroke={stroke} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      {/* Bottom-right */}
      <path d="M 285 205 L 285 220 L 270 220" stroke={stroke} strokeWidth={1.5} fill="none" strokeLinecap="round" />

      {/* Example areas */}
      <text x="200" y="250" textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="9" fontFamily="sans-serif">
        Logo • Dobradiça • Textura • Plaqueta
      </text>
    </g>
  )
}
