'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isChunkError =
    error.message?.toLowerCase().includes('chunk') ||
    error.message?.toLowerCase().includes('loading') ||
    error.name === 'ChunkLoadError'

  const handleReload = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('_cr', String(Date.now()))
    window.location.replace(url.toString())
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-foreground mb-2">
          {isChunkError ? 'Atualizando versao...' : 'Erro ao carregar pagina'}
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          {isChunkError
            ? 'Uma nova versao foi publicada. Recarregue para atualizar.'
            : error.message || 'Ocorreu um erro inesperado.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReload}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-lg transition-colors font-medium text-sm hover:opacity-90"
          >
            Recarregar Pagina
          </button>
          <button
            onClick={() => reset()}
            className="px-5 py-2 bg-muted text-foreground rounded-lg transition-colors text-sm hover:bg-accent"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  )
}
