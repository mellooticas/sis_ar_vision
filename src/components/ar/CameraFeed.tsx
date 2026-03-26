'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CameraFeedProps {
  className?: string
  mirrored?: boolean
}

/**
 * Renders a <video> element for the camera stream.
 * The video ref must be passed from the parent (via useCamera).
 */
const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(
  ({ className, mirrored = true }, ref) => {
    return (
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className={cn(
          'h-full w-full object-cover',
          mirrored && 'scale-x-[-1]',
          className
        )}
      />
    )
  }
)
CameraFeed.displayName = 'CameraFeed'

export { CameraFeed }
