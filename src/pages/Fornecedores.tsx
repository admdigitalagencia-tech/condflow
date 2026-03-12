import { Truck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Fornecedores() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Fornecedores"
        description="Gestão de fornecedores e prestadores de serviços"
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Novo Fornecedor</Button>}
      />
      <EmptyState
        icon={Truck}
        title="Sem fornecedores"
        description="Registe fornecedores para associar a ocorrências e contratos."
        actionLabel="Novo Fornecedor"
        onAction={() => {}}
      />
    </div>
  );
}
