'use client'

import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PermissionPromptProps {
  onAllow: () => void
  error?: string | null
}

/**
 * Pre-permission prompt shown before requesting camera access.
 * Helps increase permission grant rate by explaining why camera is needed.
 */
export function PermissionPrompt({ onAllow, error }: PermissionPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Camera className="h-10 w-10 text-primary" />
      </div>

      <div className="max-w-sm">
        <h3 className="text-lg font-semibold text-foreground">
          Permissao de Camera
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Precisamos acessar sua camera para a prova virtual de armacoes e medicao de distancia interpupilar.
          Nenhuma imagem e salva ou enviada.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive max-w-sm">
          {error}
        </div>
      )}

      <Button onClick={onAllow} size="lg">
        <Camera className="mr-2 h-4 w-4" />
        Permitir Camera
      </Button>

      <p className="text-xs text-muted-foreground max-w-xs">
        Voce pode revogar a permissao a qualquer momento nas configuracoes do navegador.
      </p>
    </div>
  )
}
