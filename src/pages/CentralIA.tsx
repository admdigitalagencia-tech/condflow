import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { streamAI } from '@/services/aiAssistant';
import { buildCondominiumPromptContext, fetchTicketContext, fetchAssemblyContext } from '@/services/condominiumContext';
import { useCondominiumContext } from '@/hooks/useCondominiumContext';
import { useCondominiums } from '@/hooks/useCondominiums';
import { useTicketsByCondominium } from '@/hooks/useTickets';
import { useAssembliesByCondominium } from '@/hooks/useAssemblies';
import { useDocumentsByCondominium } from '@/hooks/useDocuments';
import { categoryLabel, statusLabel, priorityLabel } from '@/services/tickets';
import { assemblyStatusLabel, assemblyTypeLabel, minutesStatusLabel } from '@/services/assemblies';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Brain, Sparkles, Loader2, Copy, Check, Send, RotateCcw,
  FileText, MessageSquare, ListChecks, Calendar, Building2,
  AlertTriangle, ClipboardList, History, Search,
} from 'lucide-react';
import { toast } from 'sonner';

type ContextType = 'general' | 'ticket' | 'assembly' | 'document' | 'task';

const ACTIONS = [
  { key: 'condominium_summary', label: 'Resumir condomínio', icon: Building2, context: 'general' as ContextType },
  { key: 'ticket_summary', label: 'Resumir ocorrência', icon: AlertTriangle, context: 'ticket' as ContextType },
  { key: 'assembly_summary', label: 'Resumir assembleia', icon: Calendar, context: 'assembly' as ContextType },
  { key: 'formal_response', label: 'Gerar resposta formal', icon: MessageSquare, context: 'general' as ContextType },
  { key: 'next_steps', label: 'Sugerir próximos passos', icon: ListChecks, context: 'general' as ContextType },
  { key: 'assembly_tasks', label: 'Gerar tarefas pós-assembleia', icon: ClipboardList, context: 'assembly' as ContextType },
  { key: 'history_query', label: 'Consultar histórico', icon: History, context: 'general' as ContextType },
];

