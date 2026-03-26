/**
 * /auth/callback — SSO ticket exchange endpoint
 *
 * Fallback route handler caso o middleware nao intercepte
 * (ex: Netlify sem plugin, edge config diferente).
 * O middleware.ts tambem trata esta rota — quem chegar primeiro resolve.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  SSO_APP_KEY,
  SSO_TICKET_PARAM,
  SSO_DEFAULT_NEXT,
  getGatewayUrl,
  normalizeSsoNext,
  buildGatewayLoginUrl,
} from '@/lib/auth/sso'

export const dynamic = 'force-dynamic'

async function exchangeSsoTicket(ticket: string) {
  const gatewayUrl = getGatewayUrl()
  if (!gatewayUrl) return null

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  })

  if (process.env.SSO_EXCHANGE_SHARED_SECRET) {
    headers.set('x-sso-exchange-secret', process.env.SSO_EXCHANGE_SHARED_SECRET)
  }

  const response = await fetch(new URL('/api/sso/exchange', gatewayUrl), {
    method: 'POST',
    headers,
    body: JSON.stringify({ ticket, app_key: SSO_APP_KEY }),
    cache: 'no-store',
  })

  if (!response.ok) return null

  const payload = await response.json().catch(() => null)
  const accessToken = payload?.session?.access_token
  const refreshToken = payload?.session?.refresh_token

  if (!accessToken || !refreshToken) return null

  return {
    accessToken,
    refreshToken,
    next: normalizeSsoNext(payload?.next, SSO_DEFAULT_NEXT),
  }
}

export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get(SSO_TICKET_PARAM)
  const legacyAccessToken = request.nextUrl.searchParams.get('access_token')
  const legacyRefreshToken = request.nextUrl.searchParams.get('refresh_token')
  let accessToken = legacyAccessToken
  let refreshToken = legacyRefreshToken
  let next = normalizeSsoNext(request.nextUrl.searchParams.get('next'), SSO_DEFAULT_NEXT)

  if (ticket) {
    const exchanged = await exchangeSsoTicket(ticket)

    if (!exchanged) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'ticket_exchange_failed')
      loginUrl.searchParams.set('next', next)
      return NextResponse.redirect(loginUrl)
    }

    accessToken = exchanged.accessToken
    refreshToken = exchanged.refreshToken
    next = exchanged.next
  }

  if (!accessToken || !refreshToken) {
    const gatewayUrl = getGatewayUrl()
    if (!gatewayUrl) {
      return new NextResponse('Clearix Hub nao configurado.', { status: 500 })
    }
    return NextResponse.redirect(new URL(buildGatewayLoginUrl(gatewayUrl, request.url, SSO_DEFAULT_NEXT)))
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  if (error) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'session_failed')
    loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.redirect(new URL(next, request.url))
}
