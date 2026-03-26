'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ScanEye, Glasses, Ruler, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useProductDetail } from '@/hooks/use-products'
import { useARStore } from '@/store/ar-store'
import Link from 'next/link'

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: product, isLoading } = useProductDetail(id)

  const handleTryOn = () => {
    if (!product) return
    useARStore.getState().setSelectedGlasses(product.id, product.image_url)
    router.push('/dashboard/try-on')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Produto nao encontrado.</p>
        <Link href="/dashboard/catalogo">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Catalogo
          </Button>
        </Link>
      </div>
    )
  }

  const formattedPrice = product.price
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
    : null

  return (
    <div>
      <PageHeader
        title={product.name}
        description={product.brand || undefined}
        actions={
          <Link href="/dashboard/catalogo">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-xl border border-border bg-muted/20 aspect-square flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={500}
              height={500}
              className="object-contain p-8"
            />
          ) : (
            <Glasses className="h-24 w-24 text-muted-foreground/20" />
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Price */}
          {formattedPrice && (
            <p className="text-3xl font-bold font-heading text-foreground">
              {formattedPrice}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.category && <Badge>{product.category}</Badge>}
            {product.brand && <Badge variant="secondary">{product.brand}</Badge>}
            {product.sku && <Badge variant="outline">SKU: {product.sku}</Badge>}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground">{product.description}</p>
          )}

          {/* Stock info */}
          {product.stock_qty !== null && (
            <p className="text-sm">
              <span className="text-muted-foreground">Estoque: </span>
              <span className={product.stock_qty > 0 ? 'text-emerald-600' : 'text-red-500'}>
                {product.stock_qty > 0 ? `${product.stock_qty} unidades` : 'Esgotado'}
              </span>
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button size="lg" onClick={handleTryOn} className="flex-1">
              <ScanEye className="mr-2 h-5 w-5" />
              Experimentar Virtualmente
            </Button>
            <Link href="/dashboard/medir-pd" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                <Ruler className="mr-2 h-5 w-5" />
                Medir PD
              </Button>
            </Link>
          </div>

          {/* Handoff to Vendas */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground mb-2">Continuar no Clearix Vendas</p>
            <p className="text-xs text-muted-foreground mb-3">
              Apos experimentar e medir o PD, continue o atendimento no modulo de Vendas.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const vendasUrl = process.env.NEXT_PUBLIC_CLEARIX_VENDAS_URL || '#'
                const params = new URLSearchParams({
                  product_id: product.id,
                  ...(product.sku && { sku: product.sku }),
                })
                window.open(`${vendasUrl}?${params.toString()}`, '_blank')
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir no Vendas
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
