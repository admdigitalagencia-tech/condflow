import { Badge } from '@/components/ui/badge';
import { TaskStatus, TaskPriority, statusLabel, priorityLabel } from '@/services/tasks';

const statusStyles: Record<TaskStatus, string> = {
  pendente: 'bg-muted text-muted-foreground',
  em_andamento: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  bloqueada: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  concluida: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelada: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
};

const priorityStyles: Record<TaskPriority, string> = {
  baixa: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  media: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  alta: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  urgente: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge className={`text-[11px] font-medium border-0 ${statusStyles[status]}`}>{statusLabel(status)}</Badge>;
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge className={`text-[11px] font-medium border-0 ${priorityStyles[priority]}`}>{priorityLabel(priority)}</Badge>;
}
