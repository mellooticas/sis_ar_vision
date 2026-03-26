'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface SidebarContextValue {
  isCollapsed: boolean
  toggleCollapse: () => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('clearix-ar-vision-sidebar-collapsed')
    if (saved === 'true') setIsCollapsed(true)
    setHydrated(true)
  }, [])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev
      localStorage.setItem('clearix-ar-vision-sidebar-collapsed', String(next))
      return next
    })
  }, [])

  const value: SidebarContextValue = {
    isCollapsed: hydrated ? isCollapsed : false,
    toggleCollapse,
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
