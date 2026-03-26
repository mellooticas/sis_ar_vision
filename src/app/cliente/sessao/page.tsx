'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useClientSessionStore } from '@/store/client-session-store'
import { StepIndicator } from '@/components/cliente/StepIndicator'
import { FaceShapeCard } from '@/components/ar/FaceShapeCard'
import { Button } from '@/components/ui/button'
import { ArrowRight, ScanFace, ScanEye, Ruler, Sparkles } from 'lucide-react'
import type { FaceShapeResult } from '@/lib/ar/face-shape-classifier'

/**
 * Client session orchestrator — guides through 6 steps.
 * Simplified version: shows step-appropriate content.
 */
export default function ClienteSessaoPage() {
  const router = useRouter()
  const {
    patientName,
    currentStep,
    completedSteps,
    faceShape,
    setStep,
    completeStep,
    setFaceShape,
  } = useClientSessionStore()

  const handleNext = useCallback((nextStep: Parameters<typeof setStep>[0]) => {
    completeStep(currentStep)
    setStep(nextStep)
  }, [currentStep, completeStep, setStep])

  const handleGoToSummary = useCallback(() => {
    completeStep(currentStep)
    setStep('summary')
    router.push('/cliente/sessao/resumo')
  }, [currentStep, completeStep, setStep, router])

  return (
    <div className="flex flex-1 flex-col p-6 max-w-2xl mx-auto">
      {/* Step indicator */}
      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        className="mb-8"
      />

      {/* Patient greeting */}
      {patientName && (
        <p className="text-sm text-muted-foreground mb-6">
          Paciente: <span className="font-semibold text-foreground">{patientName}</span>
        </p>
      )}

      {/* Step content */}
      {currentStep === 'face-shape' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <ScanFace className="h-16 w-16 text-primary/40" />
          <div>
            <h2 className="text-2xl font-bold font-heading mb-2">Formato do Rosto</h2>
            <p className="text-muted-foreground">
              Vamos analisar o formato do seu rosto para sugerir as melhores armacoes
            </p>
          </div>
          {faceShape ? (
            <div className="w-full max-w-sm">
              <FaceShapeCard result={faceShape} />
              <Button className="w-full mt-4" onClick={() => handleNext('recommendations')}>
                Ver Recomendacoes <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button size="lg" onClick={() => handleNext('recommendations')}>
              Pular por Agora <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {currentStep === 'recommendations' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <Sparkles className="h-16 w-16 text-primary/40" />
          <div>
            <h2 className="text-2xl font-bold font-heading mb-2">Recomendacoes</h2>
            <p className="text-muted-foreground">
              {faceShape
                ? `Para rostos ${faceShape.shape}, recomendamos armacoes que complementem seus tracos`
                : 'Explore nosso catalogo de armacoes'}
            </p>
          </div>
          {faceShape?.recommendations && faceShape.recommendations.length > 0 && (
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {faceShape.recommendations.map((rec) => (
                <div key={rec.style} className="rounded-xl border bg-card p-4 text-left">
                  <p className="text-sm font-semibold">{rec.style}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                </div>
              ))}
            </div>
          )}
          <Button className="w-full max-w-sm" onClick={() => handleNext('try-on')}>
            Provar Armacoes <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {currentStep === 'try-on' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <ScanEye className="h-16 w-16 text-primary/40" />
          <div>
            <h2 className="text-2xl font-bold font-heading mb-2">Prova Virtual</h2>
            <p className="text-muted-foreground">
              Experimente as armacoes virtualmente e tire fotos das que gostar
            </p>
          </div>
          <Button className="w-full max-w-sm" onClick={() => handleNext('measurements')}>
            Prosseguir para Medidas <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {currentStep === 'measurements' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
          <Ruler className="h-16 w-16 text-primary/40" />
          <div>
            <h2 className="text-2xl font-bold font-heading mb-2">Medidas</h2>
            <p className="text-muted-foreground">
              Vamos medir sua distancia pupilar e altura de montagem automaticamente
            </p>
          </div>
          <Button className="w-full max-w-sm" onClick={handleGoToSummary}>
            Ver Resumo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
