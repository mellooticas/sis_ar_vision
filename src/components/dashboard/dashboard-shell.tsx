'use client'

import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { DashboardHeader } from './header'
import { useSidebar } from '@/components/sidebar/sidebar-context'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed, openMobile } = useSidebar()

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <AppSidebar />
      <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>
        <DashboardHeader onMenuClick={openMobile} />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
