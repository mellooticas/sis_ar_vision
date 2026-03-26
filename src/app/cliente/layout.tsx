'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider } from '@/contexts/auth-context'
import { InactivityGuard } from '@/components/cliente/InactivityGuard'
import { useClientSessionStore } from '@/store/client-session-store'
import { ClearixIcon } from '@/components/brand/ClearixLogo'

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const reset = useClientSessionStore((s) => s.reset)

  const handleInactivityReset = useCallback(() => {
    reset()
    router.push('/cliente')
  }, [reset, router])

  return (
    <AuthProvider>
      <InactivityGuard onReset={handleInactivityReset}>
        <div className="flex min-h-screen flex-col bg-background">
          {/* Minimal header */}
          <header className="flex h-14 shrink-0 items-center justify-center border-b px-4">
            <div className="flex items-center gap-2">
              <ClearixIcon size={28} accent="#D946EF" />
              <span className="text-sm font-bold tracking-tight">Clearix AR & Vision</span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </InactivityGuard>
    </AuthProvider>
  )
}
