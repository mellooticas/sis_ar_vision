'use client'

import { useQuery } from '@tanstack/react-query'
import { countProducts, countPatients } from '@/lib/data/repository'

export interface DashboardMetrics {
  productCount: number
  patientCount: number
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const [productCount, patientCount] = await Promise.all([
        countProducts().catch(() => 0),
        countPatients().catch(() => 0),
      ])
      return { productCount, patientCount }
    },
    staleTime: 60_000, // 1 min
    refetchOnWindowFocus: false,
  })
}
