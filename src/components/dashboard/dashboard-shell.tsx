'use client'

import { useState } from 'react'
import { DashboardSidebar } from './sidebar'
import { DashboardHeader } from './header'
import { useSidebar } from '@/contexts/sidebar-context'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
