'use client'

import { useQuery } from '@tanstack/react-query'
import { listPatients, getPatient, getPatientPrescriptions } from '@/lib/data/repository'

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters?: { search?: string }) =>
    [...patientKeys.lists(), filters ?? {}] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  prescriptions: (patientId: string) => [...patientKeys.all, 'prescriptions', patientId] as const,
}

export function usePatientList(filters?: {
  search?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => listPatients(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePatientDetail(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => getPatient(id),
    enabled: !!id,
  })
}

export function usePatientPrescriptions(patientId: string) {
  return useQuery({
    queryKey: patientKeys.prescriptions(patientId),
    queryFn: () => getPatientPrescriptions(patientId),
    enabled: !!patientId,
  })
}
