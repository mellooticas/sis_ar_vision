'use client'

import { cn } from '@/lib/utils'

interface FaceSilhouetteProps {
  /** Whether the face is currently detected and aligned */
  aligned?: boolean
  /** Whether measurement is in progress */
  measuring?: boolean
  className?: string
}

/**
 * SVG silhouette overlay for PD measurement.
 * Shows head + shoulders outline so the user knows the correct
 * distance, angle and position for an accurate reading.
 *
 * Green when aligned, dashed white when waiting.
 */
export function FaceSilhouette({ aligned = false, measuring = false, className }: FaceSilhouetteProps) {
  const strokeColor = aligned ? 'rgba(16,185,129,0.7)' : 'rgba(255,255,255,0.35)'
  const strokeWidth = aligned ? 2.5 : 2
  const dashArray = aligned ? 'none' : '6 4'
  const eyeColor = measuring ? 'rgba(217,70,239,0.8)' : aligned ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.25)'

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      <svg
        viewBox="0 0 300 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Head outline (oval) */}
        <ellipse
          cx="150"
          cy="145"
          rx="72"
          ry="92"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          className="transition-all duration-300"
        />

        {/* Neck */}
        <path
          d="M 120 230 Q 120 255 105 270 Q 90 285 70 295"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        <path
          d="M 180 230 Q 180 255 195 270 Q 210 285 230 295"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Shoulders */}
        <path
          d="M 70 295 Q 40 310 15 340"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        <path
          d="M 230 295 Q 260 310 285 340"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
          className="transition-all duration-300"
        />

        {/* Eye level line */}
        <line
          x1="90"
          y1="135"
          x2="210"
          y2="135"
          stroke={eyeColor}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          className="transition-all duration-300"
        />

        {/* Eye position markers (circles where pupils should be) */}
        <circle
          cx="118"
          cy="135"
          r="8"
          stroke={eyeColor}
          strokeWidth={1.5}
          fill="none"
          className="transition-all duration-300"
        />
        <circle
          cx="182"
          cy="135"
          r="8"
          stroke={eyeColor}
          strokeWidth={1.5}
          fill="none"
          className="transition-all duration-300"
        />

        {/* Pupil dots */}
        <circle
          cx="118"
          cy="135"
          r="2"
          fill={eyeColor}
          className="transition-all duration-300"
        />
        <circle
          cx="182"
          cy="135"
          r="2"
          fill={eyeColor}
          className="transition-all duration-300"
        />

        {/* PD measurement arrow (only when measuring) */}
        {measuring && (
          <g>
            {/* Arrow line between pupils */}
            <line
              x1="118"
              y1="155"
              x2="182"
              y2="155"
              stroke="rgba(217,70,239,0.8)"
              strokeWidth={1.5}
            />
            {/* Left arrow tip */}
            <path
              d="M 118 155 L 124 151 M 118 155 L 124 159"
              stroke="rgba(217,70,239,0.8)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            {/* Right arrow tip */}
            <path
              d="M 182 155 L 176 151 M 182 155 L 176 159"
              stroke="rgba(217,70,239,0.8)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            {/* PD label */}
            <text
              x="150"
              y="170"
              textAnchor="middle"
              fill="rgba(217,70,239,0.9)"
              fontSize="10"
              fontFamily="monospace"
            >
              PD
            </text>
          </g>
        )}

        {/* Nose bridge reference (subtle) */}
        <line
          x1="150"
          y1="125"
          x2="150"
          y2="175"
          stroke={aligned ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.15)'}
          strokeWidth={1}
          strokeDasharray="3 3"
          className="transition-all duration-300"
        />
      </svg>
    </div>
  )
}
