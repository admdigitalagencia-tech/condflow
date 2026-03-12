import { Calendar, Plus } from 'lucide-react';
import { mockAssembleias } from '@/data/mockData';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Assembleias() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Assembleias"
        description="Gestão de assembleias e deliberações"
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Nova Assembleia</Button>}
      />

      {mockAssembleias.length === 0 ? (
        <EmptyState icon={Calendar} title="Sem assembleias" description="Agende a primeira assembleia para começar." />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Condomínio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAssembleias.map((a) => (
                <TableRow key={a.id} className="cursor-pointer">
                  <TableCell className="font-medium">{a.condominioNome}</TableCell>
                  <TableCell>{a.tipo}</TableCell>
                  <TableCell>{a.data}</TableCell>
                  <TableCell>{a.hora}</TableCell>
                  <TableCell className="text-muted-foreground">{a.local}</TableCell>
                  <TableCell><StatusBadge status={a.estado} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
