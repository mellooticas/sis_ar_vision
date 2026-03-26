'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CPFInput } from '@/components/cliente/CPFInput'
import { useClientSessionStore } from '@/store/client-session-store'
import { listPatients } from '@/lib/data/repository'
import { Loader2 } from 'lucide-react'

export default function ClienteIdentifyPage() {
  const router = useRouter()
  const setPatient = useClientSessionStore((s) => s.setPatient)
  const setStep = useClientSessionStore((s) => s.setStep)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCPF = useCallback(async (cpf: string) => {
    setLoading(true)
    setError(null)

    try {
      const patients = await listPatients({ search: cpf, limit: 1 })
      if (patients.length > 0) {
        setPatient(patients[0].id, patients[0].full_name)
        setStep('face-shape')
        router.push('/cliente/sessao')
      } else {
        setError('CPF nao encontrado. Procure um atendente para realizar o cadastro.')
      }
    } catch {
      setError('Erro ao buscar paciente. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [setPatient, setStep, router])

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold font-heading mb-2">Bem-vindo!</h1>
          <p className="text-muted-foreground">
            Digite seu CPF para iniciar a experiencia
          </p>
        </div>

        <CPFInput onSubmit={handleCPF} />

        {loading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Buscando...</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
