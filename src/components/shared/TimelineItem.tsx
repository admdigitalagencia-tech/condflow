import { cn } from '@/lib/utils';

interface TimelineItemProps {
  date: string;
  title: string;
  description?: string;
  variant?: 'default' | 'warning' | 'critical' | 'success';
  isLast?: boolean;
}

const dotColors = {
  default: 'bg-accent',
  warning: 'bg-amber-500',
  critical: 'bg-destructive',
  success: 'bg-emerald-500',
};

export function TimelineItem({ date, title, description, variant = 'default', isLast }: TimelineItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn('h-2.5 w-2.5 rounded-full mt-1.5 shrink-0', dotColors[variant])} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>
      <div className={cn('pb-4', isLast && 'pb-0')}>
        <p className="text-xs text-muted-foreground">{date}</p>
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  );
}
