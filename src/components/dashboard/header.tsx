'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import {
  Menu as MenuIcon,
  User,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useSidebar } from '@/contexts/sidebar-context'
import { getRoleLabel, isSuperAdmin } from '@/lib/auth/jwt-claims'

const routeMeta: Record<string, { label: string; description: string }> = {
  '/dashboard': { label: 'Dashboard', description: 'Visao geral da prova virtual' },
  '/dashboard/try-on': { label: 'Prova Virtual', description: 'Experimentar armacoes com AR' },
  '/dashboard/medir-pd': { label: 'Medir PD', description: 'Medicao de distancia interpupilar' },
  '/dashboard/catalogo': { label: 'Catalogo', description: 'Armacoes disponiveis' },
  '/dashboard/configuracoes': { label: 'Configuracoes', description: 'Configuracoes do sistema' },
}

function getRouteMeta(pathname: string) {
  if (routeMeta[pathname]) return routeMeta[pathname]
  const sorted = Object.keys(routeMeta).sort((a, b) => b.length - a.length)
  for (const key of sorted) {
    if (pathname.startsWith(key + '/')) return routeMeta[key]
  }
  return { label: 'Dashboard', description: 'Clearix AR & Vision' }
}

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const { isCollapsed, toggleCollapse } = useSidebar()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const meta = getRouteMeta(pathname)
  const userName = profile?.nome || 'Usuario'
  const userRoleLabel = getRoleLabel(profile?.role_code ?? null) || 'Usuario'
  const isSuperUser = isSuperAdmin(profile?.role_code ?? null)
  const tenantName = profile?.tenant_name

  const userInitials = userName
    .split(' ')
    .filter((n: string) => n.length > 0)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  const handleLogout = () => {
    setMenuOpen(false)
    signOut()
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-xl px-4 shadow-sm sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button type="button" onClick={onMenuClick} className="p-2 text-foreground lg:hidden" aria-label="Abrir menu">
          <MenuIcon className="h-5 w-5" />
        </button>

        <button type="button" onClick={toggleCollapse} className="hidden p-2 text-muted-foreground hover:text-foreground transition-colors lg:inline-flex" aria-label={isCollapsed ? 'Expandir' : 'Recolher'}>
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Clearix</p>
          <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">{meta.label}</h1>
        </div>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-accent transition-colors"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 text-sm font-bold text-white shadow-lg">
            {userInitials}
          </div>
          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate text-sm font-semibold text-foreground flex items-center gap-1.5">
              {userName}
              {isSuperUser && (
                <span className="inline-flex items-center rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 px-1.5 py-0.5 text-[10px] font-bold text-fuchsia-700 dark:text-fuchsia-400 ring-1 ring-inset ring-fuchsia-400/30">
                  SA
                </span>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">{userRoleLabel}</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg z-50">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{userName}</p>
              <p className="mt-0.5 text-xs text-fuchsia-600 dark:text-fuchsia-400">{userRoleLabel}</p>
              {tenantName && (
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tenantName}</p>
              )}
            </div>

            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  window.location.href = '/dashboard/configuracoes'
                }}
                className="flex w-full items-center gap-3 px-4 py-2 text-foreground hover:bg-accent transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="text-sm">Meu Perfil</span>
              </button>
            </div>

            <div className="border-t border-border">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-semibold">Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
