'use client'

import { ProductCard } from './ProductCard'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Glasses } from 'lucide-react'
import type { Product } from '@/types/product'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  onTryOn?: (product: Product) => void
  onSelect?: (product: Product) => void
}

export function ProductGrid({ products, isLoading, onTryOn, onSelect }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Glasses}
        title="Nenhum produto encontrado"
        description="Tente ajustar os filtros ou termo de busca."
      />
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onTryOn={onTryOn}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
