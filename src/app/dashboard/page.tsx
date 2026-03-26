'use client'

import { ScanEye, Ruler, ShoppingBag, Camera } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Prova virtual e medicao digital"
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={ScanEye} label="Try-ons realizados" value="—" variant="primary" />
        <MetricCard icon={Ruler} label="Medicoes PD" value="—" variant="success" />
        <MetricCard icon={ShoppingBag} label="Armacoes no catalogo" value="—" variant="warning" />
        <MetricCard icon={Camera} label="Sessoes ativas" value="—" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acoes Rapidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/try-on">
              <Button className="w-full justify-start gap-3" variant="outline">
                <ScanEye className="h-5 w-5" />
                Iniciar Prova Virtual
              </Button>
            </Link>
            <Link href="/dashboard/medir-pd">
              <Button className="w-full justify-start gap-3" variant="outline">
                <Ruler className="h-5 w-5" />
                Medir Distancia Pupilar
              </Button>
            </Link>
            <Link href="/dashboard/catalogo">
              <Button className="w-full justify-start gap-3" variant="outline">
                <ShoppingBag className="h-5 w-5" />
                Ver Catalogo de Armacoes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre o AR &amp; Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O Clearix AR &amp; Vision permite que seus clientes experimentem armacoes
              virtualmente usando a camera do dispositivo. Alem disso, oferece medicao
              digital da distancia interpupilar (DIP/PD) para maior precisao nas prescricoes.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 px-3 py-1 text-xs font-medium text-fuchsia-700 dark:text-fuchsia-400">
                Face Tracking
              </span>
              <span className="inline-flex items-center rounded-full bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-400">
                3D Overlay
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                PD Measurement
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
