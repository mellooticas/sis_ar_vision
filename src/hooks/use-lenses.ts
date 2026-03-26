'use client'

import { useQuery } from '@tanstack/react-query'
import { searchLensesForPrescription, getLensDetail, searchLenses } from '@/lib/data/repository'

export const lensKeys = {
  all: ['lenses'] as const,
  forPrescription: (params: { sph: number; cyl: number; add?: number; type?: string }) =>
    [...lensKeys.all, 'prescription', params] as const,
  details: () => [...lensKeys.all, 'detail'] as const,
  detail: (id: string, isPremium?: boolean) => [...lensKeys.details(), id, isPremium] as const,
  search: (term: string) => [...lensKeys.all, 'search', term] as const,
}

export function useLensesForPrescription(params: {
  sph: number
  cyl: number
  add?: number
  type?: string
  enabled?: boolean
}) {
  const { enabled = true, ...queryParams } = params
  return useQuery({
    queryKey: lensKeys.forPrescription(queryParams),
    queryFn: () => searchLensesForPrescription(queryParams),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLensDetail(id: string, isPremium?: boolean) {
  return useQuery({
    queryKey: lensKeys.detail(id, isPremium),
    queryFn: () => getLensDetail(id, isPremium),
    enabled: !!id,
  })
}

export function useLensSearch(term: string) {
  return useQuery({
    queryKey: lensKeys.search(term),
    queryFn: () => searchLenses(term),
    enabled: term.length >= 2,
    staleTime: 30 * 1000,
  })
}
