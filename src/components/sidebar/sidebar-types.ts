export type UserRole = 'super_admin' | 'admin' | 'rh_manager' | 'manager' | 'staff'

export interface NavItem {
  id: string
  label: string
  href: string
  icon: string
  roles: UserRole[]
  badge?: string
  children?: NavChild[]
}

export interface NavChild {
  id: string
  label: string
  href: string
  icon: string
}

export interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

export interface SidebarState {
  collapsed: boolean
  mobileOpen: boolean
}
