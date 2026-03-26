'use client'

import { useQuery } from '@tanstack/react-query'
import { listProducts, getProduct, searchProducts, listFrameModels } from '@/lib/data/repository'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: { search?: string; category?: string; brand?: string; storeId?: string }) =>
    [...productKeys.lists(), filters ?? {}] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  search: (term: string) => [...productKeys.all, 'search', term] as const,
  frames: () => [...productKeys.all, 'frames'] as const,
}

export function useProductList(filters?: {
  search?: string
  category?: string
  brand?: string
  storeId?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => listProducts(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
  })
}

export function useProductSearch(term: string) {
  return useQuery({
    queryKey: productKeys.search(term),
    queryFn: () => searchProducts(term),
    enabled: term.length >= 2,
    staleTime: 30 * 1000,
  })
}

export function useFrameModels() {
  return useQuery({
    queryKey: productKeys.frames(),
    queryFn: () => listFrameModels(),
    staleTime: 10 * 60 * 1000,
  })
}
