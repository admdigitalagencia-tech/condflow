import {
  Building2, AlertTriangle, Calendar, FileText, Clock, AlertOctagon,
  ArrowRight, CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCondominiums } from '@/hooks/useCondominiums';
import { useTickets, useTicketStats } from '@/hooks/useTickets';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/tickets/TicketBadges';
import { categoryLabel } from '@/services/tickets';
import { PageHeader } from '@/components/shared/PageHeader';
import { KPICard } from '@/components/shared/KPICard';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const nav = useNavigate();
  const { data: condominiums } = useCondominiums();
  const { data: stats } = useTicketStats();
  const { data: tickets } = useTickets();

  const activeCount = (condominiums || []).filter(c => c.active).length;
  const recentTickets = (tickets || []).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral da gestão operacional" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Condomínios" value={activeCount} icon={Building2} onClick={() => nav('/condominios')} />
        <KPICard label="Ocorrências Abertas" value={stats?.open ?? 0} icon={AlertTriangle} variant="warning" onClick={() => nav('/ocorrencias')} />
        <KPICard label="Críticas" value={stats?.critical ?? 0} icon={AlertOctagon} variant={stats?.critical ? 'critical' : 'default'} onClick={() => nav('/ocorrencias')} />
        <KPICard label="Atrasadas" value={stats?.overdue ?? 0} icon={Clock} variant={stats?.overdue ? 'critical' : 'default'} onClick={() => nav('/ocorrencias')} />
        <KPICard label="Assembleias" value="—" icon={Calendar} onClick={() => nav('/assembleias')} />
        <KPICard label="Atas Pendentes" value="—" icon={FileText} onClick={() => nav('/assembleias')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <SummaryCard title="Ocorrências Recentes" className="lg:col-span-2"
          action={<Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => nav('/ocorrencias')}>Ver todas <ArrowRight className="h-3 w-3" /></Button>}>
          <div className="space-y-3">
            {recentTickets.length > 0 ? recentTickets.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors border" onClick={() => nav(`/ocorrencias/${t.id}`)}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.condominiums?.name} · {categoryLabel(t.category)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <TicketPriorityBadge priority={t.priority} />
                  <TicketStatusBadge status={t.status} />
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ocorrência registada</p>
            )}
          </div>
        </SummaryCard>

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
