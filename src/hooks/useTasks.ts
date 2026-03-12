import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, fetchTask, createTask, updateTask, deleteTask, fetchTaskStats, TaskFormData } from '@/services/tasks';
import { toast } from 'sonner';

export function useTasks() {
  return useQuery({ queryKey: ['tasks'], queryFn: fetchTasks });
}

export function useTask(id: string) {
  return useQuery({ queryKey: ['tasks', id], queryFn: () => fetchTask(id), enabled: !!id });
}

export function useTaskStats() {
  return useQuery({ queryKey: ['task-stats'], queryFn: fetchTaskStats });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: TaskFormData) => createTask(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task-stats'] });
      toast.success('Tarefa criada com sucesso');
    },
    onError: () => toast.error('Erro ao criar tarefa'),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...form }: { id: string } & Partial<TaskFormData> & { completed_at?: string | null }) =>
      updateTask(id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task-stats'] });
      toast.success('Tarefa atualizada');
    },
    onError: () => toast.error('Erro ao atualizar tarefa'),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task-stats'] });
      toast.success('Tarefa eliminada');
    },
    onError: () => toast.error('Erro ao eliminar tarefa'),
  });
}
