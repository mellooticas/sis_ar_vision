/**
 * JWT Claims Helper — Extrai custom claims do token Supabase
 *
 * O Clearix Hub injeta claims customizados no JWT durante o login:
 *   - tenant_id, store_id, role_code, full_name, tenant_name
 */

import type { Session } from '@supabase/supabase-js'

export interface JwtClaims {
  sub: string
  email: string
  tenant_id: string | null
  store_id: string | null
  role_code: string
  full_name: string | null
  tenant_name: string | null
}

const DEFAULTS: JwtClaims = {
  sub: '',
  email: '',
  tenant_id: null,
  store_id: null,
  role_code: 'staff',
  full_name: null,
  tenant_name: null,
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    )
    const binaryPayload = atob(paddedPayload)
    const bytes = Uint8Array.from(binaryPayload, (char) => char.charCodeAt(0))
    const jsonPayload = new TextDecoder().decode(bytes)

    return JSON.parse(jsonPayload) as Record<string, unknown>
  } catch {
    return null
  }
}

const VALID_ROLES = ['staff', 'manager', 'gerente', 'admin', 'super_admin', 'admin_view', 'atendimento_oftalmico', 'vendedor'] as const

function normalizeRoleCode(roleCode: string | null | undefined): string {
  if (!roleCode) return 'staff'
  if (roleCode === 'superadmin') return 'super_admin'
  return (VALID_ROLES as readonly string[]).includes(roleCode) ? roleCode : 'staff'
}

export function getJwtClaims(session: Session | null): JwtClaims {
  if (!session?.access_token) return DEFAULTS

  const payload = decodeJwtPayload(session.access_token)
  if (!payload) return DEFAULTS

  return {
    sub: (payload.sub as string) ?? '',
    email: (payload.email as string) ?? '',
    tenant_id: (payload.tenant_id as string) ?? null,
    store_id: (payload.store_id as string) ?? null,
    role_code: normalizeRoleCode(payload.role_code as string | undefined),
    full_name: (payload.full_name as string) ?? null,
    tenant_name: (payload.tenant_name as string) ?? null,
  }
}

export function mapRoleCodeToUserRole(roleCode: string | null): 'admin' | 'medico' | 'atendente' {
  if (!roleCode) return 'atendente'

  const mapping: Record<string, 'admin' | 'medico' | 'atendente'> = {
    super_admin: 'admin',
    admin: 'admin',
    admin_view: 'admin',
    manager: 'medico',
    gerente: 'medico',
    atendimento_oftalmico: 'medico',
    staff: 'atendente',
    vendedor: 'atendente',
  }

  return mapping[roleCode] || 'atendente'
}

export function getRoleLabel(roleCode: string | null): string {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    admin_view: 'Admin (Visualizacao)',
    manager: 'Gerente',
    gerente: 'Gerente',
    atendimento_oftalmico: 'Opto/Oftalmo',
    staff: 'Atendente',
    vendedor: 'Vendedor',
  }

  return labels[roleCode || ''] || 'Atendente'
}

export function isSuperAdmin(roleCode: string | null): boolean {
  return roleCode === 'super_admin'
}

export function hasSsoClaims(session: Session | null): boolean {
  const claims = getJwtClaims(session)
  return claims.tenant_id !== null
}
