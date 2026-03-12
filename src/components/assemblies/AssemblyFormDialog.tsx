import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCondominiums } from '@/hooks/useCondominiums';
import { useCreateAssembly, useUpdateAssembly } from '@/hooks/useAssemblies';
import { ASSEMBLY_TYPES } from '@/services/assemblies';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  assembly?: any;
}

export function AssemblyFormDialog({ open, onOpenChange, assembly }: Props) {
  const { data: condominiums } = useCondominiums();
  const createMutation = useCreateAssembly();
  const updateMutation = useUpdateAssembly();
  const isEdit = !!assembly;

  const [form, setForm] = useState({
    condominium_id: assembly?.condominium_id || '',
    title: assembly?.title || '',
    assembly_type: assembly?.assembly_type || 'ordinaria',
    scheduled_date: assembly?.scheduled_date || '',
    scheduled_time: assembly?.scheduled_time?.slice(0, 5) || '',
    location: assembly?.location || '',
    agenda_text: assembly?.agenda_text || '',
    notes: assembly?.notes || '',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.condominium_id || !form.title || !form.scheduled_date) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: assembly.id, values: form });
        toast.success('Assembleia atualizada');
      } else {
        await createMutation.mutateAsync(form as any);
        toast.success('Assembleia criada');
      }
      onOpenChange(false);
    } catch {
      toast.error('Erro ao guardar assembleia');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{isEdit ? 'Editar Assembleia' : 'Nova Assembleia'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Condomínio *</Label>
            <Select value={form.condominium_id} onValueChange={v => set('condominium_id', v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>
                {(condominiums || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Assembleia Geral Ordinária 2025" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.assembly_type} onValueChange={v => set('assembly_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSEMBLY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input type="time" value={form.scheduled_time} onChange={e => set('scheduled_time', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Local</Label>
              <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Salão do condomínio" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ordem de Trabalhos</Label>
            <Textarea value={form.agenda_text} onChange={e => set('agenda_text', e.target.value)} rows={3} placeholder="1. Aprovação de contas&#10;2. Orçamento anual&#10;3. Diversos" />
          </div>
          <div className="space-y-2">
            <Label>Notas do Gestor</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
            {isEdit ? 'Guardar' : 'Criar Assembleia'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
