'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getPremiumFilterOptions, searchPremium,
  getStandardFilterOptions, searchStandard,
  searchCanonicalForPrescription, getCanonicalDetail,
} from '@/lib/data/repository'
import type {
  PremiumFilterParamsV3, PremiumSearchParamsV3,
  StandardFilterParamsV3, StandardSearchParamsV3,
} from '@/types/lens'

export const lensKeys = {
  all: ['lenses'] as const,
  premiumFilters: (params: PremiumFilterParamsV3) =>
    [...lensKeys.all, 'premium-filters', params] as const,
  premiumSearch: (params: PremiumSearchParamsV3) =>
    [...lensKeys.all, 'premium-search', params] as const,
  standardFilters: (params: StandardFilterParamsV3) =>
    [...lensKeys.all, 'standard-filters', params] as const,
  standardSearch: (params: StandardSearchParamsV3) =>
    [...lensKeys.all, 'standard-search', params] as const,
  forPrescription: (params: { spherical?: number; cylindrical?: number; addition?: number; lens_type?: string }) =>
    [...lensKeys.all, 'prescription', params] as const,
  details: () => [...lensKeys.all, 'detail'] as const,
  detail: (id: string, isPremium?: boolean) => [...lensKeys.details(), id, isPremium] as const,
}

export function usePremiumFilterOptions(params: PremiumFilterParamsV3 = {}, enabled = true) {
  return useQuery({
    queryKey: lensKeys.premiumFilters(params),
    queryFn: () => getPremiumFilterOptions(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePremiumSearch(params: PremiumSearchParamsV3 = {}, enabled = true) {
  return useQuery({
    queryKey: lensKeys.premiumSearch(params),
    queryFn: () => searchPremium(params),
    enabled,
    staleTime: 2 * 60 * 1000,
  })
}

export function useStandardFilterOptions(params: StandardFilterParamsV3 = {}, enabled = true) {
  return useQuery({
    queryKey: lensKeys.standardFilters(params),
    queryFn: () => getStandardFilterOptions(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useStandardSearch(params: StandardSearchParamsV3 = {}, enabled = true) {
  return useQuery({
    queryKey: lensKeys.standardSearch(params),
    queryFn: () => searchStandard(params),
    enabled,
    staleTime: 2 * 60 * 1000,
  })
}

export function useLensesForPrescription(params: {
  spherical?: number
  cylindrical?: number
  addition?: number
  lens_type?: string
  enabled?: boolean
}) {
  const { enabled = true, ...queryParams } = params
  return useQuery({
    queryKey: lensKeys.forPrescription(queryParams),
    queryFn: () => searchCanonicalForPrescription(queryParams),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLensDetail(id: string, isPremium?: boolean) {
  return useQuery({
    queryKey: lensKeys.detail(id, isPremium),
    queryFn: () => getCanonicalDetail(id, isPremium),
    enabled: !!id,
  })
}
