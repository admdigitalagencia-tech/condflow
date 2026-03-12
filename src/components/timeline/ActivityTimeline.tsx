import { ActivityLog, actionTypeConfig, ActionType } from '@/services/activityLogs';
import {
  AlertTriangle, Calendar, CheckCircle2, FileText, BookOpen, ListChecks, Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  'alert-triangle': AlertTriangle,
  'calendar': Calendar,
  'check-circle': CheckCircle2,
  'file-text': FileText,
  'book-open': BookOpen,
  'list-checks': ListChecks,
};

const variantColors = {
  default: 'bg-muted text-muted-foreground',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  critical: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
};

interface Props {
  logs: ActivityLog[];
}

export function ActivityTimeline({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-muted-foreground">
        <Activity className="h-6 w-6 opacity-40 mb-2" />
        <p className="text-sm">Nenhum evento registado</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

      {logs.map((log, i) => {
        const config = actionTypeConfig[log.action_type as ActionType] || {
          label: log.action_type,
          icon: 'activity',
          variant: 'default' as const,
        };
        const Icon = iconMap[config.icon] || Activity;
        const isLast = i === logs.length - 1;
        const date = new Date(log.created_at);

        return (
          <div key={log.id} className={cn('relative flex gap-4', !isLast && 'pb-6')}>
            {/* Icon circle */}
            <div className={cn(
              'absolute -left-8 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background',
              variantColors[config.variant],
            )}>
              <Icon className="h-3.5 w-3.5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{log.description}</p>
                <time className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                  {date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {' · '}
                  {date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{config.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
