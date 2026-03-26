'use client'

import { Settings } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'

export default function ConfiguracoesPage() {
  return (
    <div>
      <PageHeader
        title="Configuracoes"
        description="Preferencias e ajustes do aplicativo"
      />
      <EmptyState
        icon={Settings}
        title="Configuracoes em Breve"
        description="As opcoes de configuracao do AR & Vision serao disponibilizadas aqui."
      />
    </div>
  )
}
