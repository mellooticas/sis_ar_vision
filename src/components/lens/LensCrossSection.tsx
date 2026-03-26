'use client'

import { cn } from '@/lib/utils'

interface LensCrossSectionProps {
  centerThickness: number
  edgeThickness: number
  isMinus: boolean
  className?: string
  color?: string
}

/**
 * SVG cross-section diagram of a lens.
 * Shows center and edge thickness with visual proportions.
 */
export function LensCrossSection({
  centerThickness,
  edgeThickness,
  isMinus,
  className,
  color = 'currentColor',
}: LensCrossSectionProps) {
  const maxTh = Math.max(centerThickness, edgeThickness)
  const scale = 40 / Math.max(maxTh, 3) // Scale so max is ~40px in SVG

  const centerH = centerThickness * scale
  const edgeH = edgeThickness * scale

  const width = 80
  const height = 60
  const cx = width / 2
  const cy = height / 2

  // Draw lens profile
  const leftEdgeTop = cy - edgeH / 2
  const leftEdgeBottom = cy + edgeH / 2
  const centerTop = cy - centerH / 2
  const centerBottom = cy + centerH / 2
  const rightEdgeTop = cy - edgeH / 2
  const rightEdgeBottom = cy + edgeH / 2

  const path = isMinus
    ? // Minus lens: thin center, thick edges
      `M 10,${leftEdgeTop} Q ${cx},${centerTop} ${width - 10},${rightEdgeTop}
       L ${width - 10},${rightEdgeBottom} Q ${cx},${centerBottom} 10,${leftEdgeBottom} Z`
    : // Plus lens: thick center, thin edges
      `M 10,${leftEdgeTop} Q ${cx},${centerTop} ${width - 10},${rightEdgeTop}
       L ${width - 10},${rightEdgeBottom} Q ${cx},${centerBottom} 10,${leftEdgeBottom} Z`

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-20 h-auto"
        aria-hidden="true"
      >
        <path
          d={path}
          fill={color}
          fillOpacity={0.15}
          stroke={color}
          strokeWidth={1.5}
        />
        {/* Center thickness line */}
        <line
          x1={cx} y1={centerTop} x2={cx} y2={centerBottom}
          stroke={color} strokeWidth={0.8} strokeDasharray="2 1"
        />
        {/* Edge thickness line (left) */}
        <line
          x1={12} y1={leftEdgeTop} x2={12} y2={leftEdgeBottom}
          stroke={color} strokeWidth={0.8} strokeDasharray="2 1"
        />
      </svg>
      <div className="flex justify-between w-full max-w-20 text-[10px] text-muted-foreground mt-1">
        <span>{edgeThickness}mm</span>
        <span>{centerThickness}mm</span>
      </div>
    </div>
  )
}
