'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { UserRole } from '@/lib/constants'
import { getJwtClaims, mapRoleCodeToUserRole } from '@/lib/auth/jwt-claims'
import { buildGatewayLogoutUrl, getGatewayUrl } from '@/lib/auth/sso'

interface UserProfile {
  id: string
  email: string
  nome: string
  papel: UserRole
  role_code: string | null
  ativo: boolean
  tenant_id: string | null
  store_id: string | null
  tenant_name: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string; success?: boolean }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const buildProfileFromSession = (
    userId: string,
    email: string,
    session: import('@supabase/supabase-js').Session | null
  ): UserProfile | null => {
    const claims = getJwtClaims(session)
    if (!claims.tenant_id) return null

    return {
      id: userId,
      email,
      nome: claims.full_name || email.split('@')[0],
      papel: mapRoleCodeToUserRole(claims.role_code),
      role_code: claims.role_code,
      ativo: true,
      tenant_id: claims.tenant_id,
      store_id: claims.store_id,
      tenant_name: claims.tenant_name,
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    const { data: { session } } = await supabase.auth.getSession()
    const profileData = buildProfileFromSession(user.id, user.email || '', session)
    setProfile(profileData)
  }

  const signIn = async (_email: string, _password: string) => {
    return {
      error:
        'Login direto desabilitado. Use o Clearix Hub (NEXT_PUBLIC_SIS_GATEWAY_URL) para autenticar.',
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)

    const gatewayUrl = getGatewayUrl()
    if (!gatewayUrl) {
      throw new Error('Clearix Hub nao configurado. Defina NEXT_PUBLIC_SIS_GATEWAY_URL.')
    }

    window.location.href = buildGatewayLogoutUrl(gatewayUrl)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const profileData = buildProfileFromSession(session.user.id, session.user.email || '', session)
        setProfile(profileData)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const profileData = buildProfileFromSession(session.user.id, session.user.email || '', session)
        setProfile(profileData)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
