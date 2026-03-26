'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: (failureCount, error: any) => {
              const status = error?.status ?? error?.response?.status
              const code = error?.code
              const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase()

              if (status >= 400 && status < 500) return false

              if (
                code === '42501' ||
                message.includes('permission denied') ||
                message.includes('unauthorized')
              ) {
                return false
              }

              return failureCount < 3
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
