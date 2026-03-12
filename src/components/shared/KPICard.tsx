import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'critical' | 'success';
  trend?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: { icon: 'text-accent', value: 'text-foreground' },
  warning: { icon: 'text-amber-500', value: 'text-amber-600' },
  critical: { icon: 'text-destructive', value: 'text-destructive' },
  success: { icon: 'text-emerald-500', value: 'text-emerald-600' },
};

export function KPICard({ label, value, icon: Icon, variant = 'default', trend, onClick }: KPICardProps) {
  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        'stat-card text-left w-full animate-fade-in',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        <Icon className={cn('h-4 w-4', styles.icon)} />
      </div>
      <p className={cn('text-2xl font-bold', styles.value)}>{value}</p>
      {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
    </button>
  );
}
