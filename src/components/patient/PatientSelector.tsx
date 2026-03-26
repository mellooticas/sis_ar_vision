'use client'

import { useState, useCallback } from 'react'
import { usePatientList } from '@/hooks/use-patients'
import { cn } from '@/lib/utils'
import { Search, User } from 'lucide-react'

interface PatientSelectorProps {
  onSelect: (patient: { id: string; name: string }) => void
  className?: string
}

export function PatientSelector({ onSelect, className }: PatientSelectorProps) {
  const [search, setSearch] = useState('')
  const { data: patients, isLoading } = usePatientList({
    search: search.length >= 2 ? search : undefined,
    limit: 10,
  })

  const handleSelect = useCallback(
    (patient: { id: string; full_name?: string; name?: string }) => {
      onSelect({
        id: patient.id,
        name: patient.full_name || patient.name || 'Paciente',
      })
    },
    [onSelect],
  )

  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">
        Selecionar Paciente
      </label>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou CPF..."
          className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500/30"
        />
      </div>

      {/* Results */}
      {search.length >= 2 && (
        <div className="max-h-48 overflow-y-auto rounded-lg border bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              Buscando...
            </div>
          ) : patients && patients.length > 0 ? (
            <ul>
              {patients.map((patient) => (
                <li key={patient.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(patient)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors"
                  >
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {patient.full_name || 'Sem nome'}
                      </p>
                      {patient.cpf && (
                        <p className="truncate text-xs text-muted-foreground">
                          CPF: {patient.cpf}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Nenhum paciente encontrado
            </div>
          )}
        </div>
      )}
    </div>
  )
}
