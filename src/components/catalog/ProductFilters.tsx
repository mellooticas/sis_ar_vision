'use client'

import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface ProductFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  selectedBrand: string | null
  onBrandChange: (brand: string | null) => void
  categories?: string[]
  brands?: string[]
}

export function ProductFilters({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  categories = [],
  brands = [],
}: ProductFiltersProps) {
  const hasActiveFilters = !!selectedCategory || !!selectedBrand || !!search

  return (
    <div className="space-y-4">
      {/* Search */}
      <SearchInput
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        placeholder="Buscar armacoes..."
      />

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {/* Categories */}
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(selectedCategory === cat ? null : cat)}
          >
            {cat}
          </Button>
        ))}

        {/* Brands */}
        {brands.map((brand) => (
          <Button
            key={brand}
            variant={selectedBrand === brand ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBrandChange(selectedBrand === brand ? null : brand)}
          >
            {brand}
          </Button>
        ))}

        {/* Clear all */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange('')
              onCategoryChange(null)
              onBrandChange(null)
            }}
          >
            <X className="mr-1 h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  )
}
