'use client'

import Image from 'next/image'
import { ScanEye, Glasses } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Product } from '@/types/product'

interface ProductCardProps {
  product: Product
  onTryOn?: (product: Product) => void
  onSelect?: (product: Product) => void
  className?: string
}

export function ProductCard({ product, onTryOn, onSelect, className }: ProductCardProps) {
  const formattedPrice = product.price
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
    : null

  return (
    <div
      className={cn(
        'group rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer',
        className
      )}
      onClick={() => onSelect?.(product)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <Glasses className="h-16 w-16 text-muted-foreground/30" />
        )}

        {/* Try-on button overlay */}
        {onTryOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
            <Button
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onTryOn(product)
              }}
            >
              <ScanEye className="mr-1.5 h-4 w-4" />
              Experimentar
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {product.brand && (
          <p className="text-xs font-medium text-primary mb-1">{product.brand}</p>
        )}
        <h3 className="text-sm font-semibold text-foreground line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          {formattedPrice && (
            <p className="text-sm font-bold text-foreground">{formattedPrice}</p>
          )}
          {product.category && (
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
