'use client'

import { Sparkles, RotateCcw, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CoatingToggle } from '@/components/ar/CoatingToggle'
import { PhotochromicSlider } from '@/components/ar/PhotochromicSlider'
import { useCoatingSimulator } from '@/hooks/useCoatingSimulator'

export default function SimuladorTratamentosPage() {
  const coating = useCoatingSimulator()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Simulador de Tratamentos</h1>
            <p className="text-sm text-muted-foreground">
              Demonstre visualmente os tratamentos de lente para o cliente
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Split view */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="grid grid-cols-2">
              {/* Without treatment */}
              <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center">
                  <div className="text-center text-white/80">
                    <X className="h-8 w-8 mx-auto mb-1 opacity-60" />
                    <p className="text-xs font-medium">Sem Tratamento</p>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white font-medium">
                  Antes
                </div>
              </div>

              {/* With treatment */}
              <div className="relative border-l border-border">
                <div
                  className="aspect-[4/3] bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center transition-all duration-500"
                  style={{ filter: coating.cssFilter || 'none' }}
                >
                  <div className="text-center text-white/80">
                    <Check className="h-8 w-8 mx-auto mb-1 opacity-60" />
                    <p className="text-xs font-medium">Com Tratamento</p>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 rounded bg-primary/80 px-2 py-0.5 text-[10px] text-white font-medium">
                  Depois
                </div>
              </div>
            </div>
          </div>

          {/* Active filter info */}
          <div className="rounded-lg border bg-card px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Filtro CSS ativo
            </p>
            <code className="text-xs font-mono text-primary break-all">
              {coating.cssFilter || 'nenhum'}
            </code>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="space-y-6">
          {/* Coating toggles */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Camadas de Tratamento</h2>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={coating.enableAll}
                  className="text-xs h-7"
                >
                  Todos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={coating.resetDefaults}
                  className="text-xs h-7"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
            <CoatingToggle
              activeIds={coating.activeIds}
              onToggle={coating.toggle}
            />
          </div>

          {/* Photochromic section */}
          <div className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold mb-3">Simulacao Fotocromatica</h2>
            <PhotochromicSlider />
          </div>
        </div>
      </div>
    </div>
  )
}
