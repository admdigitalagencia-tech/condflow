import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useCondominiumContext } from '@/hooks/useCondominiumContext';
import {
  useAssembly, useUpdateAssembly,
  useAssemblyPoints, useCreateAssemblyPoint, useUpdateAssemblyPoint, useDeleteAssemblyPoint,
  useAssemblyAttendees, useCreateAssemblyAttendee, useDeleteAssemblyAttendee,
  useTranscripts, useCreateTranscript,
  useMinutes, useCreateMinute, useGenerateMinutesAI,
} from '@/hooks/useAssemblies';
import { useDocumentsByAssembly, useCreateDocument } from '@/hooks/useDocuments';
import { uploadFile, extractDocumentText } from '@/services/documents';
import { assemblyStatusLabel, assemblyTypeLabel, minutesStatusLabel, ASSEMBLY_STATUSES } from '@/services/assemblies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { AIAssistantPanel } from '@/components/ai/AIAssistantPanel';
import { EmptyState } from '@/components/shared/EmptyState';
import { AssemblyFormDialog } from '@/components/assemblies/AssemblyFormDialog';
import {
  ArrowLeft, Pencil, Plus, X, ListOrdered, Users, FileText,
  Mic, BookOpen, StickyNote, Brain, Upload, GripVertical, Vote, ListChecks, Loader2, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AssembleiaDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { data: assembly, isLoading } = useAssembly(id!);
  const assemblyCondoId = assembly?.condominium_id || null;
  const { data: aiContext } = useCondominiumContext(assemblyCondoId);
  const updateAssembly = useUpdateAssembly();
  const { data: points } = useAssemblyPoints(id!);
  const createPoint = useCreateAssemblyPoint();
  const updatePoint = useUpdateAssemblyPoint();
  const deletePoint = useDeleteAssemblyPoint();
  const { data: attendees } = useAssemblyAttendees(id!);
  const createAttendee = useCreateAssemblyAttendee();
  const deleteAttendee = useDeleteAssemblyAttendee();
  const { data: docs } = useDocumentsByAssembly(id!);
  const createDoc = useCreateDocument();
  const { data: transcripts } = useTranscripts(id!);
  const createTranscript = useCreateTranscript();
  const { data: minutes } = useMinutes(id!);
  const createMinute = useCreateMinute();
  const generateMinutesAI = useGenerateMinutesAI();

  const [editOpen, setEditOpen] = useState(false);
  const [newPointTitle, setNewPointTitle] = useState('');
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeUnit, setNewAttendeeUnit] = useState('');
  const [newAttendeeType, setNewAttendeeType] = useState('presencial');
  const [editingPoint, setEditingPoint] = useState<string | null>(null);
  const [editPointData, setEditPointData] = useState<Record<string, string>>({});
  const [newStatus, setNewStatus] = useState('');
  const [uploadingAttendance, setUploadingAttendance] = useState(false);
  const [extractingDoc, setExtractingDoc] = useState<string | null>(null);

  if (isLoading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!assembly) return <div className="p-6">Assembleia não encontrada.</div>;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handleAddPoint = async () => {
    if (!newPointTitle.trim()) return;
    try {
      await createPoint.mutateAsync({ assembly_id: id!, point_order: (points?.length || 0) + 1, title: newPointTitle });
      setNewPointTitle('');
      toast.success('Ponto adicionado');
    } catch { toast.error('Erro'); }
  };

  const handleSavePoint = async (pointId: string) => {
    try {
      await updatePoint.mutateAsync({ id: pointId, values: editPointData, assemblyId: id! });
      setEditingPoint(null);
      toast.success('Ponto atualizado');
    } catch { toast.error('Erro'); }
  };

  const handleAddAttendee = async () => {
    if (!newAttendeeName.trim()) return;
    try {
      await createAttendee.mutateAsync({
        assembly_id: id!,
        attendee_name: newAttendeeName,
        unit_code: newAttendeeUnit || undefined,
        attendance_type: newAttendeeType,
      });
      setNewAttendeeName('');
      setNewAttendeeUnit('');
      toast.success('Participante adicionado');
    } catch { toast.error('Erro'); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = `assemblies/${id}/${Date.now()}_${file.name}`;
      const { path: storedPath } = await uploadFile(file, path);
      const doc = await createDoc.mutateAsync({
        title: file.name.replace(/\.[^/.]+$/, ''),
        document_type: 'fotografia',
        file_path: storedPath,
        mime_type: file.type,
        file_size: file.size,
        assembly_id: id!,
        condominium_id: assembly.condominium_id,
      });
      toast.success('Documento anexado');
      // Auto-extract text in background
      if (doc?.id) {
        setExtractingDoc(doc.id);
        extractDocumentText(doc.id)
          .then(() => toast.success('Texto extraído automaticamente'))
          .catch(() => {})
          .finally(() => setExtractingDoc(null));
      }
    } catch { toast.error('Erro ao anexar'); }
    e.target.value = '';
  };

  const handleAttendanceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAttendance(true);
    try {
      const path = `assemblies/${id}/${Date.now()}_${file.name}`;
      const { path: storedPath } = await uploadFile(file, path);
      const doc = await createDoc.mutateAsync({
        title: file.name.replace(/\.[^/.]+$/, ''),
        document_type: 'lista_presenca',
        file_path: storedPath,
        mime_type: file.type,
        file_size: file.size,
        assembly_id: id!,
        condominium_id: assembly.condominium_id,
      });
      toast.info('A extrair lista de presença...');
      if (doc?.id) {
        const result = await extractDocumentText(doc.id, 'parse_attendance');
        if (result.attendees_count > 0) {
          toast.success(`${result.attendees_count} participantes adicionados automaticamente`);
          queryClient.invalidateQueries({ queryKey: ['assembly-attendees', id] });
          queryClient.invalidateQueries({ queryKey: ['documents', 'assembly', id] });
        } else {
          toast.warning('Não foi possível identificar participantes no documento');
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao processar lista de presença');
    } finally {
      setUploadingAttendance(false);
    }
    e.target.value = '';
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = `transcripts/${id}/${Date.now()}_${file.name}`;
      const { path: storedPath } = await uploadFile(file, path);
      await createDoc.mutateAsync({
        title: `Áudio - ${file.name}`,
        document_type: 'audio',
        file_path: storedPath,
        mime_type: file.type,
        file_size: file.size,
        assembly_id: id!,
        condominium_id: assembly.condominium_id,
      });
      await createTranscript.mutateAsync({
        assembly_id: id!,
        source_type: 'audio_upload',
        processing_status: 'pendente',
      });
      toast.success('Áudio carregado — transcrição pendente');
    } catch { toast.error('Erro ao carregar áudio'); }
    e.target.value = '';
  };

  const handleCreateDraft = async () => {
    try {
      const version = (minutes?.length || 0) + 1;
      await createMinute.mutateAsync({
        assembly_id: id!,
        title: `Ata v${version} — ${assembly.title}`,
        version_number: version,
        generation_source: 'manual',
      });
      await updateAssembly.mutateAsync({ id: id!, values: { minutes_status: 'rascunho' } });
      toast.success('Rascunho de ata criado');
    } catch { toast.error('Erro'); }
  };

  const handleChangeStatus = async () => {
    if (!newStatus) return;
    try {
      await updateAssembly.mutateAsync({ id: id!, values: { status: newStatus } });
      setNewStatus('');
      toast.success('Estado atualizado');
    } catch { toast.error('Erro'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => nav('/assembleias')} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline" className="text-[10px]">{assemblyTypeLabel(assembly.assembly_type)}</Badge>
            <Badge variant="outline" className="text-[10px]">{assemblyStatusLabel(assembly.status)}</Badge>
            <Badge variant="outline" className="text-[10px]">Ata: {minutesStatusLabel(assembly.minutes_status)}</Badge>
          </div>
          <h1 className="text-xl font-bold">{assembly.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {(assembly as any).condominiums?.name} · {formatDate(assembly.scheduled_date)}
            {assembly.scheduled_time ? ` às ${assembly.scheduled_time.slice(0, 5)}` : ''}
            {assembly.location ? ` · ${assembly.location}` : ''}
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="agenda">
            <TabsList className="flex-wrap">
              <TabsTrigger value="agenda">Ordem de Trabalhos</TabsTrigger>
              <TabsTrigger value="presenca">Presença ({attendees?.length || 0})</TabsTrigger>
              <TabsTrigger value="documentos">Documentos ({docs?.length || 0})</TabsTrigger>
              <TabsTrigger value="transcricao">Transcrição</TabsTrigger>
              <TabsTrigger value="ata">Ata</TabsTrigger>
              <TabsTrigger value="notas">Notas</TabsTrigger>
            </TabsList>

            {/* Ordem de Trabalhos */}
            <TabsContent value="agenda" className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Título do ponto..." value={newPointTitle} onChange={e => setNewPointTitle(e.target.value)} className="flex-1 h-9" />
                <Button size="sm" onClick={handleAddPoint} disabled={!newPointTitle.trim()}><Plus className="h-3.5 w-3.5 mr-1" /> Adicionar</Button>
              </div>
              {(!points || points.length === 0) ? (
                <EmptyState icon={ListOrdered} title="Sem pontos" description="Adicione pontos à ordem de trabalhos." />
              ) : (
                <div className="space-y-3">
                  {points.map(p => (
                    <div key={p.id} className="rounded-lg border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-accent text-accent-foreground text-xs font-bold shrink-0">{p.point_order}</span>
                          <h4 className="font-medium text-sm">{p.title}</h4>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                            setEditingPoint(p.id);
                            setEditPointData({ discussion_summary: p.discussion_summary || '', proposal_text: p.proposal_text || '', voting_result_text: p.voting_result_text || '', deliberation_text: p.deliberation_text || '' });
                          }}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deletePoint.mutate({ id: p.id, assemblyId: id! })}><X className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      {p.description && <p className="text-sm text-muted-foreground mt-2">{p.description}</p>}
                      {editingPoint === p.id && (
                        <div className="mt-3 space-y-3 border-t pt-3">
                          <div><Label className="text-xs">Resumo da Discussão</Label><Textarea value={editPointData.discussion_summary} onChange={e => setEditPointData(d => ({ ...d, discussion_summary: e.target.value }))} rows={2} /></div>
                          <div><Label className="text-xs">Proposta</Label><Textarea value={editPointData.proposal_text} onChange={e => setEditPointData(d => ({ ...d, proposal_text: e.target.value }))} rows={2} /></div>
                          <div><Label className="text-xs">Resultado da Votação</Label><Input value={editPointData.voting_result_text} onChange={e => setEditPointData(d => ({ ...d, voting_result_text: e.target.value }))} /></div>
                          <div><Label className="text-xs">Deliberação</Label><Textarea value={editPointData.deliberation_text} onChange={e => setEditPointData(d => ({ ...d, deliberation_text: e.target.value }))} rows={2} /></div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSavePoint(p.id)}>Guardar</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingPoint(null)}>Cancelar</Button>
                          </div>
                        </div>
                      )}
                      {!editingPoint && (p.deliberation_text || p.voting_result_text) && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {p.voting_result_text && <Badge variant="outline" className="text-[10px] badge-status-resolved"><Vote className="h-3 w-3 mr-1" />{p.voting_result_text}</Badge>}
                          {p.deliberation_text && <span className="text-xs text-muted-foreground italic">Deliberação: {p.deliberation_text}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Presença */}
            <TabsContent value="presenca" className="mt-4 space-y-4">
              {/* Upload attendance list */}
              <div className="rounded-lg border-2 border-dashed border-accent/30 bg-accent/5 p-4">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-accent shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Carregar lista de presença</p>
                    <p className="text-xs text-muted-foreground">Faça upload de um PDF ou foto da folha de presenças. A IA extrai e cria os participantes automaticamente.</p>
                  </div>
                  <label>
                    <Button size="sm" variant="outline" className="gap-1.5" asChild disabled={uploadingAttendance}>
                      <span>
                        {uploadingAttendance ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        {uploadingAttendance ? 'A processar...' : 'Upload'}
                      </span>
                    </Button>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleAttendanceUpload} disabled={uploadingAttendance} />
                  </label>
                </div>
              </div>

              {/* Manual add */}
              <div className="flex gap-2 flex-wrap">
                <Input placeholder="Nome" value={newAttendeeName} onChange={e => setNewAttendeeName(e.target.value)} className="flex-1 min-w-[150px] h-9" />
                <Input placeholder="Fração" value={newAttendeeUnit} onChange={e => setNewAttendeeUnit(e.target.value)} className="w-[100px] h-9" />
                <Select value={newAttendeeType} onValueChange={setNewAttendeeType}>
                  <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="representado">Representado</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="ausente">Ausente</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleAddAttendee} disabled={!newAttendeeName.trim()}><Plus className="h-3.5 w-3.5 mr-1" /> Adicionar</Button>
              </div>
              {(!attendees || attendees.length === 0) ? (
                <EmptyState icon={Users} title="Sem participantes" description="Adicione os participantes da assembleia." />
              ) : (
                <div className="rounded-lg border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b bg-muted/30">
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Nome</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Fração</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tipo</th>
                      <th className="px-4 py-2 w-10"></th>
                    </tr></thead>
                    <tbody>
                      {attendees.map(a => (
                        <tr key={a.id} className="border-b last:border-0">
                          <td className="px-4 py-2 font-medium">{a.attendee_name}</td>
                          <td className="px-4 py-2 text-muted-foreground">{a.unit_code || '—'}</td>
                          <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{a.attendance_type}</Badge></td>
                          <td className="px-4 py-2"><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteAttendee.mutate({ id: a.id, assemblyId: id! })}><X className="h-3 w-3" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Documentos */}
            <TabsContent value="documentos" className="mt-4 space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Button size="sm" variant="outline" className="gap-1.5" asChild><span><Upload className="h-3.5 w-3.5" /> Anexar documento</span></Button>
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              {(!docs || docs.length === 0) ? (
                <EmptyState icon={FileText} title="Sem documentos" description="Anexe documentos à assembleia." />
              ) : (
                <div className="space-y-2">
                  {docs.map(d => (
                    <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1 truncate">{d.title}</span>
                      <Badge variant="outline" className="text-[10px]">{d.document_type}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Transcrição */}
            <TabsContent value="transcricao" className="mt-4 space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Button size="sm" variant="outline" className="gap-1.5" asChild><span><Mic className="h-3.5 w-3.5" /> Carregar áudio</span></Button>
                <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
              </label>
              {(!transcripts || transcripts.length === 0) ? (
                <EmptyState icon={Mic} title="Sem transcrições" description="Carregue um ficheiro de áudio para iniciar a transcrição." />
              ) : (
                <div className="space-y-3">
                  {transcripts.map(t => (
                    <SummaryCard key={t.id} title={`Transcrição — ${t.source_type}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px]">{t.processing_status}</Badge>
                        <span className="text-xs text-muted-foreground">{t.language}</span>
                      </div>
                      {t.raw_text ? (
                        <p className="text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">{t.raw_text}</p>
                      ) : (
                        <div className="rounded-md border border-dashed p-4 text-center">
                          <Brain className="h-6 w-6 text-accent mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Transcrição automática — em breve</p>
                        </div>
                      )}
                    </SummaryCard>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Ata */}
            <TabsContent value="ata" className="mt-4 space-y-4">
              {/* AI Generation Card */}
              <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 shrink-0">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">Gerar ATA automática</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      A IA analisa a ordem de trabalhos, lista de presença, notas e transcrições para gerar uma ata profissional automaticamente.
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                      <Badge variant="outline" className={`text-[10px] ${(points?.length || 0) > 0 ? 'border-green-500 text-green-600' : ''}`}>
                        {(points?.length || 0) > 0 ? '✓' : '○'} {points?.length || 0} pontos
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${(attendees?.length || 0) > 0 ? 'border-green-500 text-green-600' : ''}`}>
                        {(attendees?.length || 0) > 0 ? '✓' : '○'} {attendees?.length || 0} participantes
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${assembly.notes ? 'border-green-500 text-green-600' : ''}`}>
                        {assembly.notes ? '✓' : '○'} Notas
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${(transcripts?.length || 0) > 0 ? 'border-green-500 text-green-600' : ''}`}>
                        {(transcripts?.length || 0) > 0 ? '✓' : '○'} Transcrição
                      </Badge>
                    </div>
                    <Button
                      onClick={() => generateMinutesAI.mutate(id!)}
                      disabled={generateMinutesAI.isPending || (points?.length || 0) === 0}
                      className="gap-2"
                    >
                      {generateMinutesAI.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          A gerar ata... (pode demorar 30s)
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Gerar ATA automática
                        </>
                      )}
                    </Button>
                    {(points?.length || 0) === 0 && (
                      <p className="text-xs text-destructive mt-2">Adicione pelo menos um ponto à ordem de trabalhos para gerar a ata.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Existing minutes */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCreateDraft} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Rascunho Manual</Button>
              </div>
              {(!minutes || minutes.length === 0) ? (
                <EmptyState icon={BookOpen} title="Sem atas" description="Gere uma ata automática ou crie um rascunho manual." />
              ) : (
                <div className="space-y-2">
                  {minutes.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border bg-card cursor-pointer hover:shadow-sm transition-shadow" onClick={() => nav(`/assembleias/${id}/ata/${m.id}`)}>
                      <div>
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">v{m.version_number} · {m.generation_source === 'ai' ? '🤖 Gerada por IA' : 'Manual'} · {new Date(m.created_at).toLocaleDateString('pt-PT')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{m.status}</Badge>
                        <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={(e) => { e.stopPropagation(); nav(`/assembleias/${id}/ata/${m.id}`); }}>
                          <BookOpen className="h-3.5 w-3.5" /> Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Notas */}
            <TabsContent value="notas" className="mt-4">
              <SummaryCard title="Notas do Gestor">
                {assembly.notes ? (
                  <p className="text-sm whitespace-pre-wrap">{assembly.notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem notas. Edite a assembleia para adicionar.</p>
                )}
              </SummaryCard>
              {assembly.agenda_text && (
                <SummaryCard title="Ordem de Trabalhos (texto)" className="mt-4">
                  <p className="text-sm whitespace-pre-wrap">{assembly.agenda_text}</p>
                </SummaryCard>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <SummaryCard title="Resumo">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Condomínio</span><span className="font-medium cursor-pointer hover:text-accent" onClick={() => nav(`/condominios/${assembly.condominium_id}`)}>{(assembly as any).condominiums?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span className="font-medium">{formatDate(assembly.scheduled_date)}</span></div>
              {assembly.scheduled_time && <div className="flex justify-between"><span className="text-muted-foreground">Hora</span><span className="font-medium">{assembly.scheduled_time.slice(0, 5)}</span></div>}
              {assembly.location && <div className="flex justify-between"><span className="text-muted-foreground">Local</span><span className="font-medium">{assembly.location}</span></div>}
              {assembly.chaired_by && <div className="flex justify-between"><span className="text-muted-foreground">Presidida por</span><span className="font-medium">{assembly.chaired_by}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Participantes</span><span className="font-medium">{attendees?.length || 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pontos</span><span className="font-medium">{points?.length || 0}</span></div>
            </div>
          </SummaryCard>

          {/* Change status */}
          <SummaryCard title="Alterar Estado">
            <div className="space-y-3">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Novo estado..." /></SelectTrigger>
                <SelectContent>
                  {ASSEMBLY_STATUSES.filter(s => s.value !== assembly.status).map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="w-full" onClick={handleChangeStatus} disabled={!newStatus}>Atualizar</Button>
            </div>
          </SummaryCard>

          {/* AI Assistant */}
          <AIAssistantPanel
            title="Assistente IA"
            condominiumContext={aiContext || null}
            actions={[
              {
                label: 'Gerar resumo da assembleia',
                feature: 'assembly_summary',
                icon: BookOpen,
                buildPrompt: () => {
                  const pointsText = (points || []).map(p =>
                    `${p.point_order}. ${p.title}${p.deliberation_text ? ` — Deliberação: ${p.deliberation_text}` : ''}${p.voting_result_text ? ` — Votação: ${p.voting_result_text}` : ''}`
                  ).join('\n');
                  const attendeesCount = attendees?.length || 0;
                  return `Analisa esta assembleia e gera um resumo completo:\n\nTítulo: ${assembly.title}\nTipo: ${assemblyTypeLabel(assembly.assembly_type)}\nData: ${formatDate(assembly.scheduled_date)}\nCondomínio: ${(assembly as any).condominiums?.name || 'N/A'}\nPresidida por: ${assembly.chaired_by || 'N/A'}\nParticipantes: ${attendeesCount}\n\nOrdem de Trabalhos:\n${pointsText || 'Sem pontos definidos'}\n\nNotas do gestor: ${assembly.notes || 'Sem notas'}`;
                },
              },
              {
                label: 'Sugerir tarefas pós-assembleia',
                feature: 'next_steps',
                icon: ListChecks,
                buildPrompt: () => {
                  const pointsText = (points || []).map(p =>
                    `${p.point_order}. ${p.title}${p.deliberation_text ? ` — Deliberação: ${p.deliberation_text}` : ''}`
                  ).join('\n');
                  return `Com base nesta assembleia, sugere as tarefas que o gestor deve executar após a reunião:\n\nTítulo: ${assembly.title}\nCondomínio: ${(assembly as any).condominiums?.name || 'N/A'}\n\nDeliberações:\n${pointsText || 'Sem deliberações'}`;
                },
              },
              {
                label: 'Gerar rascunho de ata',
                feature: 'assembly_summary',
                icon: FileText,
                buildPrompt: () => {
                  const pointsText = (points || []).map(p =>
                    `${p.point_order}. ${p.title}\n   Discussão: ${p.discussion_summary || 'N/A'}\n   Proposta: ${p.proposal_text || 'N/A'}\n   Votação: ${p.voting_result_text || 'N/A'}\n   Deliberação: ${p.deliberation_text || 'N/A'}`
                  ).join('\n\n');
                  const attendeesList = (attendees || []).map(a => `- ${a.attendee_name} (${a.unit_code || 'S/F'}, ${a.attendance_type})`).join('\n');
                  return `Gera um rascunho formal de ata para esta assembleia:\n\nTítulo: ${assembly.title}\nTipo: ${assemblyTypeLabel(assembly.assembly_type)}\nData: ${formatDate(assembly.scheduled_date)}${assembly.scheduled_time ? ` às ${assembly.scheduled_time.slice(0, 5)}` : ''}\nLocal: ${assembly.location || 'N/A'}\nPresidida por: ${assembly.chaired_by || 'N/A'}\nCondomínio: ${(assembly as any).condominiums?.name || 'N/A'}\n\nParticipantes:\n${attendeesList || 'Sem participantes'}\n\nOrdem de Trabalhos:\n${pointsText || 'Sem pontos'}\n\nNotas: ${assembly.notes || 'Sem notas'}`;
                },
              },
            ]}
          />
        </div>
      </div>

      <AssemblyFormDialog open={editOpen} onOpenChange={setEditOpen} assembly={assembly} />
    </div>
  );
}
