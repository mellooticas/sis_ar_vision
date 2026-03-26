'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ScanEye,
  Ruler,
  ShoppingBag,
  Settings,
  Moon,
  Sun,
  X,
  ScanFace,
  Layers,
  GitCompareArrows,
  Tablet,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/ThemeContext'
import { useSidebar } from '@/contexts/sidebar-context'
import { ClearixIcon } from '@/components/brand/ClearixLogo'
import { getRoleLabel } from '@/lib/auth/jwt-claims'
import type { UserRole } from '@/lib/constants'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

const navigationSections: NavSection[] = [
  {
    id: 'visao-geral',
    label: 'Visao Geral',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'medico', 'atendente'] },
      { name: 'Prova Virtual', href: '/dashboard/try-on', icon: ScanEye, roles: ['admin', 'medico', 'atendente'] },
      { name: 'Medir PD', href: '/dashboard/medir-pd', icon: Ruler, roles: ['admin', 'medico', 'atendente'] },
      { name: 'Formato do Rosto', href: '/dashboard/face-shape', icon: ScanFace, roles: ['admin', 'medico', 'atendente'] },
      { name: 'Catalogo', href: '/dashboard/catalogo', icon: ShoppingBag, roles: ['admin', 'medico', 'atendente'] },
    ],
  },
  {
    id: 'ferramentas',
    label: 'Ferramentas',
    items: [
      { name: 'Espessura de Lente', href: '/dashboard/espessura-lente', icon: Layers, roles: ['admin', 'medico', 'atendente'] },
      { name: 'Comparar Armacoes', href: '/dashboard/comparar', icon: GitCompareArrows, roles: ['admin', 'medico', 'atendente'] },
      { name: 'Modo Cliente', href: '/cliente', icon: Tablet, roles: ['admin', 'medico'] },
    ],
  },
  {
    id: 'admin',
    label: 'Administracao',
    items: [
      { name: 'Configuracoes', href: '/dashboard/configuracoes', icon: Settings, roles: ['admin'] },
    ],
  },
]

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface DashboardSidebarProps {
  open?: boolean
  onClose?: () => void
}

export function DashboardSidebar({ open = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { profile } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()
  const { isCollapsed } = useSidebar()

  const userRole = (profile?.papel || 'atendente') as UserRole

  const visibleSections = useMemo(() =>
    navigationSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.roles.includes(userRole)),
      }))
      .filter((section) => section.items.length > 0),
    [userRole]
  )

  const userInitials = profile?.nome
    ?.split(' ')
    .filter((n: string) => n.length > 0)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  const roleLabel = getRoleLabel(profile?.role_code ?? null) || 'Usuario'

  const sidebarInner = (isMobile: boolean) => {
    const collapsed = isCollapsed && !isMobile

    return (
      <div
        className="flex h-full flex-col border-r"
        style={{
          backgroundColor: 'var(--sidebar)',
          borderColor: 'var(--sidebar-border)',
          color: 'var(--sidebar-foreground)',
        }}
      >
        {/* Brand */}
        <div
          className={`flex h-16 shrink-0 items-center border-b ${collapsed ? 'justify-center px-3' : 'justify-between px-4'}`}
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
            <ClearixIcon size={36} accent="#D946EF" />
            {!collapsed && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] opacity-50">Clearix</p>
                <p className="text-lg font-black tracking-tight">AR &amp; Vision</p>
              </div>
            )}
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {visibleSections.map((section) => (
            <div key={section.id} className="mt-5 first:mt-0">
              {!collapsed && (
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider opacity-40">
                  {section.label}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={isMobile ? onClose : undefined}
                      title={collapsed ? item.name : undefined}
                      className={[
                        'flex items-center rounded-lg transition-colors',
                        collapsed
                          ? 'justify-center p-3'
                          : 'gap-3 px-3 py-2.5 text-sm font-medium',
                      ].join(' ')}
                      style={
                        active
                          ? { backgroundColor: 'color-mix(in srgb, var(--sidebar-primary) 12%, transparent)', color: 'var(--sidebar-primary)' }
                          : undefined
                      }
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'var(--sidebar-accent)'
                          e.currentTarget.style.color = 'var(--sidebar-accent-foreground)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = ''
                          e.currentTarget.style.color = ''
                        }
                      }}
                    >
                      <span style={active ? { color: 'var(--sidebar-primary)' } : { opacity: 0.6 }}>
                        <item.icon className="h-5 w-5 shrink-0" />
                      </span>
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={`border-t p-3 space-y-2 ${collapsed ? 'items-center' : ''}`}
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            aria-label={resolvedTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span>{resolvedTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
          </button>

          {/* User card */}
          <div
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? profile?.nome || 'Usuario' : undefined}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              style={{ backgroundColor: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}
            >
              {userInitials}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{profile?.nome || 'Usuario'}</p>
                <p className="truncate text-xs opacity-60">{roleLabel}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className={`fixed inset-y-0 left-0 w-72 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          {sidebarInner(true)}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ${isCollapsed ? 'lg:w-18' : 'lg:w-64'}`}>
        {sidebarInner(false)}
      </div>
    </>
  )
}
