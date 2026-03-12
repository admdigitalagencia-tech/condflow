import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Plus, Search, ListChecks, Link2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { TaskStatusBadge, TaskPriorityBadge } from '@/components/tasks/TaskBadges';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { useTasks } from '@/hooks/useTasks';
import { useCondominiums } from '@/hooks/useCondominiums';
import { Task, TaskStatus, TaskPriority } from '@/services/tasks';
import { Badge } from '@/components/ui/badge';

export default function Tarefas() {
  const { data: tasks, isLoading } = useTasks();
  const { data: condominiums } = useCondominiums();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [condFilter, setCondFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    let list = tasks || [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') list = list.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') list = list.filter(t => t.priority === priorityFilter);
    if (condFilter !== 'all') list = list.filter(t => t.condominium_id === condFilter);
    return list;
  }, [tasks, search, statusFilter, priorityFilter, condFilter]);

  const getOrigin = (t: Task) => {
    if (t.ticket_id && t.tickets) return <Badge variant="outline" className="text-[10px] gap-1"><Link2 className="h-3 w-3" />{t.tickets.code}</Badge>;
    if (t.assembly_id && t.assemblies) return <Badge variant="outline" className="text-[10px] gap-1"><Link2 className="h-3 w-3" />Assembleia</Badge>;
    return <span className="text-xs text-muted-foreground">Manual</span>;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tarefas" description="Gestão de tarefas operacionais" actions={
        <Button onClick={() => { setEditTask(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Tarefa
        </Button>
      } />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquisar tarefas..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="bloqueada">Bloqueada</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
        <Select value={condFilter} onValueChange={setCondFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Condomínio" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {(condominiums || []).map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">A carregar...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ListChecks} title="Sem tarefas" description="Crie a primeira tarefa para começar" />
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[35%]">Tarefa</TableHead>
                <TableHead>Condomínio</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => {
                const overdue = t.due_date && t.status !== 'concluida' && t.status !== 'cancelada' && t.due_date < new Date().toISOString().split('T')[0];
                return (
                  <TableRow key={t.id} className="cursor-pointer hover:bg-muted/40" onClick={() => { setEditTask(t); setDialogOpen(true); }}>
                    <TableCell>
                      <p className="text-sm font-medium truncate">{t.title}</p>
                      {t.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{t.description}</p>}
                    </TableCell>
                    <TableCell className="text-sm">{t.condominiums?.name || '—'}</TableCell>
                    <TableCell><TaskPriorityBadge priority={t.priority} /></TableCell>
                    <TableCell><TaskStatusBadge status={t.status} /></TableCell>
                    <TableCell>
                      {t.due_date ? (
                        <span className={`text-sm ${overdue ? 'text-destructive font-medium' : ''}`}>
                          {format(new Date(t.due_date + 'T00:00:00'), 'dd MMM yyyy', { locale: pt })}
                        </span>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{getOrigin(t)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TaskFormDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editTask} />
    </div>
  );
}
