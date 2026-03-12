import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export default function Configuracoes() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Configurações"
        description="Configurações da conta, organização e preferências"
      />
      <EmptyState
        icon={Settings}
        title="Configurações"
        description="As configurações do sistema estarão disponíveis em breve."
      />
    </div>
  );
}
