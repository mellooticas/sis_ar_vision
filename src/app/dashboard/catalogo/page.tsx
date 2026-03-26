'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { ProductFilters } from '@/components/catalog/ProductFilters'
import { useProductList } from '@/hooks/use-products'
import { useARStore } from '@/store/ar-store'
import { Button } from '@/components/ui/button'
import { ScanEye } from 'lucide-react'
import Link from 'next/link'
import type { Product } from '@/types/product'

export default function CatalogoPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  const { data: products = [], isLoading } = useProductList({
    search: search || undefined,
    category: selectedCategory || undefined,
    brand: selectedBrand || undefined,
  })

  // Extract unique categories and brands for filter chips
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [products])

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [products])

  const handleTryOn = (product: Product) => {
    useARStore.getState().setSelectedGlasses(product.id, product.image_url)
    router.push('/dashboard/try-on')
  }

  const handleSelect = (product: Product) => {
    router.push(`/dashboard/catalogo/${product.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Catalogo de Armacoes"
        description="Explore e filtre armacoes disponiveis"
        actions={
          <Link href="/dashboard/try-on">
            <Button size="sm">
              <ScanEye className="mr-2 h-4 w-4" />
              Prova Virtual
            </Button>
          </Link>
        }
      />

      <div className="space-y-6">
        <ProductFilters
          search={search}
          onSearchChange={setSearch}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedBrand={selectedBrand}
          onBrandChange={setSelectedBrand}
          categories={categories}
          brands={brands}
        />

        <ProductGrid
          products={products}
          isLoading={isLoading}
          onTryOn={handleTryOn}
          onSelect={handleSelect}
        />
      </div>
    </div>
  )
}
