// ============================================
// SSO HELPERS - Clearix AR & Vision
// ============================================
// Constantes e helpers para SSO V2 (ticket exchange) com Clearix Hub.
// Padrao compartilhado entre todos os apps Clearix.

export const SSO_APP_KEY = 'clearix_ar_vision'
export const SSO_APP_KEY_PARAM = 'app_key'
export const SSO_LEGACY_APP_PARAM = 'app'
export const SSO_TICKET_PARAM = 'ticket'
export const SSO_DEFAULT_NEXT = '/dashboard'
export const SSO_CALLBACK_PATH = '/auth/callback'

export function getGatewayUrl(): string {
  return process.env.NEXT_PUBLIC_SIS_GATEWAY_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || ''
}

export function normalizeSsoNext(next?: string | null, fallback = SSO_DEFAULT_NEXT): string {
  if (!next) return fallback

  if (
    next.startsWith('/') &&
    !next.startsWith('/auth') &&
    !next.includes("'") &&
    !next.includes('"')
  ) {
    return next
  }

  return fallback
}

export function buildAppAbsoluteUrl(appUrlOrOrigin: string, next = SSO_DEFAULT_NEXT): string {
  return new URL(normalizeSsoNext(next), appUrlOrOrigin).toString()
}

function attachCanonicalAppParams(url: URL) {
  url.searchParams.set(SSO_LEGACY_APP_PARAM, SSO_APP_KEY)
  url.searchParams.set(SSO_APP_KEY_PARAM, SSO_APP_KEY)
}

export function buildGatewayLoginUrl(
  gatewayUrl: string,
  appUrlOrOrigin: string,
  next = SSO_DEFAULT_NEXT
): string {
  const ssoUrl = new URL('/login', gatewayUrl)
  const safeNext = normalizeSsoNext(next)

  attachCanonicalAppParams(ssoUrl)
  ssoUrl.searchParams.set('next', safeNext)
  ssoUrl.searchParams.set('returnTo', buildAppAbsoluteUrl(appUrlOrOrigin, safeNext))
  return ssoUrl.toString()
}

export function buildGatewayLogoutUrl(gatewayUrl: string): string {
  const ssoUrl = new URL('/logout', gatewayUrl)
  attachCanonicalAppParams(ssoUrl)
  return ssoUrl.toString()
}
