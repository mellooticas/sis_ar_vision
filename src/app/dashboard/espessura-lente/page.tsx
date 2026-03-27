'use client'

import { useState, useMemo } from 'react'
import { Layers, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LensThicknessComparison } from '@/components/lens/LensThicknessComparison'
import { compareLensThickness } from '@/lib/optics/lens-thickness'

const PRESETS = [
  { label: 'Miopia leve', sph: -1.5, cyl: -0.5, dia: 65 },
  { label: 'Miopia alta', sph: -4.0, cyl: -1.5, dia: 65 },
  { label: 'Miopia muito alta', sph: -8.0, cyl: -2.0, dia: 60 },
  { label: 'Hipermetropia', sph: 3.0, cyl: 0, dia: 65 },
  { label: 'Hipermetropia alta', sph: 5.0, cyl: -1.0, dia: 60 },
  { label: 'Presbiopia', sph: 1.0, cyl: -0.5, dia: 65 },
]

export default function EspessuraLentePage() {
  const [sph, setSph] = useState(-2.0)
  const [cyl, setCyl] = useState(-0.5)
  const [diameter, setDiameter] = useState(65)
  const [showResult, setShowResult] = useState(false)

  const comparison = useMemo(() => {
    if (!showResult) return null
    return compareLensThickness(sph, cyl, diameter)
  }, [showResult, sph, cyl, diameter])

  const handleCompare = () => {
    setShowResult(true)
  }

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setSph(preset.sph)
    setCyl(preset.cyl)
    setDiameter(preset.dia)
    setShowResult(false)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Espessura de Lente</h1>
            <p className="text-sm text-muted-foreground">
              Compare a espessura entre diferentes materiais para ajudar o cliente na escolha
            </p>
          </div>
        </div>
      </div>

      {/* Prescription Input */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-sm font-semibold mb-4">Receita do Paciente</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Esf. (SPH)
            </label>
            <input
              type="number"
              step={0.25}
              value={sph}
              onChange={(e) => { setSph(Number(e.target.value)); setShowResult(false) }}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="-2.00"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Cil. (CYL)
            </label>
            <input
              type="number"
              step={0.25}
              value={cyl}
              onChange={(e) => { setCyl(Number(e.target.value)); setShowResult(false) }}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="-0.50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Diametro (mm)
            </label>
            <input
              type="number"
              step={1}
              min={50}
              max={80}
              value={diameter}
              onChange={(e) => { setDiameter(Number(e.target.value)); setShowResult(false) }}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="65"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleCompare} className="flex-1 min-w-32">
            Comparar Materiais
          </Button>
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset)}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {comparison && (
        <>
          <LensThicknessComparison comparison={comparison} />

          {/* Thickness bar chart */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-sm font-semibold mb-4">Comparativo Visual</h2>
            <div className="space-y-3">
              {comparison.results.map((result, i) => {
                const maxAll = Math.max(...comparison.results.map((r) => r.maxThickness))
                const barWidth = maxAll > 0 ? (result.maxThickness / maxAll) * 100 : 0
                const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']

                return (
                  <div key={result.material.id} className="flex items-center gap-3">
                    <div className="w-28 shrink-0 text-right">
                      <p className="text-sm font-medium">{result.material.name}</p>
                      <p className="text-[10px] text-muted-foreground">Indice {result.material.index}</p>
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-8 rounded-md bg-muted/30 overflow-hidden">
                        <div
                          className="h-full rounded-md transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${barWidth}%`, backgroundColor: colors[i], opacity: 0.7 }}
                        >
                          <span className="text-xs font-bold text-white drop-shadow-sm">
                            {result.maxThickness}mm
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">~{result.weight}g</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Material details table */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Detalhes dos Materiais</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">Material</th>
                    <th className="pb-2 pr-4">Indice</th>
                    <th className="pb-2 pr-4">Abbe</th>
                    <th className="pb-2 pr-4">Centro</th>
                    <th className="pb-2 pr-4">Borda</th>
                    <th className="pb-2 pr-4">Max</th>
                    <th className="pb-2 pr-4">Peso</th>
                    <th className="pb-2">Custo rel.</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.results.map((result) => (
                    <tr key={result.material.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-4 font-medium">{result.material.name}</td>
                      <td className="py-2.5 pr-4 font-mono">{result.material.index}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{result.material.abbeName}</td>
                      <td className="py-2.5 pr-4 font-mono">{result.centerThickness}mm</td>
                      <td className="py-2.5 pr-4 font-mono">{result.edgeThickness}mm</td>
                      <td className="py-2.5 pr-4 font-mono font-semibold">{result.maxThickness}mm</td>
                      <td className="py-2.5 pr-4">{result.weight}g</td>
                      <td className="py-2.5">
                        <span className="text-xs font-medium">
                          {result.material.priceMultiplier === 1.0
                            ? 'Base'
                            : `${result.material.priceMultiplier}x`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-xl border bg-card p-4 space-y-2 text-xs text-muted-foreground">
            <p><strong>Abbe:</strong> Quanto maior o numero de Abbe, menor a dispersao cromatica (aberracao). CR-39 tem melhor nitidez optica, policarbonato tem a pior.</p>
            <p><strong>Dica:</strong> Para graus acima de -4.00, materiais com indice 1.67+ fazem grande diferenca visual. Para graus baixos, CR-39 oferece a melhor qualidade optica.</p>
            <p><strong>Diametro:</strong> Armacoes maiores precisam de lentes com diametro maior, o que aumenta a espessura nas bordas. Armacoes menores + alto indice = resultado mais fino.</p>
          </div>
        </>
      )}
    </div>
  )
}
