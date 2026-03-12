import { useState } from 'react';
import { AlertTriangle, Plus, MoreHorizontal, Pencil, Trash2, LayoutList, Columns } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTickets, useDeleteTicket } from '@/hooks/useTickets';
import { useCondominiums } from '@/hooks/useCondominiums';
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES, categoryLabel } from '@/services/tickets';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar } from '@/components/shared/FilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/tickets/TicketBadges';
import { TicketFormDialog } from '@/components/tickets/TicketFormDialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { Ticket } from '@/services/tickets';

export default function Ocorrencias() {
  const nav = useNavigate();
  const { data: tickets, isLoading } = useTickets();
  const { data: condominiums } = useCondominiums();
  const deleteMutation = useDeleteTicket();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [priFilter, setPriFilter] = useState('all');
  const [staFilter, setStaFilter] = useState('all');
  const [condoFilter, setCondoFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const filtered = (tickets || []).filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      (t.condominiums?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || t.category === catFilter;
    const matchPri = priFilter === 'all' || t.priority === priFilter;
    const matchSta = staFilter === 'all' || t.status === staFilter;
    const matchCondo = condoFilter === 'all' || t.condominium_id === condoFilter;
    return matchSearch && matchCat && matchPri && matchSta && matchCondo;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar esta ocorrência?')) return;
    try { await deleteMutation.mutateAsync(id); toast.success('Ocorrência eliminada'); }
    catch { toast.error('Erro ao eliminar'); }
  };

  const handleEdit = (t: Ticket) => { setEditing(t); setDialogOpen(true); };
  const handleNew = () => { setEditing(null); setDialogOpen(true); };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-PT') : '—';
  const isOverdue = (t: any) => t.due_date && new Date(t.due_date) < new Date() && !['resolvido', 'encerrado'].includes(t.status);

  // Kanban groups
  const kanbanColumns = TICKET_STATUSES.map(s => ({
    ...s,
    items: filtered.filter(t => t.status === s.value),
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ocorrências"
        description="Gestão de tickets e ocorrências técnicas"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex border rounded-md">
              <Button variant={viewMode === 'table' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-r-none" onClick={() => setViewMode('table')}>
                <LayoutList className="h-3.5 w-3.5" />
              </Button>
              <Button variant={viewMode === 'kanban' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8 rounded-l-none" onClick={() => setViewMode('kanban')}>
                <Columns className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button size="sm" className="gap-1.5" onClick={handleNew}><Plus className="h-3.5 w-3.5" /> Nova Ocorrência</Button>
          </div>
        }
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar por código, título ou condomínio..."
        filters={[
          { key: 'condo', placeholder: 'Condomínio', value: condoFilter, onChange: setCondoFilter,
            options: (condominiums || []).map(c => ({ label: c.name, value: c.id })) },
          { key: 'cat', placeholder: 'Categoria', value: catFilter, onChange: setCatFilter,
            options: TICKET_CATEGORIES.map(c => ({ label: c.label, value: c.value })) },
          { key: 'pri', placeholder: 'Prioridade', value: priFilter, onChange: setPriFilter,
            options: TICKET_PRIORITIES.map(p => ({ label: p.label, value: p.value })) },
          { key: 'sta', placeholder: 'Status', value: staFilter, onChange: setStaFilter,
            options: TICKET_STATUSES.map(s => ({ label: s.label, value: s.value })) },
        ]}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="Sem ocorrências" description={search ? 'Nenhum resultado encontrado.' : 'Crie a primeira ocorrência.'} actionLabel={!search ? 'Nova Ocorrência' : undefined} onAction={!search ? handleNew : undefined} />
      ) : viewMode === 'table' ? (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Código</TableHead>
                <TableHead>Condomínio</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id} className="cursor-pointer" onClick={() => nav(`/ocorrencias/${t.id}`)}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{t.code}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{t.condominiums?.name || '—'}</TableCell>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{categoryLabel(t.category)}</TableCell>
                  <TableCell><TicketPriorityBadge priority={t.priority} /></TableCell>
                  <TableCell><TicketStatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{t.suppliers?.name || '—'}</TableCell>
                  <TableCell className={isOverdue(t) ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                    {formatDate(t.due_date)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => handleEdit(t)}><Pencil className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 mr-2" /> Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Kanban View */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(col => (
            <div key={col.value} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col.label}</span>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{col.items.length}</span>
              </div>
              <div className="space-y-2">
                {col.items.map(t => (
                  <div
                    key={t.id}
                    className="rounded-lg border bg-card p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => nav(`/ocorrencias/${t.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-[10px] text-muted-foreground">{t.code}</span>
                      <TicketPriorityBadge priority={t.priority} />
                    </div>
                    <p className="text-sm font-medium line-clamp-2 mb-1">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.condominiums?.name}</p>
                    {t.due_date && (
                      <p className={`text-xs mt-1 ${isOverdue(t) ? 'text-destructive' : 'text-muted-foreground'}`}>
                        Prazo: {formatDate(t.due_date)}
                      </p>
                    )}
                  </div>
                ))}
                {col.items.length === 0 && (
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-xs text-muted-foreground">Sem ocorrências</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <TicketFormDialog open={dialogOpen} onOpenChange={setDialogOpen} ticket={editing} />
    </div>
  );
}
