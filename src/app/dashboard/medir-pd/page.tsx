'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { PDMeasurement } from '@/components/pd/PDMeasurement'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PDResult } from '@/lib/ar/pd-calculator'

export default function MedirPdPage() {
  const [mode, setMode] = useState<'iris' | 'card'>('iris')

  const handleComplete = (result: PDResult) => {
    // TODO FASE 5: integrate with patient prescription flow
    console.log('PD measurement complete:', result)
  }

  return (
    <div>
      <PageHeader
        title="Medir Distancia Interpupilar"
        description="Meca a DIP/PD do paciente usando a camera"
      />

      {/* Mode selector */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={mode === 'iris' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('iris')}
        >
          Modo Rapido (Iris)
        </Button>
        <Button
          variant={mode === 'card' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('card')}
        >
          Modo Preciso (Card)
        </Button>
      </div>

      {/* Mode description */}
      <div className={cn(
        'rounded-lg border p-4 mb-6 text-sm',
        mode === 'iris' ? 'bg-primary/5 border-primary/20' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800'
      )}>
        {mode === 'iris' ? (
          <p>
            <strong>Modo Rapido:</strong> Usa o diametro da iris como referencia (media: 11.7mm).
            Precisao de +/- 1-2mm. Ideal para triagem rapida.
          </p>
        ) : (
          <p>
            <strong>Modo Preciso:</strong> Usa um cartao de referencia (cartao de credito ou similar) para calibracao.
            Precisao de +/- 0.5mm. Ideal para prescricoes.
          </p>
        )}
      </div>

      {/* PD Measurement component */}
      <div className="max-w-lg mx-auto">
        <PDMeasurement
          key={mode}
          mode={mode}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
