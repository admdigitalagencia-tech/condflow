import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket, useTicketUpdates, useCreateTicketUpdate, useChangeTicketStatus, useUpdateTicket } from '@/hooks/useTickets';
import { TICKET_STATUSES, categoryLabel, statusLabel, priorityLabel, type TicketStatus } from '@/services/tickets';
import { TicketPriorityBadge, TicketStatusBadge } from '@/components/tickets/TicketBadges';
import { TicketFormDialog } from '@/components/tickets/TicketFormDialog';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Pencil, MessageSquare, Clock, ArrowRightLeft,
  Brain, FileText, Euro, CheckSquare, Building2, Truck, MapPin, Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function OcorrenciaDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { data: ticket, isLoading } = useTicket(id!);
  const { data: updates } = useTicketUpdates(id!);
  const createUpdate = useCreateTicketUpdate();
  const changeStatus = useChangeTicketStatus();
  const updateTicket = useUpdateTicket();

  const [editOpen, setEditOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [closureSummary, setClosureSummary] = useState('');

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }
  if (!ticket) return <div className="p-6">Ocorrência não encontrada.</div>;

  const formatDateTime = (d: string) => new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-PT') : '—';
  const isOverdue = ticket.due_date && new Date(ticket.due_date) < new Date() && !['resolvido', 'encerrado'].includes(ticket.status);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await createUpdate.mutateAsync({ ticket_id: id!, update_type: 'comment', body: comment });
      setComment('');
      toast.success('Comentário adicionado');
    } catch { toast.error('Erro ao adicionar comentário'); }
  };

  const handleChangeStatus = async () => {
    if (!newStatus || newStatus === ticket.status) return;
    try {
      const isClosing = newStatus === 'encerrado' || newStatus === 'resolvido';
      if (isClosing && closureSummary) {
        await updateTicket.mutateAsync({ id: id!, values: { closure_summary: closureSummary } });
      }
      await changeStatus.mutateAsync({
        ticketId: id!,
        oldStatus: ticket.status as TicketStatus,
        newStatus: newStatus as TicketStatus,
      });
      setNewStatus('');
      setClosureSummary('');
      toast.success('Estado atualizado');
    } catch { toast.error('Erro ao alterar estado'); }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <ArrowRightLeft className="h-3.5 w-3.5" />;
      case 'comment': return <MessageSquare className="h-3.5 w-3.5" />;
      case 'cost_update': return <Euro className="h-3.5 w-3.5" />;
      default: return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getUpdateColor = (type: string) => {
    switch (type) {
      case 'status_change': return 'bg-blue-500';
      case 'comment': return 'bg-accent';
      case 'cost_update': return 'bg-amber-500';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => nav('/ocorrencias')} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{ticket.code}</span>
            <TicketPriorityBadge priority={ticket.priority} />
            <TicketStatusBadge status={ticket.status} />
            {isOverdue && <Badge variant="destructive" className="text-[10px]">Atrasada</Badge>}
          </div>
          <h1 className="text-xl font-bold">{ticket.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ticket.condominiums?.name} · Aberta em {formatDateTime(ticket.opened_at)}
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Button>
      </div>

      {/* Main content: 2-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="costs">Custos</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="attachments">Anexos</TabsTrigger>
            </TabsList>

            {/* Timeline */}
            <TabsContent value="timeline" className="mt-4 space-y-4">
              {/* Add comment */}
              <div className="flex gap-2">
                <Textarea placeholder="Adicionar comentário ou atualização..." value={comment} onChange={e => setComment(e.target.value)} rows={2} className="flex-1" />
                <Button onClick={handleAddComment} disabled={!comment.trim() || createUpdate.isPending} className="self-end">Enviar</Button>
              </div>

              {/* Timeline entries */}
              <div className="space-y-0">
                {/* Opening entry */}
                <div className="flex gap-3 pb-4">
                  <div className="flex flex-col items-center">
                    <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <CheckSquare className="h-3.5 w-3.5 text-accent-foreground" />
                    </div>
                    <div className="w-px flex-1 bg-border mt-1" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ocorrência aberta</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(ticket.opened_at)}</p>
                    {ticket.description && <p className="text-sm mt-2 text-muted-foreground bg-muted/50 rounded-md p-3">{ticket.description}</p>}
                  </div>
                </div>

                {(updates || []).map((u, i) => (
                  <div key={u.id} className="flex gap-3 pb-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white ${getUpdateColor(u.update_type)}`}>
                        {getUpdateIcon(u.update_type)}
                      </div>
                      {i < (updates || []).length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="flex-1">
                      {u.update_type === 'status_change' && u.old_status && u.new_status ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <TicketStatusBadge status={u.old_status} />
                          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                          <TicketStatusBadge status={u.new_status} />
                        </div>
                      ) : null}
                      {u.body && <p className="text-sm mt-1">{u.body}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{formatDateTime(u.created_at)}</p>
                    </div>
                  </div>
                ))}

                {ticket.closed_at && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-white">
                        <CheckSquare className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Ocorrência encerrada</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(ticket.closed_at)}</p>
                      {ticket.closure_summary && <p className="text-sm mt-1 text-muted-foreground">{ticket.closure_summary}</p>}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Details */}
            <TabsContent value="details" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <SummaryCard title="Informações da Ocorrência">
                  <div className="space-y-2 text-sm">
                    <DetailRow label="Categoria" value={categoryLabel(ticket.category)} />
                    <DetailRow label="Subcategoria" value={ticket.subcategory} />
                    <DetailRow label="Local" value={ticket.location_text} />
                    <DetailRow label="Origem" value={ticket.source_channel} />
                    <DetailRow label="Prioridade" value={priorityLabel(ticket.priority)} />
                    <DetailRow label="Fornecedor" value={ticket.suppliers?.name} />
                  </div>
                </SummaryCard>
                <SummaryCard title="Datas e Prazos">
                  <div className="space-y-2 text-sm">
                    <DetailRow label="Abertura" value={formatDateTime(ticket.opened_at)} />
                    <DetailRow label="Prazo Previsto" value={formatDate(ticket.due_date)} />
                    <DetailRow label="Última Atividade" value={formatDateTime(ticket.last_activity_at)} />
                    <DetailRow label="Encerramento" value={ticket.closed_at ? formatDateTime(ticket.closed_at) : null} />
                  </div>
                </SummaryCard>
              </div>
              {ticket.description && (
                <SummaryCard title="Descrição" className="mt-4">
                  <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                </SummaryCard>
              )}
            </TabsContent>

            {/* Costs */}
            <TabsContent value="costs" className="mt-4">
              <SummaryCard title="Custos">
                <div className="grid grid-cols-2 gap-4 text-center py-4">
                  <div>
                    <p className="text-2xl font-bold">{ticket.estimated_cost ? `€${Number(ticket.estimated_cost).toFixed(2)}` : '—'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Custo Estimado</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ticket.approved_cost ? `€${Number(ticket.approved_cost).toFixed(2)}` : '—'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Custo Aprovado</p>
                  </div>
                </div>
              </SummaryCard>
            </TabsContent>

            {/* Tasks placeholder */}
            <TabsContent value="tasks" className="mt-4">
              <div className="rounded-lg border border-dashed p-8 text-center">
                <CheckSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Gestão de tarefas — em breve</p>
              </div>
            </TabsContent>

            {/* Attachments placeholder */}
            <TabsContent value="attachments" className="mt-4">
              <div className="rounded-lg border border-dashed p-8 text-center">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Anexos — em breve</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Quick info */}
          <SummaryCard title="Resumo">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Condomínio:</span>
                <span className="font-medium truncate cursor-pointer hover:text-accent" onClick={() => nav(`/condominios/${ticket.condominium_id}`)}>
                  {ticket.condominiums?.name}
                </span>
              </div>
              {ticket.suppliers?.name && (
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Fornecedor:</span>
                  <span className="font-medium">{ticket.suppliers.name}</span>
                </div>
              )}
              {ticket.location_text && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Local:</span>
                  <span className="font-medium">{ticket.location_text}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Prazo:</span>
                <span className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>{formatDate(ticket.due_date)}</span>
              </div>
            </div>
          </SummaryCard>

          {/* Change status */}
          {!['encerrado'].includes(ticket.status) && (
            <SummaryCard title="Alterar Estado">
              <div className="space-y-3">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Novo estado..." /></SelectTrigger>
                  <SelectContent>
                    {TICKET_STATUSES.filter(s => s.value !== ticket.status).map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(newStatus === 'resolvido' || newStatus === 'encerrado') && (
                  <Textarea placeholder="Resumo de encerramento..." value={closureSummary} onChange={e => setClosureSummary(e.target.value)} rows={2} />
                )}
                <Button size="sm" className="w-full" onClick={handleChangeStatus} disabled={!newStatus || changeStatus.isPending}>
                  Atualizar Estado
                </Button>
              </div>
            </SummaryCard>
          )}

          {/* AI Assistant */}
          <AIAssistantPanel
            actions={[
              {
                label: 'Gerar resumo da ocorrência',
                feature: 'ticket_summary',
                icon: FileText,
                buildPrompt: () => `Analisa esta ocorrência:\n\nTítulo: ${ticket.title}\nCódigo: ${ticket.code}\nCategoria: ${categoryLabel(ticket.category)}\nPrioridade: ${priorityLabel(ticket.priority)}\nEstado: ${statusLabel(ticket.status)}\nCondomínio: ${ticket.condominiums?.name || 'N/A'}\nDescrição: ${ticket.description || 'Sem descrição'}\nAberta em: ${formatDateTime(ticket.opened_at)}\nPrazo: ${formatDate(ticket.due_date)}\n\nHistórico de atualizações:\n${(updates || []).map(u => `- [${u.update_type}] ${u.body || ''} (${formatDateTime(u.created_at)})`).join('\n') || 'Sem atualizações'}`,
              },
              {
                label: 'Sugerir próximos passos',
                feature: 'next_steps',
                icon: ListChecks,
                buildPrompt: () => `Com base nesta ocorrência, sugere os próximos passos operacionais:\n\nTítulo: ${ticket.title}\nCategoria: ${categoryLabel(ticket.category)}\nPrioridade: ${priorityLabel(ticket.priority)}\nEstado: ${statusLabel(ticket.status)}\nDescrição: ${ticket.description || 'Sem descrição'}\nCondomínio: ${ticket.condominiums?.name || 'N/A'}`,
              },
              {
                label: 'Gerar resposta formal',
                feature: 'formal_response',
                icon: MessageSquare,
                buildPrompt: () => `Gera uma resposta formal para comunicar aos condóminos sobre esta ocorrência:\n\nTítulo: ${ticket.title}\nCategoria: ${categoryLabel(ticket.category)}\nEstado atual: ${statusLabel(ticket.status)}\nDescrição: ${ticket.description || 'Sem descrição'}\nCondomínio: ${ticket.condominiums?.name || 'N/A'}`,
              },
            ]}
          />
        </div>
      </div>

      <TicketFormDialog open={editOpen} onOpenChange={setEditOpen} ticket={ticket} />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || '—'}</span>
    </div>
  );
}
