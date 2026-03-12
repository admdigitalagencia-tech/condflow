import { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { mockCondominios } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar } from '@/components/shared/FilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Condominios() {
  const nav = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = mockCondominios.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cidade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Condomínios"
        description="Gestão dos condomínios administrados"
        actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Novo Condomínio</Button>}
      />

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Pesquisar condomínios..." />

      {filtered.length === 0 ? (
        <EmptyState icon={Building2} title="Sem condomínios" description="Adicione o primeiro condomínio para começar." actionLabel="Novo Condomínio" onAction={() => {}} />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>NIF</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => nav(`/condominios/${c.id}`)}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>{c.cidade}</TableCell>
                  <TableCell className="text-muted-foreground">{c.nif}</TableCell>
                  <TableCell><StatusBadge status={c.ativo ? 'active' : 'inactive'} /></TableCell>
                  <TableCell className="text-muted-foreground">{c.criadoEm}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
