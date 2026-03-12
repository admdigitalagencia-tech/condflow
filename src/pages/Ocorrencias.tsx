import { useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { mockOcorrencias } from '@/data/mockData';
import { CATEGORIAS, PRIORIDADES, STATUS_OCORRENCIA } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar } from '@/components/shared/FilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Ocorrencias() {
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('all');
  const [prioridade, setPrioridade] = useState('all');
  const [status, setStatus] = useState('all');

  const filtered = mockOcorrencias.filter((o) => {
    const matchSearch = o.titulo.toLowerCase().includes(search.toLowerCase()) || o.condominioNome.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoria === 'all' || o.categoria === categoria;
    const matchPri = prioridade === 'all' || o.prioridade === prioridade;
    const matchSta = status === 'all' || o.status === status;
    return matchSearch && matchCat && matchPri && matchSta;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ocorrências"
        description="Gestão de tickets e ocorrências técnicas"
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Nova Ocorrência</Button>}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar ocorrências..."
        filters={[
          { key: 'cat', placeholder: 'Categoria', value: categoria, onChange: setCategoria, options: CATEGORIAS.map(c => ({ label: c, value: c })) },
          { key: 'pri', placeholder: 'Prioridade', value: prioridade, onChange: setPrioridade, options: PRIORIDADES.map(p => ({ label: p, value: p })) },
          { key: 'sta', placeholder: 'Status', value: status, onChange: setStatus, options: STATUS_OCORRENCIA.map(s => ({ label: s, value: s })) },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="Sem ocorrências" description="Nenhuma ocorrência encontrada com os filtros selecionados." />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Condomínio</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id} className="cursor-pointer">
                  <TableCell className="text-muted-foreground">{o.condominioNome}</TableCell>
                  <TableCell className="font-medium">{o.titulo}</TableCell>
                  <TableCell className="text-muted-foreground">{o.categoria}</TableCell>
                  <TableCell><PriorityBadge priority={o.prioridade} /></TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{o.dataAbertura}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
