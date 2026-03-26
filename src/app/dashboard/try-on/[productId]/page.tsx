'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Ruler } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { ARScene } from '@/components/ar/ARScene'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useProductDetail } from '@/hooks/use-products'
import { useARStore } from '@/store/ar-store'
import Link from 'next/link'

export default function ProductTryOnPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params)
  const router = useRouter()
  const { data: product, isLoading } = useProductDetail(productId)

  // Set the selected glasses in AR store
  useEffect(() => {
    if (product) {
      useARStore.getState().setSelectedGlasses(product.id, product.image_url)
    }
    return () => {
      useARStore.getState().setSelectedGlasses(null, null)
    }
  }, [product])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={product ? `Experimentar: ${product.name}` : 'Prova Virtual'}
        description={product?.brand || undefined}
        actions={
          <div className="flex gap-2">
            <Link href={`/dashboard/catalogo/${productId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Detalhes
              </Button>
            </Link>
            <Link href="/dashboard/medir-pd">
              <Button variant="outline" size="sm">
                <Ruler className="mr-2 h-4 w-4" />
                Medir PD
              </Button>
            </Link>
          </div>
        }
      />

      <div className="max-w-2xl mx-auto">
        <ARScene
          className="aspect-4/3 min-h-100"
          onClose={() => router.push(`/dashboard/catalogo/${productId}`)}
        />
      </div>
    </div>
  )
}