export default function CentralIA() {
  const { data: condominiums } = useCondominiums();
  const [selectedCondoId, setSelectedCondoId] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [selectedAssemblyId, setSelectedAssemblyId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: context, isLoading: contextLoading } = useCondominiumContext(selectedCondoId || null);
  const { data: tickets } = useTicketsByCondominium(selectedCondoId);
  const { data: assemblies } = useAssembliesByCondominium(selectedCondoId);
  const { data: documents } = useDocumentsByCondominium(selectedCondoId);

  const selectedCondo = condominiums?.find(c => c.id === selectedCondoId);
  const action = ACTIONS.find(a => a.key === selectedAction);
  const needsTicket = action?.context === 'ticket';
  const needsAssembly = action?.context === 'assembly';

  const openTickets = (tickets || []).filter(t => !['resolvido', 'encerrado'].includes(t.status));
  const pendingTasks = context?.tasks.filter(t => !['concluida', 'cancelada'].includes(t.status)) || [];

  const handleSubmit = useCallback(async () => {
    if (!selectedCondoId || !context) return;
    setLoading(true);
    setOutput('');

    let fullPrompt = prompt;
    let feature = selectedAction || 'general';
    let contextStr = buildCondominiumPromptContext(context);

    // Enrich with specific entity context
    if (needsTicket && selectedTicketId) {
      try {
        const tc = await fetchTicketContext(selectedTicketId);
        const t = tc.ticket;
        contextStr += `\n\n### OCORRÊNCIA SELECIONADA\n`;
        contextStr += `Código: ${t.code}\nTítulo: ${t.title}\nCategoria: ${categoryLabel(t.category)}\nPrioridade: ${priorityLabel(t.priority)}\nEstado: ${statusLabel(t.status)}\nDescrição: ${t.description || 'Sem descrição'}\nAberta em: ${new Date(t.opened_at).toLocaleDateString('pt-PT')}\nPrazo: ${t.due_date ? new Date(t.due_date).toLocaleDateString('pt-PT') : 'N/A'}\n`;
        if (tc.updates.length > 0) {
          contextStr += `\nHistórico de atualizações:\n`;
          tc.updates.forEach(u => {
            contextStr += `- [${u.update_type}] ${u.body || ''} (${new Date(u.created_at).toLocaleDateString('pt-PT')})\n`;
          });
        }
        if (!fullPrompt.trim()) fullPrompt = `Analisa a ocorrência ${t.code} — ${t.title}`;
      } catch { /* continue with base context */ }
    }

    if (needsAssembly && selectedAssemblyId) {
      try {
        const ac = await fetchAssemblyContext(selectedAssemblyId);
        const a = ac.assembly;
        contextStr += `\n\n### ASSEMBLEIA SELECIONADA\n`;
        contextStr += `Título: ${a.title}\nTipo: ${assemblyTypeLabel(a.assembly_type)}\nData: ${new Date(a.scheduled_date).toLocaleDateString('pt-PT')}\nEstado: ${assemblyStatusLabel(a.status)}\nAta: ${minutesStatusLabel(a.minutes_status)}\nLocal: ${a.location || 'N/A'}\nAgenda: ${a.agenda_text || 'N/A'}\n`;
        if (ac.points.length > 0) {
          contextStr += `\nPontos da ordem de trabalhos:\n`;
          ac.points.forEach(p => {
            contextStr += `${p.point_order}. ${p.title}`;
            if (p.deliberation_text) contextStr += ` — Deliberação: ${p.deliberation_text}`;
            if (p.voting_result_text) contextStr += ` | Votação: ${p.voting_result_text}`;
            contextStr += `\n`;
          });
        }
        if (ac.attendees.length > 0) {
          contextStr += `\nParticipantes: ${ac.attendees.map(att => att.attendee_name).join(', ')}\n`;
        }
        if (!fullPrompt.trim()) fullPrompt = `Analisa a assembleia "${a.title}"`;
      } catch { /* continue with base context */ }
    }

    if (!fullPrompt.trim()) {
      const defaultPrompts: Record<string, string> = {
        condominium_summary: `Gera um resumo operacional completo deste condomínio`,
        formal_response: `Gera uma comunicação formal para os condóminos`,
        next_steps: `Quais são os próximos passos operacionais prioritários para este condomínio?`,
        history_query: prompt || `Resume o histórico recente deste condomínio`,
      };
      fullPrompt = defaultPrompts[feature] || `Analisa o contexto deste condomínio e fornece informações relevantes`;
    }

    let result = '';
    await streamAI({
      messages: [{ role: 'user', content: fullPrompt }],
      feature,
      condominiumContext: contextStr,
      onDelta: (chunk) => { result += chunk; setOutput(result); },
      onDone: () => setLoading(false),
      onError: (err) => { toast.error(err); setLoading(false); },
    });
  }, [selectedCondoId, context, selectedAction, selectedTicketId, selectedAssemblyId, prompt, needsTicket, needsAssembly]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central Inteligente"
        description="Assistente IA contextual — selecione um condomínio para análises com dados reais"
      />

      {/* Condominium Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-accent-foreground shrink-0" />
            <Select value={selectedCondoId} onValueChange={(v) => { setSelectedCondoId(v); setSelectedTicketId(''); setSelectedAssemblyId(''); setOutput(''); }}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecionar condomínio para contexto IA..." />
              </SelectTrigger>
              <SelectContent>
                {(condominiums || []).map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex flex-col">
                      <span>{c.name}</span>
                      {c.address_line && <span className="text-xs text-muted-foreground">{c.address_line}{c.city ? `, ${c.city}` : ''}</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedCondoId && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Selecione um condomínio</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Para usar a IA com contexto real, selecione primeiro um condomínio acima. A IA irá analisar ocorrências, assembleias, tarefas e documentos desse condomínio.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedCondoId && contextLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {selectedCondoId && context && (
        <>
          {/* Context Summary Card */}
          <Card className="bg-accent/5 border-accent/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent-foreground" />
                <CardTitle className="text-sm">{context.condominium.name}</CardTitle>
              </div>
              {context.condominium.address && (
                <CardDescription className="text-xs">{context.condominium.address}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <ContextKPI label="Ocorrências Abertas" value={context.stats.openTickets} highlight={context.stats.openTickets > 0} />
                <ContextKPI label="Total Ocorrências" value={context.stats.totalTickets} />
                <ContextKPI label="Assembleias" value={context.stats.totalAssemblies} />
                <ContextKPI label="Documentos" value={context.stats.totalDocuments} />
                <ContextKPI label="Tarefas Pendentes" value={context.stats.pendingTasks} highlight={context.stats.pendingTasks > 0} />
                <ContextKPI label="Última Assembleia" value={context.stats.lastAssemblyDate ? new Date(context.stats.lastAssemblyDate).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' }) : '—'} />
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main area */}
            <div className="lg:col-span-2 space-y-4">
              {/* Action Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Ação da IA</CardTitle>
                  <CardDescription className="text-xs">Escolha o que deseja fazer e forneça detalhes adicionais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {ACTIONS.map(a => (
                      <Button
                        key={a.key}
                        variant={selectedAction === a.key ? 'default' : 'outline'}
                        size="sm"
                        className="justify-start gap-2 h-auto py-2.5 text-left"
                        onClick={() => { setSelectedAction(a.key); setSelectedTicketId(''); setSelectedAssemblyId(''); }}
                      >
                        <a.icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs leading-tight">{a.label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Entity selector */}
                  {needsTicket && (
                    <Select value={selectedTicketId} onValueChange={setSelectedTicketId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar ocorrência..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(tickets || []).map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            <span className="font-mono text-[10px] mr-2">{t.code}</span>
                            {t.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {needsAssembly && (
                    <Select value={selectedAssemblyId} onValueChange={setSelectedAssemblyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar assembleia..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(assemblies || []).map(a => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.title} — {new Date(a.scheduled_date).toLocaleDateString('pt-PT')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Textarea
                    placeholder={selectedAction === 'history_query'
                      ? 'Faça uma pergunta sobre o histórico deste condomínio...'
                      : 'Instruções adicionais (opcional)...'}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={3}
                  />

                  <Button
                    onClick={handleSubmit}
                    disabled={loading || (!selectedAction && !prompt.trim()) || (needsTicket && !selectedTicketId) || (needsAssembly && !selectedAssemblyId)}
                    className="gap-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Gerar
                  </Button>
                </CardContent>
              </Card>

              {/* Output */}
              {(output || loading) && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent-foreground" />
                        <CardTitle className="text-sm">Resultado</CardTitle>
                        {selectedCondo && <Badge variant="outline" className="text-[10px]">{selectedCondo.name}</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        {output && !loading && (
                          <Button variant="ghost" size="sm" className="gap-1.5 h-7" onClick={handleSubmit}>
                            <RotateCcw className="h-3 w-3" />
                            <span className="text-xs">Regenerar</span>
                          </Button>
                        )}
                        {output && (
                          <Button variant="ghost" size="sm" className="gap-1.5 h-7" onClick={handleCopy}>
                            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            <span className="text-xs">{copied ? 'Copiado' : 'Copiar'}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-[500px]">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{output || 'A gerar...'}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                    {loading && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> A processar com contexto de {selectedCondo?.name}...
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-auto py-2"
                    onClick={() => { setSelectedAction('condominium_summary'); setPrompt(''); handleQuickSubmit('condominium_summary', ''); }}>
                    <Building2 className="h-3.5 w-3.5 shrink-0" /> Resumo geral do prédio
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-auto py-2"
                    onClick={() => { setSelectedAction('next_steps'); setPrompt(''); handleQuickSubmit('next_steps', ''); }}>
                    <ListChecks className="h-3.5 w-3.5 shrink-0" /> Prioridades operacionais
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-auto py-2"
                    onClick={() => { setSelectedAction('formal_response'); setPrompt('Gera uma comunicação sobre o estado atual das ocorrências em curso'); handleQuickSubmit('formal_response', 'Gera uma comunicação sobre o estado atual das ocorrências em curso'); }}>
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" /> Comunicação sobre ocorrências
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-auto py-2"
                    onClick={() => { setSelectedAction('history_query'); setPrompt('Quais são os problemas recorrentes neste condomínio?'); handleQuickSubmit('history_query', 'Quais são os problemas recorrentes neste condomínio?'); }}>
                    <Search className="h-3.5 w-3.5 shrink-0" /> Problemas recorrentes
                  </Button>
                </CardContent>
              </Card>

              {/* Open tickets summary */}
              {openTickets.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Ocorrências Abertas ({openTickets.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {openTickets.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded p-1.5 -mx-1.5"
                          onClick={() => { setSelectedAction('ticket_summary'); setSelectedTicketId(t.id); }}>
                          <span className="font-mono text-[10px] text-muted-foreground">{t.code}</span>
                          <span className="flex-1 truncate">{t.title}</span>
                          <Badge variant="outline" className="text-[9px] shrink-0">{priorityLabel(t.priority)}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pending tasks summary */}
              {pendingTasks.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Tarefas Pendentes ({pendingTasks.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pendingTasks.slice(0, 5).map(t => (
                        <div key={t.id} className="text-xs p-1.5">
                          <span className="truncate">{t.title}</span>
                          {t.due_date && <span className="text-muted-foreground ml-2">· {new Date(t.due_date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  function handleQuickSubmit(feature: string, text: string) {
    if (!context) return;
    setLoading(true);
    setOutput('');

    const contextStr = buildCondominiumPromptContext(context);
    const defaultPrompts: Record<string, string> = {
      condominium_summary: 'Gera um resumo operacional completo deste condomínio',
      next_steps: 'Quais são os próximos passos operacionais prioritários?',
      formal_response: text || 'Gera uma comunicação formal',
      history_query: text || 'Resume o histórico recente',
    };
    const finalPrompt = text || defaultPrompts[feature] || 'Analisa o contexto';

    let result = '';
    streamAI({
      messages: [{ role: 'user', content: finalPrompt }],
      feature,
      condominiumContext: contextStr,
      onDelta: (chunk) => { result += chunk; setOutput(result); },
      onDone: () => setLoading(false),
      onError: (err) => { toast.error(err); setLoading(false); },
    });
  }
}

function ContextKPI({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className="text-center p-2 rounded-lg bg-background border">
      <p className={`text-lg font-bold ${highlight ? 'text-destructive' : ''}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{label}</p>
    </div>
  );
}
