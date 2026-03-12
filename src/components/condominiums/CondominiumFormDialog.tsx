import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateCondominium, useUpdateCondominium } from '@/hooks/useCondominiums';
import type { Condominium } from '@/services/condominiums';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  condominium?: Condominium | null;
}

export function CondominiumFormDialog({ open, onOpenChange, condominium }: Props) {
  const isEdit = !!condominium;
  const create = useCreateCondominium();
  const update = useUpdateCondominium();

  const [form, setForm] = useState({
    name: '', address_line: '', postal_code: '', city: '', district: '',
    nif: '', year_built: '', fractions_count: '', floors_count: '',
    notes: '', active: true,
  });

  useEffect(() => {
    if (condominium) {
      setForm({
        name: condominium.name || '',
        address_line: condominium.address_line || '',
        postal_code: condominium.postal_code || '',
        city: condominium.city || '',
        district: condominium.district || '',
        nif: condominium.nif || '',
        year_built: condominium.year_built?.toString() || '',
        fractions_count: condominium.fractions_count?.toString() || '',
        floors_count: condominium.floors_count?.toString() || '',
        notes: condominium.notes || '',
        active: condominium.active,
      });
    } else {
      setForm({ name: '', address_line: '', postal_code: '', city: '', district: '', nif: '', year_built: '', fractions_count: '', floors_count: '', notes: '', active: true });
    }
  }, [condominium, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      name: form.name,
      address_line: form.address_line || null,
      postal_code: form.postal_code || null,
      city: form.city || null,
      district: form.district || null,
      nif: form.nif || null,
      year_built: form.year_built ? parseInt(form.year_built) : null,
      fractions_count: form.fractions_count ? parseInt(form.fractions_count) : null,
      floors_count: form.floors_count ? parseInt(form.floors_count) : null,
      notes: form.notes || null,
      active: form.active,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: condominium.id, values });
        toast.success('Condomínio atualizado');
      } else {
        await create.mutateAsync(values);
        toast.success('Condomínio criado');
      }
      onOpenChange(false);
    } catch {
      toast.error('Erro ao guardar condomínio');
    }
  };

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Condomínio' : 'Novo Condomínio'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="address_line">Morada</Label>
              <Input id="address_line" value={form.address_line} onChange={e => set('address_line', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Código Postal</Label>
              <Input id="postal_code" value={form.postal_code} onChange={e => set('postal_code', e.target.value)} placeholder="0000-000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Distrito</Label>
              <Input id="district" value={form.district} onChange={e => set('district', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nif">NIF</Label>
            <Input id="nif" value={form.nif} onChange={e => set('nif', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="year_built">Ano Construção</Label>
              <Input id="year_built" type="number" value={form.year_built} onChange={e => set('year_built', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fractions_count">Nº Frações</Label>
              <Input id="fractions_count" type="number" value={form.fractions_count} onChange={e => set('fractions_count', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floors_count">Nº Pisos</Label>
              <Input id="floors_count" type="number" value={form.floors_count} onChange={e => set('floors_count', e.target.value)} />
            </div>
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
