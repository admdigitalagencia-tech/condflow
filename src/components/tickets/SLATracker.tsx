import { Check, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SLAStage {
  key: string;
  label: string;
  completedAt: string | null;
}

const SLA_STAGES: { key: string; label: string; field: string }[] = [
  { key: 'supplier_contacted', label: 'Fornecedor acionado', field: 'sla_supplier_contacted_at' },
  { key: 'visit_done', label: 'Visita realizada', field: 'sla_visit_done_at' },
  { key: 'quote_received', label: 'Orçamento recebido', field: 'sla_quote_received_at' },
  { key: 'quote_approved', label: 'Orçamento aprovado', field: 'sla_quote_approved_at' },
  { key: 'in_construction', label: 'Em obra', field: 'sla_in_construction_at' },
  { key: 'completed', label: 'Conclusão', field: 'sla_completed_at' },
];

interface SLATrackerProps {
  ticket: Record<string, any>;
  onToggle?: (field: string, currentValue: string | null) => void;
  readonly?: boolean;
}

export function SLATracker({ ticket, onToggle, readonly = false }: SLATrackerProps) {
  const stages = SLA_STAGES.map(s => ({
    ...s,
    completedAt: ticket[s.field] as string | null,
  }));

  const currentIndex = stages.findIndex(s => !s.completedAt);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-1">
      {stages.map((stage, i) => {
        const isDone = !!stage.completedAt;
        const isCurrent = i === currentIndex;

        return (
          <button
            key={stage.key}
            type="button"
            disabled={readonly}
            onClick={() => onToggle?.(stage.field, stage.completedAt)}
            className={cn(
              'flex items-center gap-3 w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
              !readonly && 'hover:bg-muted/50 cursor-pointer',
              readonly && 'cursor-default',
              isDone && 'opacity-100',
              !isDone && !isCurrent && 'opacity-50',
            )}
          >
            <div className={cn(
              'h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2',
              isDone && 'bg-emerald-500 border-emerald-500 text-white',
              isCurrent && !isDone && 'border-primary bg-primary/10 text-primary',
              !isDone && !isCurrent && 'border-muted-foreground/30 text-muted-foreground/30',
            )}>
              {isDone ? <Check className="h-3.5 w-3.5" /> : isCurrent ? <Clock className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('font-medium', isDone ? 'text-foreground' : 'text-muted-foreground')}>{stage.label}</p>
              {isDone && stage.completedAt && (
                <p className="text-[11px] text-muted-foreground">{formatDate(stage.completedAt)}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { SLA_STAGES };
