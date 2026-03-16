import { useState, useMemo } from 'react';
import {
  CalendarDays, ListChecks, AlertTriangle, Landmark, Filter,
  ChevronLeft, ChevronRight, List, LayoutGrid,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  format, parseISO, isToday, isTomorrow, isThisWeek,
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isSameMonth, isSameDay,
} from 'date-fns';
import { pt } from 'date-fns/locale';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAgendaItems, DeadlineItem } from '@/hooks/useDeadlineNotifications';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const typeIcon = (type: DeadlineItem['type']) => {
  switch (type) {
    case 'task': return <ListChecks className="h-3.5 w-3.5 text-primary" />;
    case 'ticket': return <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />;
    case 'assembly': return <Landmark className="h-3.5 w-3.5 text-blue-500" />;
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
  const d = parseISO(dateStr + 'T00:00:00');
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

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function CalendarView({
  items,
  currentMonth,
  onMonthChange,
  onSelectDate,
  selectedDate,
}: {
  items: DeadlineItem[];
  currentMonth: Date;
  onMonthChange: (d: Date) => void;
  onSelectDate: (d: string | null) => void;
  selectedDate: string | null;
}) {
  const navigate = useNavigate();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const itemsByDate = useMemo(() => {
    const map: Record<string, DeadlineItem[]> = {};
    items.forEach(i => {
      if (!map[i.date]) map[i.date] = [];
      map[i.date].push(i);
    });
    return map;
  }, [items]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Monday=0 offset
  const startDayOfWeek = (getDay(monthStart) + 6) % 7;

  const selectedItems = selectedDate ? (itemsByDate[selectedDate] || []) : [];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => onMonthChange(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-base font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: pt })}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => onMonthChange(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="border rounded-xl overflow-hidden bg-card">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for offset */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border-b border-r last:border-r-0 bg-muted/10" />
          ))}

          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayItems = itemsByDate[dateStr] || [];
            const isSelected = selectedDate === dateStr;
            const today = dateStr === todayStr;
            const overdue = dateStr < todayStr && dayItems.length > 0;

            return (
              <div
                key={dateStr}
                className={cn(
                  'min-h-[80px] border-b border-r p-1.5 cursor-pointer transition-colors hover:bg-muted/40',
                  isSelected && 'bg-primary/10 ring-1 ring-inset ring-primary/30',
                  today && !isSelected && 'bg-accent/40',
                )}
                onClick={() => onSelectDate(isSelected ? null : dateStr)}
              >
                <div className={cn(
                  'text-xs font-medium mb-1',
                  today && 'text-primary font-bold',
                  overdue && dayItems.length > 0 && 'text-destructive',
                  !today && !overdue && 'text-foreground',
                )}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-0.5">
                  {dayItems.slice(0, 3).map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-1 rounded px-1 py-0.5 text-[10px] truncate',
                        item.type === 'task' && 'bg-primary/10 text-primary',
                        item.type === 'ticket' && 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
                        item.type === 'assembly' && 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
                      )}
                      onClick={e => { e.stopPropagation(); navigate(item.route); }}
                    >
                      {typeIcon(item.type)}
                      <span className="truncate">{item.title}</span>
                    </div>
                  ))}
                  {dayItems.length > 3 && (
                    <span className="text-[10px] text-muted-foreground pl-1">+{dayItems.length - 3} mais</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected date detail */}
      {selectedDate && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold capitalize">{dateLabel(selectedDate)}</h4>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem eventos neste dia.</p>
          ) : (
            selectedItems.map(item => (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(item.route)}>
                <CardContent className="flex items-center gap-3 py-3 px-4">
                  {typeIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.condominiumName && <p className="text-xs text-muted-foreground truncate">{item.condominiumName}</p>}
                  </div>
                  <Badge variant={typeBadgeVariant(item.type) as any} className="text-[10px] shrink-0">{item.typeLabel}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function Agenda() {
  const items = useAgendaItems();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={v => setView(v as any)}>
              <TabsList className="h-9">
                <TabsTrigger value="calendar" className="gap-1.5 text-xs px-3">
                  <LayoutGrid className="h-3.5 w-3.5" /> Calendário
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-1.5 text-xs px-3">
                  <List className="h-3.5 w-3.5" /> Lista
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
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
          </div>
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

      {view === 'calendar' ? (
        <CalendarView
          items={filtered}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          onSelectDate={setSelectedDate}
          selectedDate={selectedDate}
        />
      ) : grouped.length === 0 ? (
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
                  <h3 className={cn(
                    'text-sm font-semibold capitalize',
                    overdue ? 'text-destructive' : today ? 'text-primary' : 'text-foreground',
                  )}>
                    {dateLabel(date)}
                  </h3>
                  {overdue && <Badge variant="destructive" className="text-[10px]">Atrasado</Badge>}
                  {today && <Badge className="text-[10px]">Hoje</Badge>}
                </div>
                <div className="space-y-2">
                  {dateItems.map(item => (
                    <Card
                      key={item.id}
                      className={cn(
                        'cursor-pointer hover:shadow-md transition-shadow',
                        overdue && 'border-destructive/30 bg-destructive/5',
                        today && 'border-primary/30 bg-primary/5',
                      )}
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
