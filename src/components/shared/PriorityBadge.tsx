import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const priorityStyles: Record<string, string> = {
  'Baixa': 'badge-priority-low',
  'Média': 'badge-priority-medium',
  'Alta': 'badge-priority-high',
  'Crítica': 'badge-priority-critical',
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant="outline" className={cn('text-[11px] font-medium rounded-md px-2 py-0.5', priorityStyles[priority])}>
      {priority}
    </Badge>
  );
}
