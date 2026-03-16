import { useMemo } from 'react';
import { useTasks } from './useTasks';
import { useTickets } from './useTickets';
import { useAssemblies } from './useAssemblies';
import { isToday, isTomorrow, parseISO, format } from 'date-fns';
import { pt } from 'date-fns/locale';

export interface DeadlineItem {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'ticket' | 'assembly';
  typeLabel: string;
  status?: string;
  priority?: string;
  condominiumName?: string;
  route: string;
}

export function useAgendaItems() {
  const { data: tasks } = useTasks();
  const { data: tickets } = useTickets();
  const { data: assemblies } = useAssemblies();

  return useMemo(() => {
    const items: DeadlineItem[] = [];

    (tasks || []).forEach(t => {
      if (t.due_date && t.status !== 'concluida' && t.status !== 'cancelada') {
        items.push({
          id: t.id,
          title: t.title,
          date: t.due_date,
          type: 'task',
          typeLabel: 'Tarefa',
          status: t.status,
          priority: t.priority,
          condominiumName: t.condominiums?.name || undefined,
          route: '/tarefas',
        });
      }
    });

    (tickets || []).forEach(t => {
      if (t.due_date && t.status !== 'resolvido' && t.status !== 'encerrado') {
        items.push({
          id: t.id,
          title: t.title,
          date: t.due_date,
          type: 'ticket',
          typeLabel: 'Ocorrência',
          status: t.status,
          priority: t.priority,
          condominiumName: (t as any).condominiums?.name || undefined,
          route: `/ocorrencias/${t.id}`,
        });
      }
    });

    (assemblies || []).forEach(a => {
      if (a.scheduled_date && a.status !== 'finalizada') {
        items.push({
          id: a.id,
          title: a.title,
          date: a.scheduled_date,
          type: 'assembly',
          typeLabel: 'Assembleia',
          status: a.status,
          condominiumName: (a as any).condominiums?.name || undefined,
          route: `/assembleias/${a.id}`,
        });
      }
    });

    items.sort((a, b) => a.date.localeCompare(b.date));
    return items;
  }, [tasks, tickets, assemblies]);
}

export function useDeadlineNotifications() {
  const items = useAgendaItems();

  return useMemo(() => {
    return items.filter(item => {
      const d = parseISO(item.date + (item.date.includes('T') ? '' : 'T00:00:00'));
      return isToday(d) || isTomorrow(d);
    }).map(item => {
      const d = parseISO(item.date + (item.date.includes('T') ? '' : 'T00:00:00'));
      const urgency = isToday(d) ? 'today' : 'tomorrow';
      return { ...item, urgency };
    });
  }, [items]);
}
