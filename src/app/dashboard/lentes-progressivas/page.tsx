'use client'

import { useState, useMemo } from 'react'
import { Focus } from 'lucide-react'
import { ProgressiveZonesOverlay } from '@/components/ar/ProgressiveZonesOverlay'
import {
  calculateProgressiveZones,
  type ProgressiveDesign,
} from '@/lib/optics/progressive-zones'

const DESIGNS: { id: ProgressiveDesign; label: string }[] = [
  { id: 'basico', label: 'Basico' },
  { id: 'premium', label: 'Premium' },
  { id: 'avancado', label: 'Avancado' },
]

const ADD_STEPS = Array.from({ length: 12 }, (_, i) => 0.75 + i * 0.25)

export default function LentesProgressivasPage() {
  const [addPower, setAddPower] = useState(2.0)
  const [design, setDesign] = useState<ProgressiveDesign>('premium')
  const [compareDesign, setCompareDesign] = useState<ProgressiveDesign>('basico')

  const result = useMemo(() => calculateProgressiveZones(design, addPower), [design, addPower])
  const compareResult = useMemo(() => calculateProgressiveZones(compareDesign, addPower), [compareDesign, addPower])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Focus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Lentes Progressivas</h1>
            <p className="text-sm text-muted-foreground">
              Visualize as zonas de visao e compare designs de lentes progressivas
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* ADD slider */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Adicao (ADD): <span className="font-mono font-semibold text-foreground">+{addPower.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={75}
              max={350}
              step={25}
              value={addPower * 100}
              onChange={(e) => setAddPower(Number(e.target.value) / 100)}
              className="w-full accent-primary"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">+0.75</span>
              <span className="text-[10px] text-muted-foreground">+2.00</span>
              <span className="text-[10px] text-muted-foreground">+3.50</span>
            </div>
          </div>

          {/* Design selector */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Design da Lente</p>
            <div className="flex gap-2">
              {DESIGNS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDesign(d.id)}
                  className={[
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    design === d.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-accent/50',
                  ].join(' ')}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Primary design */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">{result.designLabel}</h2>
            <span className="text-xs text-muted-foreground font-mono">
              Corredor: {result.corridorWidthMm}mm
            </span>
          </div>
          <div className="flex justify-center">
            <ProgressiveZonesOverlay
              zones={result.zones}
              width={200}
              height={300}
              className="h-64 w-auto"
            />
          </div>
          <div className="mt-4 space-y-1">
            {result.zones.map((zone) => (
              <div key={zone.id} className="flex items-center gap-2 text-xs">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: zone.color, opacity: 0.6 }}
                />
                <span className="font-medium">{zone.name}</span>
                <span className="text-muted-foreground">
                  — Largura: {Math.round(zone.width * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Compare design */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              {DESIGNS.filter((d) => d.id !== design).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setCompareDesign(d.id)}
                  className={[
                    'rounded-md border px-2 py-1 text-xs font-medium transition-colors',
                    compareDesign === d.id
                      ? 'border-primary/50 bg-primary/5 text-primary'
                      : 'border-border hover:bg-accent/50',
                  ].join(' ')}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Corredor: {compareResult.corridorWidthMm}mm
            </span>
          </div>
          <div className="flex justify-center">
            <ProgressiveZonesOverlay
              zones={compareResult.zones}
              width={200}
              height={300}
              className="h-64 w-auto"
            />
          </div>
          <div className="mt-4 space-y-1">
            {compareResult.zones.map((zone) => (
              <div key={zone.id} className="flex items-center gap-2 text-xs">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: zone.color, opacity: 0.6 }}
                />
                <span className="font-medium">{zone.name}</span>
                <span className="text-muted-foreground">
                  — Largura: {Math.round(zone.width * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border bg-card p-4 text-xs text-muted-foreground space-y-2">
        <p>
          <strong>Longe (verde):</strong> Zona superior para visao a distancia. Ampla em todos os designs.
        </p>
        <p>
          <strong>Intermediario (amarelo):</strong> Corredor central para computador e leitura a meia distancia. Designs premium oferecem corredor mais largo.
        </p>
        <p>
          <strong>Perto (azul):</strong> Zona inferior para leitura. Estreita em ADD altas — designs avancados compensam com tecnologia free-form individual.
        </p>
      </div>
    </div>
  )
}
