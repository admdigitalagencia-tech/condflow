import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useSuppliers';
import { SUPPLIER_CATEGORIES, type Supplier } from '@/services/suppliers';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}

export function SupplierFormDialog({ open, onOpenChange, supplier }: Props) {
  const isEdit = !!supplier;
  const create = useCreateSupplier();
  const update = useUpdateSupplier();

  const [form, setForm] = useState({
    name: '', supplier_category: 'outros' as string, nif: '',
    email: '', phone: '', address: '', notes: '', active: true,
  });

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || '',
        supplier_category: supplier.supplier_category || 'outros',
        nif: supplier.nif || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
        active: supplier.active,
      });
    } else {
      setForm({ name: '', supplier_category: 'outros', nif: '', email: '', phone: '', address: '', notes: '', active: true });
    }
  }, [supplier, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      name: form.name,
      supplier_category: form.supplier_category as any,
      nif: form.nif || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      notes: form.notes || null,
      active: form.active,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: supplier.id, values });
        toast.success('Fornecedor atualizado');
      } else {
        await create.mutateAsync(values);
        toast.success('Fornecedor criado');
      }
      onOpenChange(false);
    } catch {
      toast.error('Erro ao guardar fornecedor');
    }
  };

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={form.supplier_category} onValueChange={v => set('supplier_category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPLIER_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nif">NIF</Label>
              <Input id="nif" value={form.nif} onChange={e => set('nif', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Morada</Label>
            <Input id="address" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active">Ativo</Label>
            <Switch id="active" checked={form.active} onCheckedChange={v => set('active', v)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'A guardar...' : isEdit ? 'Guardar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
