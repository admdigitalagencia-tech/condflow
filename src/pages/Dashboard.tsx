import { useState, useMemo } from 'react';
import {
  Building2, AlertTriangle, Calendar, Clock, AlertOctagon,
  ArrowRight, CheckCircle2, BookOpen, ListChecks, CalendarDays,
  ChevronLeft, ChevronRight, Landmark,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCondominiums } from '@/hooks/useCondominiums';
import { useTickets, useTicketStats } from '@/hooks/useTickets';
import { useAssemblyStats, useAssemblies } from '@/hooks/useAssemblies';
import { useTaskStats, useTasks } from '@/hooks/useTasks';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/tickets/TicketBadges';
import { categoryLabel } from '@/services/tickets';
import { assemblyStatusLabel } from '@/services/assemblies';
import { priorityLabel, statusLabel } from '@/services/tasks';
import { PageHeader } from '@/components/shared/PageHeader';
import { KPICard } from '@/components/shared/KPICard';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAgendaItems, DeadlineItem } from '@/hooks/useDeadlineNotifications';
import {
  format, parseISO, isAfter, isToday, isTomorrow,
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths,
} from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const nav = useNavigate();
  const { data: condominiums } = useCondominiums();
  const { data: stats } = useTicketStats();
  const { data: tickets } = useTickets();
  const { data: assemblyStats } = useAssemblyStats();
  const { data: taskStats } = useTaskStats();
  const { data: assemblies } = useAssemblies();
  const { data: allTasks } = useTasks();

  const activeCount = (condominiums || []).filter(c => c.active).length;
  const recentTickets = (tickets || []).slice(0, 5);

  // Upcoming assemblies (future or today, max 5)
  const today = new Date().toISOString().split('T')[0];
  const upcomingAssemblies = (assemblies || [])
    .filter(a => a.scheduled_date >= today && a.status !== 'finalizada')
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))
    .slice(0, 5);

  // Recent pending tasks (max 5)
  const pendingTasks = (allTasks || [])
    .filter(t => ['pendente', 'em_andamento', 'bloqueada'].includes(t.status))
    .sort((a, b) => {
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    })
    .slice(0, 5);

  const formatDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Hoje';
    if (isTomorrow(d)) return 'Amanhã';
    return format(d, "d MMM", { locale: pt });
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'urgente': return 'destructive';
      case 'alta': return 'default';
      case 'media': return 'secondary';
      default: return 'outline';
    }
  };

  const taskStatusColor = (s: string) => {
    switch (s) {
      case 'bloqueada': return 'destructive';
      case 'em_andamento': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Visão geral da gestão operacional" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Condomínios" value={activeCount} icon={Building2} onClick={() => nav('/condominios')} />
        <KPICard label="Ocorrências" value={stats?.open ?? 0} icon={AlertTriangle} variant="warning" onClick={() => nav('/ocorrencias')} />
        <KPICard label="Críticas" value={stats?.critical ?? 0} icon={AlertOctagon} variant={stats?.critical ? 'critical' : 'default'} onClick={() => nav('/ocorrencias')} />
        <KPICard label="Atrasadas" value={stats?.overdue ?? 0} icon={Clock} variant={stats?.overdue ? 'critical' : 'default'} onClick={() => nav('/ocorrencias')} />
        <KPICard label="Assembleias" value={assemblyStats?.thisMonth ?? 0} icon={Calendar} onClick={() => nav('/assembleias')} />
        <KPICard label="Atas Pendentes" value={assemblyStats?.pendingMinutes ?? 0} icon={BookOpen} variant={assemblyStats?.pendingMinutes ? 'warning' : 'default'} onClick={() => nav('/assembleias')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <SummaryCard title="Ocorrências Recentes" className="lg:col-span-2"
          action={<Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => nav('/ocorrencias')}>Ver todas <ArrowRight className="h-3 w-3" /></Button>}>
          <div className="space-y-1">
            {recentTickets.length > 0 ? recentTickets.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => nav(`/ocorrencias/${t.id}`)}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.condominiums?.name} · {categoryLabel(t.category)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <TicketPriorityBadge priority={t.priority} />
                  <TicketStatusBadge status={t.status} />
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <AlertTriangle className="h-5 w-5 mb-2 opacity-40" />
                <p className="text-sm">Nenhuma ocorrência registada</p>
              </div>
            )}
          </div>
        </SummaryCard>

        <div className="space-y-6">
          <SummaryCard title="Tarefas Pendentes" action={
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => nav('/tarefas')}>Ver todas <ArrowRight className="h-3 w-3" /></Button>
          }>
            {taskStats && (taskStats.total > 0) ? (
              <div className="space-y-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Atrasadas</span>
                  <span className={`text-sm font-semibold ${taskStats.overdue > 0 ? 'text-destructive' : ''}`}>{taskStats.overdue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Urgentes</span>
                  <span className={`text-sm font-semibold ${taskStats.urgent > 0 ? 'text-orange-600 dark:text-orange-400' : ''}`}>{taskStats.urgent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Para hoje</span>
                  <span className="text-sm font-semibold">{taskStats.today}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-medium">Total ativas</span>
                  <span className="text-sm font-bold">{taskStats.total}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                <ListChecks className="h-5 w-5 opacity-40" />
                <p className="text-sm">Nenhuma tarefa pendente</p>
              </div>
            )}
          </SummaryCard>
          <SummaryCard title="Deliberações Pendentes">
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 opacity-40" />
              <p className="text-sm">Nenhuma deliberação pendente</p>
            </div>
          </SummaryCard>
        </div>
      </div>

      {/* Agenda + Tasks detail row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SummaryCard title="Agenda — Próximos Eventos" action={
          <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => nav('/agenda')}>Ver agenda <ArrowRight className="h-3 w-3" /></Button>
        }>
          {upcomingAssemblies.length > 0 ? (
            <div className="space-y-1">
              {upcomingAssemblies.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => nav(`/assembleias/${a.id}`)}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary/8 shrink-0">
                      <span className="text-[10px] font-medium text-primary uppercase leading-none">
                        {format(parseISO(a.scheduled_date), 'MMM', { locale: pt })}
                      </span>
                      <span className="text-sm font-bold text-primary leading-tight">
                        {format(parseISO(a.scheduled_date), 'd')}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(a as any).condominiums?.name}
                        {a.scheduled_time ? ` · ${a.scheduled_time.slice(0, 5)}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {assemblyStatusLabel(a.status)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <CalendarDays className="h-5 w-5 opacity-40" />
              <p className="text-sm">Nenhum evento agendado</p>
            </div>
          )}
        </SummaryCard>

        <SummaryCard title="Tarefas — Próximas Ações" action={
          <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => nav('/tarefas')}>Ver tarefas <ArrowRight className="h-3 w-3" /></Button>
        }>
          {pendingTasks.length > 0 ? (
            <div className="space-y-1">
              {pendingTasks.map(t => {
                const isOverdue = t.due_date && t.due_date < today;
                return (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => nav('/tarefas')}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.condominiums?.name || 'Sem condomínio'}
                        {t.due_date ? ` · ${formatDate(t.due_date)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {isOverdue && (
                        <Badge variant="destructive" className="text-[10px]">Atrasada</Badge>
                      )}
                      <Badge variant={priorityColor(t.priority) as any} className="text-[10px]">
                        {priorityLabel(t.priority)}
                      </Badge>
                      <Badge variant={taskStatusColor(t.status) as any} className="text-[10px]">
                        {statusLabel(t.status)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
              <ListChecks className="h-5 w-5 opacity-40" />
              <p className="text-sm">Nenhuma tarefa pendente</p>
            </div>
          )}
        </SummaryCard>
      </div>
    </div>
  );
}
