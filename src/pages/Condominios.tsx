import { useState } from 'react';
import { Building2, Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCondominiums, useDeleteCondominium } from '@/hooks/useCondominiums';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar } from '@/components/shared/FilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CondominiumFormDialog } from '@/components/condominiums/CondominiumFormDialog';
import type { Condominium } from '@/services/condominiums';
import { toast } from 'sonner';

export default function Condominios() {
  const nav = useNavigate();
  const { data: condominiums, isLoading } = useCondominiums();
  const deleteMutation = useDeleteCondominium();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Condominium | null>(null);

  const filtered = (condominiums || []).filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.address_line || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? c.active : !c.active);
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este condomínio?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Condomínio eliminado');
    } catch {
      toast.error('Erro ao eliminar condomínio');
    }
  };

  const handleEdit = (c: Condominium) => {
    setEditing(c);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-PT');

  return (
    <div className="space-y-4">
      <PageHeader
        title="Condomínios"
        description="Gestão dos condomínios administrados"
        actions={<Button size="sm" className="gap-1.5" onClick={handleNew}><Plus className="h-3.5 w-3.5" /> Novo Condomínio</Button>}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar por nome, morada ou cidade..."
        filters={[{
          key: 'status', placeholder: 'Estado', value: statusFilter, onChange: setStatusFilter,
          options: [{ label: 'Ativo', value: 'active' }, { label: 'Inativo', value: 'inactive' }],
        }]}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Sem condomínios"
          description={search ? 'Nenhum condomínio encontrado com os filtros aplicados.' : 'Adicione o primeiro condomínio para começar.'}
          actionLabel={!search ? 'Novo Condomínio' : undefined}
          onAction={!search ? handleNew : undefined}
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Morada</TableHead>
                <TableHead>NIF</TableHead>
                <TableHead className="text-center">Frações</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => nav(`/condominios/${c.id}`)}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[c.address_line, c.city].filter(Boolean).join(', ')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.nif || '—'}</TableCell>
                  <TableCell className="text-center">{c.fractions_count || '—'}</TableCell>
                  <TableCell><StatusBadge status={c.active ? 'active' : 'inactive'} /></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(c.updated_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => handleEdit(c)}>
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CondominiumFormDialog open={dialogOpen} onOpenChange={setDialogOpen} condominium={editing} />
    </div>
  );
}
