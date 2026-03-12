import { useState } from 'react';
import { Truck, Plus, Pencil, Trash2, MoreHorizontal, Mail, Phone } from 'lucide-react';
import { useSuppliers, useDeleteSupplier } from '@/hooks/useSuppliers';
import { SUPPLIER_CATEGORIES } from '@/services/suppliers';
import type { Supplier } from '@/services/suppliers';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar } from '@/components/shared/FilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SupplierFormDialog } from '@/components/suppliers/SupplierFormDialog';
import { toast } from 'sonner';

export default function Fornecedores() {
  const { data: suppliers, isLoading } = useSuppliers();
  const deleteMutation = useDeleteSupplier();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const filtered = (suppliers || []).filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.nif || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || s.supplier_category === catFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este fornecedor?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Fornecedor eliminado');
    } catch {
      toast.error('Erro ao eliminar fornecedor');
    }
  };

  const handleEdit = (s: Supplier) => { setEditing(s); setDialogOpen(true); };
  const handleNew = () => { setEditing(null); setDialogOpen(true); };

  const catLabel = (c: string) => SUPPLIER_CATEGORIES.find(sc => sc.value === c)?.label || c;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fornecedores"
        description="Gestão de fornecedores e prestadores de serviços"
        actions={<Button size="sm" className="gap-1.5" onClick={handleNew}><Plus className="h-3.5 w-3.5" /> Novo Fornecedor</Button>}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar por nome ou NIF..."
        filters={[{
          key: 'cat', placeholder: 'Categoria', value: catFilter, onChange: setCatFilter,
          options: SUPPLIER_CATEGORIES.map(c => ({ label: c.label, value: c.value })),
        }]}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Truck} title="Sem fornecedores" description={search ? 'Nenhum resultado encontrado.' : 'Registe o primeiro fornecedor.'} actionLabel={!search ? 'Novo Fornecedor' : undefined} onAction={!search ? handleNew : undefined} />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>NIF</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">{catLabel(s.supplier_category)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.nif || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {s.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>}
                      {s.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={s.active ? 'active' : 'inactive'} /></TableCell>
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

      <SupplierFormDialog open={dialogOpen} onOpenChange={setDialogOpen} supplier={editing} />
    </div>
  );
}
