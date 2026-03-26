'use client'

import { useState, useMemo } from 'react'
import { Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LensThicknessComparison } from '@/components/lens/LensThicknessComparison'
import { compareLensThickness } from '@/lib/optics/lens-thickness'

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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
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

        <div className="mt-4 flex gap-3">
          <Button onClick={handleCompare} className="flex-1">
            Comparar Materiais
          </Button>
          {/* Quick presets */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSph(-4.0); setCyl(-1.5); setShowResult(false) }}
          >
            Miopia alta
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSph(3.0); setCyl(0); setShowResult(false) }}
          >
            Hipermetropia
          </Button>
        </div>
      </div>

      {/* Results */}
      {comparison && (
        <LensThicknessComparison comparison={comparison} />
      )}
    </div>
  )
}
