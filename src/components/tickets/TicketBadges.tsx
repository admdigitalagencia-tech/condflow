import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const priorityStyles: Record<string, string> = {
  baixa: 'badge-priority-low',
  media: 'badge-priority-medium',
  alta: 'badge-priority-high',
  critica: 'badge-priority-critical',
};

const priorityLabels: Record<string, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

export function TicketPriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant="outline" className={cn('text-[11px]', priorityStyles[priority])}>
      {priorityLabels[priority] || priority}
    </Badge>
  );
}

const statusStyles: Record<string, string> = {
  aberto: 'badge-status-open',
  em_analise: 'badge-status-analysis',
  orcamento_solicitado: 'badge-status-budget',
  aguardando_aprovacao: 'badge-status-approval',
  em_execucao: 'badge-status-execution',
  resolvido: 'badge-status-resolved',
  encerrado: 'badge-status-closed',
};

const statusLabels: Record<string, string> = {
  aberto: 'Aberto',
  em_analise: 'Em Análise',
  orcamento_solicitado: 'Orçamento Solicitado',
  aguardando_aprovacao: 'Aguardando Aprovação',
  em_execucao: 'Em Execução',
  resolvido: 'Resolvido',
  encerrado: 'Encerrado',
};

export function TicketStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('text-[11px]', statusStyles[status])}>
      {statusLabels[status] || status}
    </Badge>
  );
}
