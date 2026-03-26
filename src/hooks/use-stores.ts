'use client'

import { useQuery } from '@tanstack/react-query'
import { listStores } from '@/lib/data/repository'

export const storeKeys = {
  all: ['stores'] as const,
  list: () => [...storeKeys.all, 'list'] as const,
}

export function useStoreList() {
  return useQuery({
    queryKey: storeKeys.list(),
    queryFn: () => listStores(),
    staleTime: 10 * 60 * 1000,
  })
}
