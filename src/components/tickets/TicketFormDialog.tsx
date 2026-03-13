import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTicket, useUpdateTicket } from '@/hooks/useTickets';
import { useCondominiums } from '@/hooks/useCondominiums';
import { useSuppliers } from '@/hooks/useSuppliers';
import { TICKET_CATEGORIES, TICKET_PRIORITIES, type Ticket } from '@/services/tickets';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: Ticket | null;
  defaultCondominiumId?: string;
}

export function TicketFormDialog({ open, onOpenChange, ticket, defaultCondominiumId }: Props) {
  const isEdit = !!ticket;
  const create = useCreateTicket();
  const update = useUpdateTicket();
  const { data: condominiums } = useCondominiums();
  const { data: suppliers } = useSuppliers();

  const [form, setForm] = useState({
    condominium_id: '', title: '', description: '', category: 'administrativo',
    location_text: '', source_channel: '', priority: 'media',
    supplier_id: '', due_date: '',
  });

  useEffect(() => {
    if (ticket) {
      setForm({
        condominium_id: ticket.condominium_id,
        title: ticket.title,
        description: ticket.description || '',
        category: ticket.category,
        location_text: ticket.location_text || '',
        source_channel: ticket.source_channel || '',
        priority: ticket.priority,
        supplier_id: ticket.supplier_id || '',
        due_date: ticket.due_date || '',
      });
    } else {
      setForm({
        condominium_id: defaultCondominiumId || '',
        title: '', description: '', category: 'administrativo',
        location_text: '', source_channel: '', priority: 'media',
        supplier_id: '', due_date: '',
      });
    }
  }, [ticket, open, defaultCondominiumId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = {
      condominium_id: form.condominium_id,
      title: form.title,
      description: form.description || null,
      category: form.category as any,
      priority: form.priority as any,
      location_text: form.location_text || null,
      source_channel: form.source_channel || null,
      supplier_id: form.supplier_id && form.supplier_id !== 'none' ? form.supplier_id : null,
      due_date: form.due_date || null,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: ticket.id, values });
        toast.success('Ocorrência atualizada');
      } else {
        await create.mutateAsync(values);
        toast.success('Ocorrência criada');
      }
      onOpenChange(false);
    } catch {
      toast.error('Erro ao guardar ocorrência');
    }
  };

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Ocorrência' : 'Nova Ocorrência'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Condomínio */}
          <div className="space-y-2">
            <Label>Condomínio *</Label>
            <Select value={form.condominium_id} onValueChange={v => set('condominium_id', v)} required>
              <SelectTrigger><SelectValue placeholder="Selecionar condomínio..." /></SelectTrigger>
              <SelectContent>
                {(condominiums || []).filter(c => c.active).map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Descreva resumidamente o problema" />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Detalhes da ocorrência..." />
          </div>

          {/* Categoria + Prioridade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TICKET_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade *</Label>
              <Select value={form.priority} onValueChange={v => set('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TICKET_PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Local + Origem */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="location_text">Local</Label>
              <Input id="location_text" value={form.location_text} onChange={e => set('location_text', e.target.value)} placeholder="Ex: Piso -1, Hall R/C..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source_channel">Origem</Label>
              <Input id="source_channel" value={form.source_channel} onChange={e => set('source_channel', e.target.value)} placeholder="Condómino, inspeção, admin..." />
            </div>
          </div>

          {/* Fornecedor + Visita Agendada */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select value={form.supplier_id} onValueChange={v => set('supplier_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {(suppliers || []).filter(s => s.active).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Visita Agendada</Label>
              <Input id="due_date" type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending || update.isPending || !form.condominium_id || !form.title}>
              {create.isPending || update.isPending ? 'A guardar...' : isEdit ? 'Guardar' : 'Criar Ocorrência'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
