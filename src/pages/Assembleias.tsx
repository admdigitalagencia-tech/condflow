import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAssemblies, useCreateAssembly } from '@/hooks/useAssemblies';
import { useCondominiums } from '@/hooks/useCondominiums';
import { ASSEMBLY_STATUSES, ASSEMBLY_TYPES, assemblyStatusLabel, assemblyTypeLabel, minutesStatusLabel } from '@/services/assemblies';
import { AssemblyFormDialog } from '@/components/assemblies/AssemblyFormDialog';

const statusBadgeClass: Record<string, string> = {
  planeada: 'badge-status-analysis',
  realizada: 'badge-status-execution',
  em_transcricao: 'badge-status-budget',
  em_minuta: 'badge-status-approval',
  finalizada: 'badge-status-resolved',
};

export default function Assembleias() {
  const nav = useNavigate();
  const { data: assemblies, isLoading } = useAssemblies();
  const { data: condominiums } = useCondominiums();
  const [search, setSearch] = useState('');
  const [filterCondo, setFilterCondo] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formOpen, setFormOpen] = useState(false);

  const filtered = (assemblies || []).filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCondo !== 'all' && a.condominium_id !== filterCondo) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-PT');

  return (
    <div className="space-y-4">
      <PageHeader
        title="Assembleias"
        description="Gestão de assembleias e deliberações"
        actions={<Button size="sm" className="gap-1.5" onClick={() => setFormOpen(true)}><Plus className="h-3.5 w-3.5" /> Nova Assembleia</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar assembleias..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={filterCondo} onValueChange={setFilterCondo}>
          <SelectTrigger className="w-[200px] h-9"><SelectValue placeholder="Condomínio" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {(condominiums || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {ASSEMBLY_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="Sem assembleias" description="Agende a primeira assembleia para começar." actionLabel="Nova Assembleia" onAction={() => setFormOpen(true)} />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Condomínio</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => nav(`/assembleias/${a.id}`)}>
                  <TableCell className="font-medium">{(a as any).condominiums?.name}</TableCell>
                  <TableCell>{a.title}</TableCell>
                  <TableCell className="text-muted-foreground">{assemblyTypeLabel(a.assembly_type)}</TableCell>
                  <TableCell>{formatDate(a.scheduled_date)}{a.scheduled_time ? ` ${a.scheduled_time.slice(0, 5)}` : ''}</TableCell>
                  <TableCell className="text-muted-foreground">{a.location || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${statusBadgeClass[a.status] || ''}`}>
                      {assemblyStatusLabel(a.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{minutesStatusLabel(a.minutes_status)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AssemblyFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
