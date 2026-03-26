'use client'

import { PageHeader } from '@/components/ui/page-header'
import { ARScene } from '@/components/ar/ARScene'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export default function TryOnPage() {
  return (
    <div>
      <PageHeader
        title="Prova Virtual"
        description="Experimente armacoes em tempo real usando a camera"
        actions={
          <Link href="/dashboard/catalogo">
            <Button variant="outline" size="sm">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Ver Catalogo
            </Button>
          </Link>
        }
      />

      <div className="max-w-2xl mx-auto">
        <ARScene className="aspect-4/3 min-h-100" />

        <p className="text-xs text-muted-foreground text-center mt-4">
          Selecione uma armacao no catalogo para experimentar virtualmente.
          A armacao 3D sera sobreposta ao seu rosto em tempo real.
        </p>
      </div>
    </div>
  )
}
