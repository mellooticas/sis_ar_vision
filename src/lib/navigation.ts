// navigation.ts — Definicao canonica de navegacao do Clearix AR Vision
// Items hardcoded aqui, filtrados por role via getFilteredNavigation()

import type { NavSection, UserRole } from '@/components/sidebar/sidebar-types'

export const APP_NAVIGATION: NavSection[] = [
  {
    id: 'visao-geral',
    label: 'Visao Geral',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: 'home',
        roles: [],
      },
      {
        id: 'try-on',
        label: 'Prova Virtual',
        href: '/dashboard/try-on',
        icon: 'scan-eye',
        roles: [],
      },
      {
        id: 'medir-pd',
        label: 'Medir PD',
        href: '/dashboard/medir-pd',
        icon: 'ruler',
        roles: [],
      },
      {
        id: 'face-shape',
        label: 'Formato do Rosto',
        href: '/dashboard/face-shape',
        icon: 'scan-face',
        roles: [],
      },
      {
        id: 'catalogo',
        label: 'Catalogo',
        href: '/dashboard/catalogo',
        icon: 'shopping-bag',
        roles: [],
      },
    ],
  },
  {
    id: 'ferramentas',
    label: 'Ferramentas',
    items: [
      {
        id: 'espessura-lente',
        label: 'Espessura de Lente',
        href: '/dashboard/espessura-lente',
        icon: 'layers',
        roles: [],
      },
      {
        id: 'comparar',
        label: 'Comparar Armacoes',
        href: '/dashboard/comparar',
        icon: 'git-compare-arrows',
        roles: [],
      },
      {
        id: 'fotos-armacoes',
        label: 'Fotos de Armacoes',
        href: '/dashboard/fotos-armacoes',
        icon: 'camera',
        roles: ['admin', 'staff'],
      },
      {
        id: 'simulador-tratamentos',
        label: 'Simulador de Tratamentos',
        href: '/dashboard/simulador-tratamentos',
        icon: 'sparkles',
        roles: [],
      },
      {
        id: 'lentes-progressivas',
        label: 'Lentes Progressivas',
        href: '/dashboard/lentes-progressivas',
        icon: 'focus',
        roles: [],
      },
      {
        id: 'modo-cliente',
        label: 'Modo Cliente',
        href: '/cliente',
        icon: 'tablet',
        roles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'admin',
    label: 'Administracao',
    items: [
      {
        id: 'configuracoes',
        label: 'Configuracoes',
        href: '/dashboard/configuracoes',
        icon: 'settings',
        roles: ['admin'],
      },
    ],
  },
]

/** Filtra navegacao pelo role do usuario. super_admin ve tudo. roles vazio = todos veem. */
export function getFilteredNavigation(roleCode: UserRole | string): NavSection[] {
  return APP_NAVIGATION
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (item.roles.length === 0) return true
        if (roleCode === 'super_admin') return true
        return item.roles.includes(roleCode as UserRole)
      }),
    }))
    .filter(section => section.items.length > 0)
}

/**
 * Mapeia roles locais do AR Vision (legado) para roles canonicos do ecossistema.
 * AR Vision usa 'admin' | 'medico' | 'atendente' internamente.
 */
export function mapArVisionRoleToCanonical(localRole: string): UserRole {
  switch (localRole) {
    case 'admin': return 'admin'
    case 'medico': return 'manager'
    case 'atendente': return 'staff'
    default: return 'staff'
  }
}
