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
  default: { iconBg: 'bg-primary/8', icon: 'text-primary', value: 'text-foreground' },
  warning: { iconBg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700' },
  critical: { iconBg: 'bg-red-50', icon: 'text-red-600', value: 'text-red-700' },
  success: { iconBg: 'bg-emerald-50', icon: 'text-emerald-600', value: 'text-emerald-700' },
};

export function KPICard({ label, value, icon: Icon, variant = 'default', trend, onClick }: KPICardProps) {
  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        'stat-card text-left w-full group',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110', styles.iconBg)}>
          <Icon className={cn('h-4 w-4', styles.icon)} />
        </div>
      </div>
      <p className={cn('text-2xl font-bold tracking-tight', styles.value)}>{value}</p>
      {trend && <p className="text-[11px] text-muted-foreground mt-1.5">{trend}</p>}
    </button>
  );
}
