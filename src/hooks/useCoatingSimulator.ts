'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  COATING_LAYERS,
  combineCssFilters,
  type CoatingId,
} from '@/lib/optics/coating-simulator'

export interface CoatingSimulatorState {
  /** Set of active coating IDs */
  activeIds: Set<string>
  /** Combined CSS filter string for active coatings */
  cssFilter: string
  /** Toggle a specific coating on/off */
  toggle: (id: CoatingId) => void
  /** Reset to default on/off states */
  resetDefaults: () => void
  /** Enable all coatings */
  enableAll: () => void
  /** Disable all coatings */
  disableAll: () => void
  /** Check if a coating is active */
  isActive: (id: string) => boolean
}

function getDefaultIds(): Set<string> {
  return new Set(
    COATING_LAYERS.filter((c) => c.defaultOn).map((c) => c.id)
  )
}

export function useCoatingSimulator(): CoatingSimulatorState {
  const [activeIds, setActiveIds] = useState<Set<string>>(getDefaultIds)

  const toggle = useCallback((id: CoatingId) => {
    setActiveIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const resetDefaults = useCallback(() => {
    setActiveIds(getDefaultIds())
  }, [])

  const enableAll = useCallback(() => {
    setActiveIds(new Set(COATING_LAYERS.map((c) => c.id)))
  }, [])

  const disableAll = useCallback(() => {
    setActiveIds(new Set())
  }, [])

  const isActive = useCallback(
    (id: string) => activeIds.has(id),
    [activeIds]
  )

  const cssFilter = useMemo(() => combineCssFilters(activeIds), [activeIds])

  return {
    activeIds,
    cssFilter,
    toggle,
    resetDefaults,
    enableAll,
    disableAll,
    isActive,
  }
}
