import { CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function Agenda() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Agenda"
        description="Calendário de eventos, assembleias e prazos"
      />
      <EmptyState
        icon={CalendarDays}
        title="Agenda vazia"
        description="Os eventos, assembleias e prazos aparecerão aqui automaticamente."
      />
    </div>
  );
}
