export const APP_NAME = 'Clearix AR & Vision'
export const APP_VERSION = '0.1.0'

export const USER_ROLES = {
  ADMIN: 'admin',
  MEDICO: 'medico',
  ATENDENTE: 'atendente',
} as const

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CATALOGO: '/dashboard/catalogo',
  TRY_ON: '/dashboard/try-on',
  MEDIR_PD: '/dashboard/medir-pd',
  CONFIGURACOES: '/dashboard/configuracoes',
} as const

export const COLORS = {
  PRIMARY: '#D946EF',
  SUCCESS: '#16a34a',
  WARNING: '#d97706',
  ERROR: '#dc2626',
  INFO: '#0891b2',
  GRAY: '#6b7280',
} as const

export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
} as const
