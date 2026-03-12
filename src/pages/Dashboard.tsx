import {
  Building2, AlertTriangle, Calendar, FileText, Clock, AlertOctagon,
  ArrowRight, CheckCircle2,
} from 'lucide-react';
import {
  mockCondominios, getOcorrenciasAbertas, getOcorrenciasCriticas,
  getOcorrenciasAtrasadas, getAssembleiasAgendadas, getAtasPendentes,
  mockOcorrencias,
} from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { KPICard } from '@/components/shared/KPICard';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { TimelineItem } from '@/components/shared/TimelineItem';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const nav = useNavigate();
  const abertas = getOcorrenciasAbertas();
  const criticas = getOcorrenciasCriticas();
  const atrasadas = getOcorrenciasAtrasadas();
  const agendadas = getAssembleiasAgendadas();
  const atasPend = getAtasPendentes();

  const recentOcorrencias = [...mockOcorrencias]
    .sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral da gestão operacional"
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Condomínios" value={mockCondominios.filter(c => c.ativo).length} icon={Building2} onClick={() => nav('/condominios')} />
        <KPICard label="Ocorrências Abertas" value={abertas.length} icon={AlertTriangle} variant="warning" onClick={() => nav('/ocorrencias')} />
        <KPICard label="Críticas" value={criticas.length} icon={AlertOctagon} variant="critical" onClick={() => nav('/ocorrencias')} />
        <KPICard label="Atrasadas" value={atrasadas.length} icon={Clock} variant={atrasadas.length > 0 ? 'critical' : 'default'} onClick={() => nav('/ocorrencias')} />
        <KPICard label="Assembleias" value={agendadas.length} icon={Calendar} onClick={() => nav('/assembleias')} />
        <KPICard label="Atas Pendentes" value={atasPend.length} icon={FileText} variant={atasPend.length > 0 ? 'warning' : 'default'} onClick={() => nav('/assembleias')} />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent occurrences */}
        <SummaryCard
          title="Ocorrências Recentes"
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => nav('/ocorrencias')}>
              Ver todas <ArrowRight className="h-3 w-3" />
            </Button>
          }
        >
          <div className="space-y-3">
            {recentOcorrencias.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors border"
                onClick={() => nav('/ocorrencias')}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{o.titulo}</p>
                  <p className="text-xs text-muted-foreground">{o.condominioNome} · {o.dataAbertura}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <PriorityBadge priority={o.prioridade} />
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </SummaryCard>

        {/* Right column */}
        <div className="space-y-6">
          {/* Agenda */}
          <SummaryCard title="Agenda da Semana">
            <div className="space-y-1">
              {agendadas.length > 0 ? (
                agendadas.map((a, i) => (
                  <TimelineItem
                    key={a.id}
                    date={`${a.data} às ${a.hora}`}
                    title={a.condominioNome}
                    description={`${a.tipo} — ${a.local}`}
                    isLast={i === agendadas.length - 1}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">Nenhum evento esta semana</p>
              )}
            </div>
          </SummaryCard>

          {/* Deliberações pendentes placeholder */}
          <SummaryCard title="Deliberações Pendentes">
            <div className="flex items-center gap-2 py-4 text-muted-foreground justify-center">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm">Nenhuma deliberação pendente</p>
            </div>
          </SummaryCard>
        </div>
      </div>
    </div>
  );
}
