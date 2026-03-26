import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  buildGatewayLoginUrl,
  getGatewayUrl,
  normalizeSsoNext,
  SSO_APP_KEY,
  SSO_DEFAULT_NEXT,
  SSO_TICKET_PARAM,
} from '@/lib/auth/sso'

function gatewayNotConfiguredResponse() {
  return new NextResponse(
    'Clearix Hub nao configurado. Defina NEXT_PUBLIC_SIS_GATEWAY_URL.',
    {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }
  )
}

function buildGatewayLoginRedirect(request: NextRequest, next = SSO_DEFAULT_NEXT) {
  const gatewayUrl = getGatewayUrl()
  if (!gatewayUrl) return null
  return new URL(buildGatewayLoginUrl(gatewayUrl, request.url, next))
}

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  if (pathname === '/auth/callback') {
    return handleSSOCallback(request)
  }

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/login?') ||
    pathname === '/signup' ||
    pathname.startsWith('/api/')

  if (isPublicRoute) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({
            request: { headers: request.headers },
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, { ...options, path: '/' })
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  if (!user && isProtectedRoute) {
    const appNext = `${pathname}${request.nextUrl.search}`
    const ssoUrl = buildGatewayLoginRedirect(request, appNext)
    if (!ssoUrl) return gatewayNotConfiguredResponse()
    return NextResponse.redirect(ssoUrl)
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isProtectedRoute) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Netlify-CDN-Cache-Control', 'no-store')
    response.headers.set('CDN-Cache-Control', 'no-store')
  }

  return response
}

async function handleSSOCallback(request: NextRequest): Promise<NextResponse> {
  const ticket = request.nextUrl.searchParams.get(SSO_TICKET_PARAM)
  const legacyAccessToken = request.nextUrl.searchParams.get('access_token')
  const legacyRefreshToken = request.nextUrl.searchParams.get('refresh_token')
  let accessToken = legacyAccessToken
  let refreshToken = legacyRefreshToken
  let next = normalizeSsoNext(request.nextUrl.searchParams.get('next'), SSO_DEFAULT_NEXT)

  if (ticket) {
    const exchangedSession = await exchangeSsoTicket(ticket)

    if (!exchangedSession) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'ticket_exchange_failed')
      loginUrl.searchParams.set('next', next)
      return NextResponse.redirect(loginUrl)
    }

    accessToken = exchangedSession.accessToken
    refreshToken = exchangedSession.refreshToken
    next = exchangedSession.next
  }

  if (!accessToken || !refreshToken) {
    const ssoUrl = buildGatewayLoginRedirect(request, SSO_DEFAULT_NEXT)
    if (!ssoUrl) return gatewayNotConfiguredResponse()
    return NextResponse.redirect(ssoUrl)
  }

  const redirectTo = next

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Autenticando...</title></head>
<body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;background:#f8fafc">
<p>Autenticando no Clearix AR &amp; Vision...</p>
<script>window.location.replace('${redirectTo}')</script>
</body>
</html>`

  const response = new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, { ...options, path: '/' })
          })
        },
      },
    }
  )

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

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
