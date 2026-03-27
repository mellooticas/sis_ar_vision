'use client'

import { ScanEye, Ruler, ShoppingBag, Users, Layers, Sparkles, Focus, ScanFace } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { MetricCard } from '@/components/ui/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: metrics } = useDashboardMetrics()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Prova virtual e medicao digital"
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={ShoppingBag}
          label="Armacoes no catalogo"
          value={metrics?.productCount?.toString() ?? '—'}
          variant="warning"
        />
        <MetricCard
          icon={Users}
          label="Pacientes cadastrados"
          value={metrics?.patientCount?.toString() ?? '—'}
          variant="success"
        />
        <MetricCard icon={ScanEye} label="Try-ons realizados" value="—" variant="primary" />
        <MetricCard icon={Ruler} label="Medicoes PD" value="—" />
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
            <Link href="/dashboard/face-shape">
              <Button className="w-full justify-start gap-3" variant="outline">
                <ScanFace className="h-5 w-5" />
                Analisar Formato do Rosto
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
            <CardTitle>Ferramentas de Lentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/espessura-lente">
              <Button className="w-full justify-start gap-3" variant="outline">
                <Layers className="h-5 w-5" />
                Comparar Espessura de Lentes
              </Button>
            </Link>
            <Link href="/dashboard/simulador-tratamentos">
              <Button className="w-full justify-start gap-3" variant="outline">
                <Sparkles className="h-5 w-5" />
                Simulador de Tratamentos
              </Button>
            </Link>
            <Link href="/dashboard/lentes-progressivas">
              <Button className="w-full justify-start gap-3" variant="outline">
                <Focus className="h-5 w-5" />
                Lentes Progressivas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Feature badges */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Disponiveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 px-3 py-1 text-xs font-medium text-fuchsia-700 dark:text-fuchsia-400">
              AR Try-On
            </span>
            <span className="inline-flex items-center rounded-full bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-400">
              PD com correcao yaw
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Formato do Rosto
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              Espessura de Lentes
            </span>
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-xs font-medium text-purple-700 dark:text-purple-400">
              Tratamentos
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
              Progressivas
            </span>
            <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-900/30 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-400">
              Foto de Armacoes
            </span>
            <span className="inline-flex items-center rounded-full bg-teal-100 dark:bg-teal-900/30 px-3 py-1 text-xs font-medium text-teal-700 dark:text-teal-400">
              Modo Cliente
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
