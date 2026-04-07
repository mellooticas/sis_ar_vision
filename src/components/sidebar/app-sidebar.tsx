'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { icons, X, Moon, Sun } from 'lucide-react'
import { ClearixIcon } from '@/components/brand/ClearixLogo'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/ThemeContext'
import { useSidebar } from './sidebar-context'
import { getFilteredNavigation, mapArVisionRoleToCanonical } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { getRoleLabel } from '@/lib/auth/jwt-claims'
import type { NavSection, NavChild } from './sidebar-types'
import type { LucideIcon } from 'lucide-react'

// -- Icon resolver --
function getIcon(name: string): LucideIcon {
  const pascal = name
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  return (icons as Record<string, LucideIcon>)[pascal] || icons['Circle']
}

// -- App config --
const APP_ACCENT = '#D946EF'
const APP_TITLE = 'AR Vision'
const APP_KICKER = 'Clearix'

// -- Component --
export function AppSidebar() {
  const pathname = usePathname()
  const { profile } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()
  const { collapsed, mobileOpen, closeMobile } = useSidebar()
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)
  const isDark = resolvedTheme === 'dark'

  // -- Filtered navigation --
  const sections = useMemo(() => {
    const localRole = profile?.papel || 'atendente'
    const canonicalRole = mapArVisionRoleToCanonical(localRole)
    return getFilteredNavigation(canonicalRole)
  }, [profile?.papel])

  // -- Expanded sections persistence --
  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem('clearix-ar-vision-sidebar-expanded')
    if (saved) {
      try { setExpandedSections(JSON.parse(saved)) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (isClient) localStorage.setItem('clearix-ar-vision-sidebar-expanded', JSON.stringify(expandedSections))
  }, [expandedSections, isClient])

  // Auto-expand section with active child
  useEffect(() => {
    sections.forEach(section => {
      section.items.forEach(item => {
        if (item.children?.some(c => pathname === c.href)) {
          if (!expandedSections.includes(item.id)) {
            setExpandedSections(prev => [...prev, item.id])
          }
        }
      })
    })
  }, [pathname, sections])

  // Close mobile on navigation
  useEffect(() => { if (mobileOpen) closeMobile() }, [pathname])

  const toggleSection = (id: string) => {
    setExpandedSections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(`${href}/`)
  }
  const isExpanded = (id: string) => expandedSections.includes(id)

  const userInitials = profile?.nome
    ?.split(' ')
    .filter((n: string) => n.length > 0)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  const roleLabel = getRoleLabel(profile?.role_code ?? null) || 'Usuario'

  // -- Render helpers --
  const renderNavItem = (item: NavSection['items'][0], inCollapsed: boolean, isMobile: boolean) => {
    const Icon = getIcon(item.icon)

    if (item.children && item.children.length > 0) {
      return renderExpandableItem(item, item.children, Icon, inCollapsed, isMobile)
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={isMobile ? closeMobile : undefined}
        title={inCollapsed ? item.label : undefined}
        className={cn(
          'flex items-center rounded-lg transition-colors',
          inCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5 text-sm font-medium'
        )}
        style={
          isActive(item.href)
            ? { backgroundColor: 'color-mix(in srgb, var(--sidebar-primary) 12%, transparent)', color: 'var(--sidebar-primary)' }
            : undefined
        }
        onMouseEnter={(e) => { if (!isActive(item.href)) { e.currentTarget.style.backgroundColor = 'var(--sidebar-accent)'; e.currentTarget.style.color = 'var(--sidebar-accent-foreground)' } }}
        onMouseLeave={(e) => { if (!isActive(item.href)) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '' } }}
      >
        <span style={isActive(item.href) ? { color: 'var(--sidebar-primary)' } : { opacity: 0.6 }}>
          <Icon className="h-5 w-5 shrink-0" />
        </span>
        {!inCollapsed && <span>{item.label}</span>}
        {!inCollapsed && item.badge && (
          <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}>
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  const renderExpandableItem = (item: NavSection['items'][0], children: NavChild[], ParentIcon: LucideIcon, inCollapsed: boolean, isMobile: boolean) => {
    const hasActiveChild = children.some(c => isActive(c.href))

    if (inCollapsed) {
      return (
        <div key={item.id}>
          <div className="mx-auto my-3 h-px w-8" style={{ backgroundColor: 'var(--sidebar-border)' }} />
          {children.map(child => {
            const ChildIcon = getIcon(child.icon)
            return (
              <Link
                key={child.id}
                href={child.href}
                onClick={isMobile ? closeMobile : undefined}
                title={child.label}
                className="flex items-center justify-center rounded-lg p-3 transition-colors"
                style={isActive(child.href) ? { backgroundColor: 'color-mix(in srgb, var(--sidebar-primary) 12%, transparent)', color: 'var(--sidebar-primary)' } : undefined}
                onMouseEnter={(e) => { if (!isActive(child.href)) { e.currentTarget.style.backgroundColor = 'var(--sidebar-accent)'; e.currentTarget.style.color = 'var(--sidebar-accent-foreground)' } }}
                onMouseLeave={(e) => { if (!isActive(child.href)) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '' } }}
              >
                <span style={isActive(child.href) ? { color: 'var(--sidebar-primary)' } : { opacity: 0.6 }}>
                  <ChildIcon className="h-5 w-5 shrink-0" />
                </span>
              </Link>
            )
          })}
        </div>
      )
    }

    return (
      <div key={item.id}>
        <button
          onClick={() => toggleSection(item.id)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mt-1"
          style={hasActiveChild ? { backgroundColor: 'color-mix(in srgb, var(--sidebar-primary) 12%, transparent)', color: 'var(--sidebar-primary)' } : undefined}
          onMouseEnter={(e) => { if (!hasActiveChild) { e.currentTarget.style.backgroundColor = 'var(--sidebar-accent)'; e.currentTarget.style.color = 'var(--sidebar-accent-foreground)' } }}
          onMouseLeave={(e) => { if (!hasActiveChild) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '' } }}
        >
          <span style={hasActiveChild ? { color: 'var(--sidebar-primary)' } : { opacity: 0.6 }}>
            <ParentIcon className="h-5 w-5 shrink-0" />
          </span>
          <span className="flex-1 text-left">{item.label}</span>
          <span className="text-xs opacity-50">{children.length}</span>
          <svg className={cn('h-4 w-4 transition-transform duration-200', isExpanded(item.id) ? 'rotate-90' : '')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className={cn('overflow-hidden transition-all duration-300 ease-in-out', isExpanded(item.id) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0')}>
          <div className="mt-1 space-y-0.5 pl-4">
            {children.map(child => {
              const ChildIcon = getIcon(child.icon)
              return (
                <Link
                  key={child.id}
                  href={child.href}
                  onClick={isMobile ? closeMobile : undefined}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  style={isActive(child.href) ? { backgroundColor: 'color-mix(in srgb, var(--sidebar-primary) 12%, transparent)', color: 'var(--sidebar-primary)' } : undefined}
                  onMouseEnter={(e) => { if (!isActive(child.href)) { e.currentTarget.style.backgroundColor = 'var(--sidebar-accent)'; e.currentTarget.style.color = 'var(--sidebar-accent-foreground)' } }}
                  onMouseLeave={(e) => { if (!isActive(child.href)) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '' } }}
                >
                  <span style={isActive(child.href) ? { color: 'var(--sidebar-primary)' } : { opacity: 0.6 }}>
                    <ChildIcon className="h-4 w-4 shrink-0" />
                  </span>
                  <span>{child.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // -- Sidebar content --
  const sidebarContent = (isCollapsed: boolean, isMobile = false) => (
    <div
      className="flex h-full grow flex-col overflow-y-auto border-r"
      style={{
        backgroundColor: 'var(--sidebar)',
        borderColor: 'var(--sidebar-border)',
        color: 'var(--sidebar-foreground)',
      }}
    >
      {/* Header / Brand */}
      <div
        className={cn('flex h-16 shrink-0 items-center border-b', isCollapsed ? 'justify-center px-3' : 'justify-between px-4')}
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <Link href="/dashboard" onClick={isMobile ? closeMobile : undefined} className={cn('flex items-center', !isCollapsed && 'gap-3')}>
          <ClearixIcon size={36} accent={APP_ACCENT} />
          {!isCollapsed && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] opacity-50">{APP_KICKER}</p>
              <p className="text-lg font-black tracking-tight">{APP_TITLE}</p>
            </div>
          )}
        </Link>
        {isMobile && (
          <button onClick={closeMobile} className="rounded-lg p-2 opacity-60 hover:opacity-100 transition-opacity" aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map(section => (
          <div key={section.id} className="mb-4">
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider opacity-40">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map(item => renderNavItem(item, isCollapsed, isMobile))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn('border-t p-3 space-y-2', isCollapsed && 'items-center')} style={{ borderColor: 'var(--sidebar-border)' }}>
        <button
          type="button"
          onClick={toggleTheme}
          className={cn('flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity', isCollapsed ? 'justify-center px-0' : 'px-3')}
          aria-label={isDark ? 'Modo Claro' : 'Modo Escuro'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!isCollapsed && <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </button>
        <div className={cn('flex items-center gap-3 rounded-lg px-3 py-2', isCollapsed && 'justify-center px-0')} title={isCollapsed ? (profile?.nome || 'Usuario') : undefined}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: 'var(--sidebar-primary)', color: 'var(--sidebar-primary-foreground)' }}>
            {userInitials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profile?.nome || 'Usuario'}</p>
              <p className="truncate text-xs opacity-60">{roleLabel}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      <div className={cn('fixed inset-0 z-50 lg:hidden transition-opacity duration-300', mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMobile} />
        <div className={cn('fixed inset-y-0 left-0 w-72 transform transition-transform duration-300 ease-in-out', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
          {sidebarContent(false, true)}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={cn('hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300', collapsed ? 'lg:w-[72px]' : 'lg:w-64')}>
        {sidebarContent(collapsed)}
      </div>
    </>
  )
}
