import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCondominium, useUpdateCondominium } from '@/hooks/useCondominiums';
import { useStakeholdersByCondominium, useLinkStakeholder, useUnlinkStakeholder } from '@/hooks/useStakeholders';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useSuppliersByCondominium, useLinkSupplier, useUnlinkSupplier } from '@/hooks/useSuppliers';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useCondominiumNotes, useCreateNote, useDeleteNote } from '@/hooks/useCondominiumNotes';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useTicketsByCondominium } from '@/hooks/useTickets';
import { useAssembliesByCondominium } from '@/hooks/useAssemblies';
import { useDocumentsByCondominium } from '@/hooks/useDocuments';
import { STAKEHOLDER_TYPES } from '@/services/stakeholders';
import { SUPPLIER_CATEGORIES } from '@/services/suppliers';
import { assemblyStatusLabel, assemblyTypeLabel, minutesStatusLabel } from '@/services/assemblies';
import { documentTypeLabel } from '@/services/documents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { TimelineItem } from '@/components/shared/TimelineItem';
import { ActivityTimeline } from '@/components/timeline/ActivityTimeline';
import { CondominiumFormDialog } from '@/components/condominiums/CondominiumFormDialog';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/tickets/TicketBadges';
import { categoryLabel } from '@/services/tickets';
import {
  ArrowLeft, Building2, Pencil, Users, Truck, History, StickyNote,
  Plus, X, Mail, Phone, AlertTriangle, Calendar, FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CondominioDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { data: condo, isLoading } = useCondominium(id!);
  const { data: stakeholderLinks } = useStakeholdersByCondominium(id!);
  const { data: allStakeholders } = useStakeholders();
  const { data: supplierLinks } = useSuppliersByCondominium(id!);
  const { data: allSuppliers } = useSuppliers();
  const { data: notes } = useCondominiumNotes(id!);
  const { data: tickets } = useTicketsByCondominium(id!);
  const { data: assemblies } = useAssembliesByCondominium(id!);
  const { data: documents } = useDocumentsByCondominium(id!);
  const createNoteMutation = useCreateNote();
  const deleteNoteMutation = useDeleteNote(id!);
  const linkStakeholder = useLinkStakeholder();
  const unlinkStakeholder = useUnlinkStakeholder();
  const linkSupplier = useLinkSupplier();
  const unlinkSupplier = useUnlinkSupplier();

  const [editOpen, setEditOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }
  if (!condo) return <div className="p-6">Condomínio não encontrado.</div>;

  const linkedStakeholderIds = new Set((stakeholderLinks || []).map(l => l.stakeholder_id));
  const availableStakeholders = (allStakeholders || []).filter(s => !linkedStakeholderIds.has(s.id));
  const linkedSupplierIds = new Set((supplierLinks || []).map(l => l.supplier_id));
  const availableSuppliers = (allSuppliers || []).filter(s => !linkedSupplierIds.has(s.id));

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try { await createNoteMutation.mutateAsync({ condominiumId: id!, content: newNote }); setNewNote(''); toast.success('Nota adicionada'); } catch { toast.error('Erro ao adicionar nota'); }
  };

  const handleLinkStakeholder = async () => {
    if (!selectedStakeholder) return;
    try { await linkStakeholder.mutateAsync({ stakeholderId: selectedStakeholder, condominiumId: id! }); setSelectedStakeholder(''); toast.success('Stakeholder associado'); } catch { toast.error('Erro ao associar stakeholder'); }
  };

  const handleLinkSupplier = async () => {
    if (!selectedSupplier) return;
    try { await linkSupplier.mutateAsync({ supplierId: selectedSupplier, condominiumId: id! }); setSelectedSupplier(''); toast.success('Fornecedor associado'); } catch { toast.error('Erro ao associar fornecedor'); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const typeLabel = (t: string) => STAKEHOLDER_TYPES.find(st => st.value === t)?.label || t;
  const catLabel = (c: string) => SUPPLIER_CATEGORIES.find(sc => sc.value === c)?.label || c;

  const openTickets = (tickets || []).filter(t => !['resolvido', 'encerrado'].includes(t.status));
  const criticalTickets = openTickets.filter(t => t.priority === 'critica');
  const nextAssembly = (assemblies || []).find(a => a.status === 'planeada');
  const lastAssembly = (assemblies || []).find(a => a.status !== 'planeada');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => nav('/condominios')} className="mt-1"><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Building2 className="h-5 w-5 text-accent shrink-0" />
            <h1 className="text-xl font-bold truncate">{condo.name}</h1>
            <Badge variant="outline" className={condo.active ? 'badge-status-resolved' : 'badge-status-closed'}>{condo.active ? 'Ativo' : 'Inativo'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {[condo.address_line, condo.postal_code, condo.city].filter(Boolean).join(' · ')}
            {condo.nif && ` · NIF ${condo.nif}`}
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => setEditOpen(true)}><Pencil className="h-3.5 w-3.5" /> Editar</Button>
      </div>

      <Tabs defaultValue="geral">
        <TabsList className="flex-wrap">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="ocorrencias">Ocorrências {tickets?.length ? `(${tickets.length})` : ''}</TabsTrigger>
          <TabsTrigger value="assembleias">Assembleias {assemblies?.length ? `(${assemblies.length})` : ''}</TabsTrigger>
          <TabsTrigger value="documentos">Documentos {documents?.length ? `(${documents.length})` : ''}</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders {stakeholderLinks?.length ? `(${stakeholderLinks.length})` : ''}</TabsTrigger>
          <TabsTrigger value="fornecedores">Fornecedores {supplierLinks?.length ? `(${supplierLinks.length})` : ''}</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="notas">Notas {notes?.length ? `(${notes.length})` : ''}</TabsTrigger>
        </TabsList>

        {/* VISÃO GERAL */}
        <TabsContent value="geral" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SummaryCard title="Dados Cadastrais">
              <div className="space-y-2 text-sm">
                <InfoRow label="Morada" value={condo.address_line} />
                <InfoRow label="Código Postal" value={condo.postal_code} />
                <InfoRow label="Cidade" value={condo.city} />
                <InfoRow label="Distrito" value={condo.district} />
                <InfoRow label="NIF" value={condo.nif} />
                <InfoRow label="Ano de Construção" value={condo.year_built?.toString()} />
              </div>
            </SummaryCard>
            <SummaryCard title="Informações do Edifício">
              <div className="space-y-2 text-sm">
                <InfoRow label="Nº de Frações" value={condo.fractions_count?.toString()} />
                <InfoRow label="Nº de Pisos" value={condo.floors_count?.toString()} />
                <InfoRow label="Criado em" value={formatDate(condo.created_at)} />
                <InfoRow label="Última Atualização" value={formatDate(condo.updated_at)} />
              </div>
              {condo.notes && <div className="mt-4 pt-3 border-t"><p className="text-xs text-muted-foreground mb-1">Observações</p><p className="text-sm">{condo.notes}</p></div>}
            </SummaryCard>
            <SummaryCard title="Indicadores" className="md:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 py-4">
                <PlaceholderKPI label="Ocorrências Abertas" value={String(openTickets.length)} />
                <PlaceholderKPI label="Críticas" value={String(criticalTickets.length)} />
                <PlaceholderKPI label="Assembleias" value={String(assemblies?.length || 0)} />
                <PlaceholderKPI label="Documentos" value={String(documents?.length || 0)} />
                <PlaceholderKPI label="Próxima Assembleia" value={nextAssembly ? new Date(nextAssembly.scheduled_date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) : '—'} />
                <PlaceholderKPI label="Ata Recente" value={lastAssembly ? minutesStatusLabel(lastAssembly.minutes_status) : '—'} />
              </div>
            </SummaryCard>
          </div>
        </TabsContent>

        {/* OCORRÊNCIAS */}
        <TabsContent value="ocorrencias" className="mt-4 space-y-4">
          {(!tickets || tickets.length === 0) ? (
            <EmptyState icon={AlertTriangle} title="Sem ocorrências" description="Nenhuma ocorrência registada para este condomínio." />
          ) : (
            <div className="space-y-2">
              {tickets.map(t => (
                <div key={t.id} className="rounded-lg border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow flex items-center justify-between" onClick={() => nav(`/ocorrencias/${t.id}`)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className="font-mono text-[10px] text-muted-foreground">{t.code}</span><span className="text-xs text-muted-foreground">{categoryLabel(t.category)}</span></div>
                    <p className="text-sm font-medium truncate">{t.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3"><TicketPriorityBadge priority={t.priority} /><TicketStatusBadge status={t.status} /></div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ASSEMBLEIAS */}
        <TabsContent value="assembleias" className="mt-4 space-y-4">
          {(!assemblies || assemblies.length === 0) ? (
            <EmptyState icon={Calendar} title="Sem assembleias" description="Nenhuma assembleia registada." actionLabel="Ver Assembleias" onAction={() => nav('/assembleias')} />
          ) : (
            <div className="space-y-2">
              {assemblies.map(a => (
                <div key={a.id} className="rounded-lg border bg-card p-4 cursor-pointer hover:shadow-md transition-shadow flex items-center justify-between" onClick={() => nav(`/assembleias/${a.id}`)}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{assemblyTypeLabel(a.assembly_type)} · {new Date(a.scheduled_date).toLocaleDateString('pt-PT')}{a.location ? ` · ${a.location}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Badge variant="outline" className="text-[10px]">{assemblyStatusLabel(a.status)}</Badge>
                    <Badge variant="outline" className="text-[10px]">Ata: {minutesStatusLabel(a.minutes_status)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* DOCUMENTOS */}
        <TabsContent value="documentos" className="mt-4 space-y-4">
          {(!documents || documents.length === 0) ? (
            <EmptyState icon={FileText} title="Sem documentos" description="Nenhum documento associado." actionLabel="Ir para Documentos" onAction={() => nav('/documentos')} />
          ) : (
            <div className="space-y-2">
              {documents.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm flex-1 truncate">{d.title}</span>
                  <Badge variant="outline" className="text-[10px]">{documentTypeLabel(d.document_type)}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString('pt-PT')}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* STAKEHOLDERS */}
        <TabsContent value="stakeholders" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Select value={selectedStakeholder} onValueChange={setSelectedStakeholder}>
              <SelectTrigger className="w-[250px] h-9"><SelectValue placeholder="Selecionar stakeholder..." /></SelectTrigger>
              <SelectContent>{availableStakeholders.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — {typeLabel(s.stakeholder_type)}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" onClick={handleLinkStakeholder} disabled={!selectedStakeholder || linkStakeholder.isPending}><Plus className="h-3.5 w-3.5 mr-1" /> Associar</Button>
          </div>
          {(!stakeholderLinks || stakeholderLinks.length === 0) ? (
            <EmptyState icon={Users} title="Sem stakeholders" description="Associe stakeholders a este condomínio." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {stakeholderLinks.map(link => {
                const s = link.stakeholders as any;
                if (!s) return null;
                return (
                  <div key={link.id} className="rounded-lg border bg-card p-4 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{typeLabel(s.stakeholder_type)}{s.role_title ? ` · ${s.role_title}` : ''}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {s.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>}
                        {s.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => unlinkStakeholder.mutate({ stakeholderId: link.stakeholder_id, condominiumId: id! })}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* FORNECEDORES */}
        <TabsContent value="fornecedores" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="w-[250px] h-9"><SelectValue placeholder="Selecionar fornecedor..." /></SelectTrigger>
              <SelectContent>{availableSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name} — {catLabel(s.supplier_category)}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" onClick={handleLinkSupplier} disabled={!selectedSupplier || linkSupplier.isPending}><Plus className="h-3.5 w-3.5 mr-1" /> Associar</Button>
          </div>
          {(!supplierLinks || supplierLinks.length === 0) ? (
            <EmptyState icon={Truck} title="Sem fornecedores" description="Associe fornecedores a este condomínio." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {supplierLinks.map(link => {
                const s = link.suppliers as any;
                if (!s) return null;
                return (
                  <div key={link.id} className="rounded-lg border bg-card p-4 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{catLabel(s.supplier_category)}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {s.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>}
                        {s.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => unlinkSupplier.mutate({ supplierId: link.supplier_id, condominiumId: id! })}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* HISTÓRICO */}
        <TabsContent value="historico" className="mt-4">
          <SummaryCard title="Histórico de Atividade">
            <div className="py-2">
              <TimelineItem date={formatDate(condo.created_at)} title="Condomínio criado" variant="success" />
              <TimelineItem date={formatDate(condo.updated_at)} title="Última atualização" isLast />
            </div>
          </SummaryCard>
        </TabsContent>

        {/* NOTAS */}
        <TabsContent value="notas" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Textarea placeholder="Escrever nota interna..." value={newNote} onChange={e => setNewNote(e.target.value)} rows={2} className="flex-1" />
            <Button onClick={handleAddNote} disabled={!newNote.trim() || createNoteMutation.isPending} className="self-end"><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
          </div>
          {(!notes || notes.length === 0) ? (
            <EmptyState icon={StickyNote} title="Sem notas" description="Adicione notas internas sobre este condomínio." />
          ) : (
            <div className="space-y-3">
              {notes.map(note => (
                <div key={note.id} className="rounded-lg border bg-card p-4 group">
                  <div className="flex justify-between items-start">
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive" onClick={() => deleteNoteMutation.mutate(note.id)}><X className="h-3.5 w-3.5" /></Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(note.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CondominiumFormDialog open={editOpen} onOpenChange={setEditOpen} condominium={condo} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value || '—'}</span></div>;
}

function PlaceholderKPI({ label, value }: { label: string; value: string }) {
  return <div className="text-center"><p className="text-2xl font-bold text-muted-foreground">{value}</p><p className="text-xs text-muted-foreground mt-1">{label}</p></div>;
}
