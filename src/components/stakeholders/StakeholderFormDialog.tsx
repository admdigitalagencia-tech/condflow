import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateStakeholder, useUpdateStakeholder } from '@/hooks/useStakeholders';
import { STAKEHOLDER_TYPES, type Stakeholder } from '@/services/stakeholders';
import { useCondominiums } from '@/hooks/useCondominiums';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder?: Stakeholder | null;
  defaultCondominiumId?: string;
}

export function StakeholderFormDialog({ open, onOpenChange, stakeholder, defaultCondominiumId }: Props) {
  const isEdit = !!stakeholder;
  const create = useCreateStakeholder();
  const update = useUpdateStakeholder();
  const { data: condominiums } = useCondominiums();

  const [form, setForm] = useState({
    name: '', stakeholder_type: 'outro' as string, role_title: '',
    email: '', phone: '', preferred_contact_channel: '', notes: '',
  });

  useEffect(() => {
    if (stakeholder) {
      setForm({
        name: stakeholder.name || '',
        stakeholder_type: stakeholder.stakeholder_type || 'outro',
        role_title: stakeholder.role_title || '',
        email: stakeholder.email || '',
        phone: stakeholder.phone || '',
        preferred_contact_channel: stakeholder.preferred_contact_channel || '',
        notes: stakeholder.notes || '',
      });
    } else {
      setForm({ name: '', stakeholder_type: 'outro', role_title: '', email: '', phone: '', preferred_contact_channel: '', notes: '' });
    }
  }, [stakeholder, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      name: form.name,
      stakeholder_type: form.stakeholder_type as any,
      role_title: form.role_title || null,
      email: form.email || null,
      phone: form.phone || null,
      preferred_contact_channel: form.preferred_contact_channel || null,
      notes: form.notes || null,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: stakeholder.id, values });
        toast.success('Stakeholder atualizado');
      } else {
        await create.mutateAsync(values);
        toast.success('Stakeholder criado');
      }
      onOpenChange(false);
    } catch {
      toast.error('Erro ao guardar stakeholder');
    }
  };

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Stakeholder' : 'Novo Stakeholder'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={form.stakeholder_type} onValueChange={v => set('stakeholder_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAKEHOLDER_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role_title">Cargo / Função</Label>
              <Input id="role_title" value={form.role_title} onChange={e => set('role_title', e.target.value)} />
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
            <Label htmlFor="contact_channel">Canal de Contacto Preferido</Label>
            <Input id="contact_channel" value={form.preferred_contact_channel} onChange={e => set('preferred_contact_channel', e.target.value)} placeholder="Email, telefone, WhatsApp..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} />
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
