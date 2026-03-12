import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function Relatorios() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Relatórios"
        description="Relatórios operacionais e financeiros"
      />
      <EmptyState
        icon={BarChart3}
        title="Sem relatórios"
        description="Os relatórios estarão disponíveis quando houver dados suficientes no sistema."
      />
    </div>
  );
}
