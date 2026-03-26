import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getJwtClaims, mapRoleCodeToUserRole, getRoleLabel, isSuperAdmin } from '@/lib/auth/jwt-claims'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const claims = getJwtClaims(session)
    const userRole = mapRoleCodeToUserRole(claims.role_code)
    const roleLabel = getRoleLabel(claims.role_code)

    return NextResponse.json({
      id: claims.sub,
      email: claims.email,
      full_name: claims.full_name,
      tenant_id: claims.tenant_id,
      tenant_name: claims.tenant_name,
      store_id: claims.store_id,
      role_code: claims.role_code,
      role: userRole,
      role_label: roleLabel,
      is_super_admin: isSuperAdmin(claims.role_code),
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
