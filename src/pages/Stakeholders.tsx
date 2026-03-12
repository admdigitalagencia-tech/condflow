import { useState } from 'react';
import { Users, Plus, Pencil, Trash2, MoreHorizontal, Mail, Phone } from 'lucide-react';
import { useStakeholders, useDeleteStakeholder } from '@/hooks/useStakeholders';
import { useCondominiums } from '@/hooks/useCondominiums';
import { STAKEHOLDER_TYPES } from '@/services/stakeholders';
import type { Stakeholder } from '@/services/stakeholders';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar } from '@/components/shared/FilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StakeholderFormDialog } from '@/components/stakeholders/StakeholderFormDialog';
import { toast } from 'sonner';

export default function Stakeholders() {
  const { data: stakeholders, isLoading } = useStakeholders();
  const deleteMutation = useDeleteStakeholder();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Stakeholder | null>(null);

  const filtered = (stakeholders || []).filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || s.stakeholder_type === typeFilter;
    return matchSearch && matchType;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este stakeholder?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Stakeholder eliminado');
    } catch {
      toast.error('Erro ao eliminar stakeholder');
    }
  };

  const handleEdit = (s: Stakeholder) => { setEditing(s); setDialogOpen(true); };
  const handleNew = () => { setEditing(null); setDialogOpen(true); };

  const typeLabel = (t: string) => STAKEHOLDER_TYPES.find(st => st.value === t)?.label || t;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stakeholders"
        description="Contactos e intervenientes dos condomínios"
        actions={<Button size="sm" className="gap-1.5" onClick={handleNew}><Plus className="h-3.5 w-3.5" /> Novo Stakeholder</Button>}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar por nome ou email..."
        filters={[{
          key: 'type', placeholder: 'Tipo', value: typeFilter, onChange: setTypeFilter,
          options: STAKEHOLDER_TYPES.map(t => ({ label: t.label, value: t.value })),
        }]}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Sem stakeholders" description={search ? 'Nenhum resultado encontrado.' : 'Adicione o primeiro stakeholder.'} actionLabel={!search ? 'Novo Stakeholder' : undefined} onAction={!search ? handleNew : undefined} />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">{typeLabel(s.stakeholder_type)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.role_title || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {s.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>}
                      {s.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(s)}><Pencil className="h-4 w-4 mr-2" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 mr-2" /> Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <StakeholderFormDialog open={dialogOpen} onOpenChange={setDialogOpen} stakeholder={editing} />
    </div>
  );
}
