import { useNavigate } from 'react-router-dom';
import { useAssemblies } from '@/hooks/useAssemblies';
import { PageHeader } from '@/components/shared/PageHeader';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, CalendarDays } from 'lucide-react';
import { assemblyStatusLabel } from '@/services/assemblies';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function GeradorAta() {
  const nav = useNavigate();
  const { data: assemblies, isLoading } = useAssemblies();

  const pendingMinutes = (assemblies || []).filter(
    a => a.minutes_status === 'pendente' || a.minutes_status === 'rascunho'
  );
  const otherAssemblies = (assemblies || []).filter(
    a => a.minutes_status !== 'pendente' && a.minutes_status !== 'rascunho'
  );

  const minutesStatusLabel = (s: string) => {
    switch (s) {
      case 'pendente': return 'Pendente';
      case 'rascunho': return 'Rascunho';
      case 'em_revisao': return 'Em revisão';
      case 'aprovada': return 'Aprovada';
      case 'publicada': return 'Publicada';
      default: return s;
    }
  };

  const minutesStatusVariant = (s: string) => {
    switch (s) {
      case 'pendente': return 'destructive';
      case 'rascunho': return 'secondary';
      case 'em_revisao': return 'default';
      case 'aprovada': return 'outline';
      case 'publicada': return 'outline';
      default: return 'secondary';
    }
  };

  const AssemblyRow = ({ a }: { a: any }) => (
    <div
      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors"
      onClick={() => nav(`/assembleias/${a.id}`)}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary/8 shrink-0">
          <span className="text-[10px] font-medium text-primary uppercase leading-none">
            {format(parseISO(a.scheduled_date), 'MMM', { locale: pt })}
          </span>
          <span className="text-sm font-bold text-primary leading-tight">
            {format(parseISO(a.scheduled_date), 'd')}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{a.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {(a as any).condominiums?.name}
            {a.scheduled_time ? ` · ${a.scheduled_time.slice(0, 5)}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <Badge variant={minutesStatusVariant(a.minutes_status) as any} className="text-[10px]">
          {minutesStatusLabel(a.minutes_status)}
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          {assemblyStatusLabel(a.status)}
        </Badge>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerador de Atas"
        description="Aceda rapidamente às assembleias para gerar ou editar atas"
      />

      <SummaryCard title={`Atas Pendentes (${pendingMinutes.length})`}>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">A carregar...</p>
        ) : pendingMinutes.length > 0 ? (
          <div className="space-y-1">
            {pendingMinutes.map(a => <AssemblyRow key={a.id} a={a} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <FileText className="h-5 w-5 opacity-40" />
            <p className="text-sm">Todas as atas estão em dia</p>
          </div>
        )}
      </SummaryCard>

      {otherAssemblies.length > 0 && (
        <SummaryCard title="Outras Assembleias">
          <div className="space-y-1">
            {otherAssemblies.map(a => <AssemblyRow key={a.id} a={a} />)}
          </div>
        </SummaryCard>
      )}
    </div>
  );
}
