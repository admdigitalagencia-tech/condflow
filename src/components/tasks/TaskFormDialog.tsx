import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCondominiums } from '@/hooks/useCondominiums';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { Task, TaskFormData, TaskStatus, TaskPriority } from '@/services/tasks';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultTicketId?: string;
  defaultCondominiumId?: string;
}

export function TaskFormDialog({ open, onOpenChange, task, defaultTicketId, defaultCondominiumId }: Props) {
  const { data: condominiums } = useCondominiums();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEdit = !!task;

  const [form, setForm] = useState<TaskFormData>({
    title: '',
    description: '',
    condominium_id: '',
    priority: 'media',
    status: 'pendente',
    due_date: null,
    task_type: 'manual',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        condominium_id: task.condominium_id || '',
        priority: task.priority,
        status: task.status,
        due_date: task.due_date,
        task_type: task.task_type,
        ticket_id: task.ticket_id || defaultTicketId || null,
      });
    } else {
      setForm({ title: '', description: '', condominium_id: defaultCondominiumId || '', priority: 'media', status: 'pendente', due_date: null, task_type: 'manual', ticket_id: defaultTicketId || null });
    }
  }, [task, open]);

  const handleSubmit = async () => {
    if (!form.title.trim()) return;

    if (isEdit && task) {
      const updates: Partial<TaskFormData> & { completed_at?: string | null } = {
        title: form.title,
        description: form.description || undefined,
        condominium_id: form.condominium_id || undefined,
        priority: form.priority,
        status: form.status,
        due_date: form.due_date,
        task_type: form.task_type,
        ticket_id: form.ticket_id || undefined,
      };
      if (form.status === 'concluida' && task.status !== 'concluida') {
        updates.completed_at = new Date().toISOString();
      } else if (form.status !== 'concluida') {
        updates.completed_at = null;
      }
      await updateTask.mutateAsync({ id: task.id, ...updates });
    } else {
      await createTask.mutateAsync(form);
    }
    onOpenChange(false);
  };

  const saving = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título da tarefa" />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detalhes da tarefa" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condomínio</Label>
              <Select value={form.condominium_id || ''} onValueChange={v => setForm(f => ({ ...f, condominium_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {(condominiums || []).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prazo</Label>
              <Input type="date" value={form.due_date || ''} onChange={e => setForm(f => ({ ...f, due_date: e.target.value || null }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as TaskPriority }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as TaskStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="bloqueada">Bloqueada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving || !form.title.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Salvar' : 'Criar Tarefa'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
