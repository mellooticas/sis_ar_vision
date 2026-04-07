'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Pagina nao encontrada
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          A pagina que voce esta procurando nao existe.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg transition-colors font-medium text-sm hover:opacity-90"
          >
            Ir para Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 bg-muted text-foreground rounded-lg transition-colors text-sm hover:bg-accent"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
