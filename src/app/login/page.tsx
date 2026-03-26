'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, ScanEye, ExternalLink } from 'lucide-react'
import {
  buildGatewayLoginUrl,
  getGatewayUrl,
  SSO_DEFAULT_NEXT,
} from '@/lib/auth/sso'

function LoginContent() {
  const searchParams = useSearchParams()
  const ssoError = searchParams.get('error')
  const isLogout = searchParams.get('logout') === 'true'
  const redirectTo =
    searchParams.get('redirectTo') ||
    searchParams.get('next') ||
    SSO_DEFAULT_NEXT
  const gatewayUrl = getGatewayUrl()

  useEffect(() => {
    if (!gatewayUrl || ssoError || isLogout) return
    window.location.href = buildGatewayLoginUrl(gatewayUrl, window.location.origin, redirectTo)
  }, [gatewayUrl, ssoError, isLogout, redirectTo])

  if (!gatewayUrl) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-red-500 p-4 rounded-2xl shadow-sm">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Clearix Hub nao configurado</h1>
          <p className="text-sm text-muted-foreground">
            Defina <code>NEXT_PUBLIC_SIS_GATEWAY_URL</code> para autenticar no ecossistema.
          </p>
        </div>
      </div>
    )
  }

  const errorMessage =
    ssoError === 'missing_tokens'
      ? 'Erro na autenticacao SSO. Tente novamente.'
      : ssoError === 'ticket_exchange_failed'
        ? 'Falha ao validar o ticket SSO no Gateway. Tente novamente.'
        : ssoError === 'session_failed'
          ? 'Falha ao criar sessao local. Tente novamente.'
          : ssoError
            ? 'Erro de autenticacao.'
            : null

  const handleLogin = () => {
    window.location.href = buildGatewayLoginUrl(gatewayUrl, window.location.origin, redirectTo)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-fuchsia-500 p-4 rounded-2xl shadow-sm">
            <ScanEye className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Clearix AR &amp; Vision</h1>

        {isLogout ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">Sessao encerrada com sucesso.</p>
            <button
              onClick={handleLogin}
              className="inline-flex items-center gap-2 px-6 py-3 bg-fuchsia-500 text-white rounded-lg hover:bg-fuchsia-600 transition-colors font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Entrar novamente
            </button>
          </div>
        ) : errorMessage ? (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 text-left">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={handleLogin}
              className="inline-flex items-center gap-2 px-6 py-3 bg-fuchsia-500 text-white rounded-lg hover:bg-fuchsia-600 transition-colors font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Tentar novamente via Clearix Hub
            </button>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground">Redirecionando para autenticacao centralizada...</p>
            <div className="flex justify-center">
              <svg className="animate-spin h-8 w-8 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  )
}
