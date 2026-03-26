'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useClientSessionStore } from '@/store/client-session-store'
import { Button } from '@/components/ui/button'
import { CheckCircle2, RotateCcw, Bell } from 'lucide-react'

export default function ClienteResumoPage() {
  const router = useRouter()
  const {
    patientName,
    faceShape,
    pdResult,
    fittingHeight,
    captures,
    reset,
  } = useClientSessionStore()

  const handleReset = useCallback(() => {
    reset()
    router.push('/cliente')
  }, [reset, router])

  return (
    <div className="flex flex-1 flex-col items-center p-6 max-w-lg mx-auto">
      {/* Success header */}
      <div className="text-center mb-8 mt-8">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
        <h1 className="text-3xl font-bold font-heading mb-2">Tudo Pronto!</h1>
        <p className="text-muted-foreground">
          {patientName}, aqui esta o resumo da sua sessao
        </p>
      </div>

      {/* Results summary */}
      <div className="w-full space-y-3 mb-8">
        {faceShape && (
          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <span className="text-sm font-medium">Formato do Rosto</span>
            <span className="text-sm text-primary font-semibold capitalize">{faceShape.shape}</span>
          </div>
        )}

        {pdResult && (
          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <span className="text-sm font-medium">Distancia Pupilar (PD)</span>
            <span className="text-sm font-semibold">{pdResult.value} mm</span>
          </div>
        )}

        {fittingHeight && (
          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <span className="text-sm font-medium">Altura de Montagem</span>
            <span className="text-sm font-semibold">
              OD: {fittingHeight.rightEye}mm / OE: {fittingHeight.leftEye}mm
            </span>
          </div>
        )}

        {captures.length > 0 && (
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-medium mb-2">Fotos Capturadas ({captures.length})</p>
            <div className="flex gap-2 overflow-x-auto">
              {captures.map((c) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={c.id}
                  src={c.localUrl}
                  alt="Captura"
                  className="h-16 w-20 shrink-0 rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {!faceShape && !pdResult && !fittingHeight && captures.length === 0 && (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nenhuma medicao realizada nesta sessao
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="w-full space-y-3">
        <Button size="lg" className="w-full" onClick={handleReset}>
          <Bell className="mr-2 h-5 w-5" />
          Chamar Atendente
        </Button>
        <Button variant="outline" size="lg" className="w-full" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Nova Sessao
        </Button>
      </div>
    </div>
  )
}
