'use client'

import type { ProgressiveZone } from '@/lib/optics/progressive-zones'

interface ProgressiveZonesOverlayProps {
  zones: ProgressiveZone[]
  width?: number
  height?: number
  className?: string
}

/**
 * SVG overlay showing progressive lens zones with colored regions.
 * Green = distance (sharp), Yellow = intermediate, Blue = near.
 */
export function ProgressiveZonesOverlay({
  zones,
  width = 200,
  height = 300,
  className,
}: ProgressiveZonesOverlayProps) {
  const cx = width / 2
  const lensRx = width * 0.45
  const lensRy = height * 0.45
  const lensCy = height * 0.5

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Lens outline */}
      <ellipse
        cx={cx}
        cy={lensCy}
        rx={lensRx}
        ry={lensRy}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        opacity={0.3}
      />

      {/* Clip path for lens shape */}
      <defs>
        <clipPath id="lens-clip">
          <ellipse cx={cx} cy={lensCy} rx={lensRx} ry={lensRy} />
        </clipPath>
      </defs>

      {/* Zones */}
      <g clipPath="url(#lens-clip)">
        {zones.map((zone) => {
          const yTop = height * zone.top
          const yBottom = height * zone.bottom
          const zoneHeight = yBottom - yTop
          const halfWidth = (width * zone.width) / 2

          return (
            <g key={zone.id}>
              <rect
                x={cx - halfWidth}
                y={yTop}
                width={halfWidth * 2}
                height={zoneHeight}
                fill={zone.color}
                opacity={0.25}
                rx={zone.id === 'intermediate' ? 0 : 8}
              />
              {/* Zone label */}
              <text
                x={cx}
                y={yTop + zoneHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={zone.color}
                fontSize={11}
                fontWeight={600}
              >
                {zone.name}
              </text>
            </g>
          )
        })}
      </g>

      {/* Corridor indicators (dashed lines) */}
      {zones.length >= 2 && (
        <>
          <line
            x1={cx - 15}
            y1={height * zones[0].bottom}
            x2={cx - 8}
            y2={height * zones[zones.length - 1].top + (height * (zones[zones.length - 1].bottom - zones[zones.length - 1].top)) / 2}
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.4}
          />
          <line
            x1={cx + 15}
            y1={height * zones[0].bottom}
            x2={cx + 8}
            y2={height * zones[zones.length - 1].top + (height * (zones[zones.length - 1].bottom - zones[zones.length - 1].top)) / 2}
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.4}
          />
        </>
      )}
    </svg>
  )
}
