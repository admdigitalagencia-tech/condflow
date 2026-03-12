import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  'Aberto': 'badge-status-open',
  'Em Análise': 'badge-status-analysis',
  'Orçamento Solicitado': 'badge-status-budget',
  'Aguardando Aprovação': 'badge-status-approval',
  'Em Execução': 'badge-status-execution',
  'Resolvido': 'badge-status-resolved',
  'Encerrado': 'badge-status-closed',
  'Agendada': 'badge-status-analysis',
  'Em Curso': 'badge-status-execution',
  'Concluída': 'badge-status-resolved',
  'Cancelada': 'badge-status-closed',
  'active': 'badge-status-resolved',
  'inactive': 'badge-status-closed',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('text-[11px]', statusStyles[status])}>
      {status}
    </Badge>
  );
}
