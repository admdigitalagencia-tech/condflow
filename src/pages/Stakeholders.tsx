import { Users, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';

export default function Stakeholders() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Stakeholders"
        description="Contactos e intervenientes dos condomínios"
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Novo Stakeholder</Button>}
      />
      <EmptyState
        icon={Users}
        title="Sem stakeholders"
        description="Adicione os contactos e intervenientes dos seus condomínios."
        actionLabel="Novo Stakeholder"
        onAction={() => {}}
      />
    </div>
  );
}
