import { FileText, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';

export default function Documentos() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Documentos"
        description="Upload e gestão de documentos"
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Upload</Button>}
      />
      <EmptyState
        icon={FileText}
        title="Sem documentos"
        description="Carregue documentos associados a condomínios, ocorrências ou assembleias."
        actionLabel="Carregar documento"
        onAction={() => {}}
      />
    </div>
  );
}
