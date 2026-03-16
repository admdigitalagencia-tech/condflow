import { supabase } from '@/integrations/supabase/client';

export type TaskStatus = 'pendente' | 'em_andamento' | 'bloqueada' | 'concluida' | 'cancelada';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface Task {
  id: string;
  organization_id: string | null;
  condominium_id: string | null;
  ticket_id: string | null;
  assembly_id: string | null;
  title: string;
  description: string | null;
  task_type: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assigned_user_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  condominiums?: { name: string } | null;
  tickets?: { code: string; title: string } | null;
  assemblies?: { title: string } | null;
  profiles?: { full_name: string | null } | null;
}

export interface TaskFormData {
  title: string;
  description?: string;
  condominium_id?: string;
  ticket_id?: string | null;
  assembly_id?: string | null;
  task_type?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assigned_user_id?: string | null;
}

export const statusLabel = (s: TaskStatus) => ({
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  bloqueada: 'Bloqueada',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}[s]);

export const priorityLabel = (p: TaskPriority) => ({
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}[p]);

export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, condominiums(name), tickets(code, title), assemblies(title)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Task[];
}

export async function fetchTask(id: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, condominiums(name), tickets(code, title), assemblies(title)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as unknown as Task;
}

export async function createTask(form: TaskFormData) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: form.title,
      description: form.description || null,
      condominium_id: form.condominium_id || null,
      ticket_id: form.ticket_id || null,
      assembly_id: form.assembly_id || null,
      task_type: form.task_type || 'manual',
      status: form.status || 'pendente',
      priority: form.priority || 'media',
      due_date: form.due_date || null,
      assigned_user_id: form.assigned_user_id || null,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, form: Partial<TaskFormData> & { completed_at?: string | null }) {
  const clean: Record<string, any> = {};
  const allowedKeys = ['title', 'description', 'condominium_id', 'ticket_id', 'assembly_id', 'task_type', 'status', 'priority', 'due_date', 'assigned_user_id', 'completed_at'];
  for (const key of allowedKeys) {
    if (key in form) {
      const val = (form as any)[key];
      clean[key] = (typeof val === 'string' && val.trim() === '') ? null : val;
    }
  }
  const { data, error } = await supabase
    .from('tasks')
    .update(clean)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchTaskStats() {
  const { data, error } = await supabase
    .from('tasks')
    .select('status, priority, due_date')
    .in('status', ['pendente', 'em_andamento', 'bloqueada']);

  if (error) throw error;

  const today = new Date().toISOString().split('T')[0];
  const tasks = data || [];

  return {
    pending: tasks.filter(t => (t as any).status === 'pendente').length,
    overdue: tasks.filter(t => (t as any).due_date && (t as any).due_date < today).length,
    urgent: tasks.filter(t => (t as any).priority === 'urgente').length,
    today: tasks.filter(t => (t as any).due_date === today).length,
    total: tasks.length,
  };
}
