import {
  Building2, AlertTriangle, Calendar, FileText, Clock, AlertOctagon,
  ArrowRight, CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCondominiums } from '@/hooks/useCondominiums';
import { PageHeader } from '@/components/shared/PageHeader';
import { KPICard } from '@/components/shared/KPICard';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { TimelineItem } from '@/components/shared/TimelineItem';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const nav = useNavigate();
  const { data: condominiums } = useCondominiums();

  const activeCount = (condominiums || []).filter(c => c.active).length;
  const totalCount = (condominiums || []).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral da gestão operacional"
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Condomínios" value={activeCount} icon={Building2} onClick={() => nav('/condominios')} trend={`${totalCount} total`} />
        <KPICard label="Ocorrências Abertas" value="—" icon={AlertTriangle} variant="warning" onClick={() => nav('/ocorrencias')} />
        <KPICard label="Críticas" value="—" icon={AlertOctagon} onClick={() => nav('/ocorrencias')} />
        <KPICard label="Atrasadas" value="—" icon={Clock} onClick={() => nav('/ocorrencias')} />
        <KPICard label="Assembleias" value="—" icon={Calendar} onClick={() => nav('/assembleias')} />
        <KPICard label="Atas Pendentes" value="—" icon={FileText} onClick={() => nav('/assembleias')} />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent condominiums */}
        <SummaryCard
          title="Condomínios Recentes"
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => nav('/condominios')}>
              Ver todos <ArrowRight className="h-3 w-3" />
            </Button>
          }
        >
          <div className="space-y-3">
            {(condominiums || []).slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors border"
                onClick={() => nav(`/condominios/${c.id}`)}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[c.address_line, c.city].filter(Boolean).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                    {c.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
            {(!condominiums || condominiums.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum condomínio registado</p>
            )}
          </div>
        </SummaryCard>

        {/* Right column */}
        <div className="space-y-6">
          <SummaryCard title="Agenda da Semana">
            <div className="flex items-center gap-2 py-4 text-muted-foreground justify-center">
              <Calendar className="h-4 w-4" />
              <p className="text-sm">Nenhum evento esta semana</p>
            </div>
          </SummaryCard>

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
