import { Brain } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function CentralIA() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="IA / Central Inteligente"
        description="Geração de atas, resumos e análises com inteligência artificial"
      />
      <EmptyState
        icon={Brain}
        title="Central de IA"
        description="A funcionalidade de geração de atas e análise inteligente será disponibilizada em breve."
      />
    </div>
  );
}
