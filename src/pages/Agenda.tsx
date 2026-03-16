import { useState, useMemo } from 'react';
import { CalendarDays, ListChecks, AlertTriangle, Landmark, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, isTomorrow, isPast, isThisWeek, isThisMonth } from 'date-fns';
import { pt } from 'date-fns/locale';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAgendaItems, DeadlineItem } from '@/hooks/useDeadlineNotifications';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const typeIcon = (type: DeadlineItem['type']) => {
  switch (type) {
    case 'task': return <ListChecks className="h-4 w-4 text-primary" />;
    case 'ticket': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'assembly': return <Landmark className="h-4 w-4 text-blue-500" />;
  }
};

const typeBadgeVariant = (type: DeadlineItem['type']) => {
  switch (type) {
    case 'task': return 'default';
    case 'ticket': return 'secondary';
    case 'assembly': return 'outline';
  }
};

function dateLabel(dateStr: string) {
  const d = parseISO(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  if (isToday(d)) return 'Hoje';
  if (isTomorrow(d)) return 'Amanhã';
  return format(d, "EEEE, dd 'de' MMMM", { locale: pt });
}

function groupItems(items: DeadlineItem[]) {
  const groups: Record<string, DeadlineItem[]> = {};
  items.forEach(item => {
    const key = item.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

export default function Agenda() {
  const items = useAgendaItems();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return items;
    return items.filter(i => i.type === typeFilter);
  }, [items, typeFilter]);

  const grouped = useMemo(() => groupItems(filtered), [filtered]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Calendário de prazos — tarefas, ocorrências e assembleias"
        actions={
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="task">Tarefas</SelectItem>
              <SelectItem value="ticket">Ocorrências</SelectItem>
              <SelectItem value="assembly">Assembleias</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="destructive" className="text-xs">
          {items.filter(i => i.date < todayStr).length} atrasados
        </Badge>
        <Badge className="text-xs">
          {items.filter(i => i.date === todayStr).length} hoje
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {items.filter(i => {
            const d = parseISO(i.date + 'T00:00:00');
            return isThisWeek(d) && i.date >= todayStr;
          }).length} esta semana
        </Badge>
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Agenda vazia"
          description="Não há prazos agendados. Adicione datas a tarefas, ocorrências ou assembleias."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dateItems]) => {
            const overdue = date < todayStr;
            const today = date === todayStr;
            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className={`text-sm font-semibold capitalize ${overdue ? 'text-destructive' : today ? 'text-primary' : 'text-foreground'}`}>
                    {dateLabel(date)}
                  </h3>
                  {overdue && <Badge variant="destructive" className="text-[10px]">Atrasado</Badge>}
                  {today && <Badge className="text-[10px]">Hoje</Badge>}
                </div>
                <div className="space-y-2">
                  {dateItems.map(item => (
                    <Card
                      key={item.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${overdue ? 'border-destructive/30 bg-destructive/5' : today ? 'border-primary/30 bg-primary/5' : ''}`}
                      onClick={() => navigate(item.route)}
                    >
                      <CardContent className="flex items-center gap-3 py-3 px-4">
                        {typeIcon(item.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          {item.condominiumName && (
                            <p className="text-xs text-muted-foreground truncate">{item.condominiumName}</p>
                          )}
                        </div>
                        <Badge variant={typeBadgeVariant(item.type) as any} className="text-[10px] shrink-0">
                          {item.typeLabel}
                        </Badge>
                        {item.priority && (
                          <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
                            {item.priority}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
