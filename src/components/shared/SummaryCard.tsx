import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SummaryCard({ title, children, action, className }: SummaryCardProps) {
  return (
    <Card className={cn('shadow-sm border-border/60', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold tracking-tight">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
