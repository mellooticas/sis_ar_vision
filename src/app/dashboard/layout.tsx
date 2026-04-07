import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { AuthProvider } from '@/contexts/auth-context'
import { SidebarProvider } from '@/components/sidebar/sidebar-context'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <DashboardShell>{children}</DashboardShell>
      </SidebarProvider>
    </AuthProvider>
  )
}
