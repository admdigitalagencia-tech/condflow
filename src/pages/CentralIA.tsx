import { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText } from 'lucide-react';
import { streamAI } from '@/services/aiAssistant';
import { buildCondominiumPromptContext, fetchTicketContext, fetchAssemblyContext } from '@/services/condominiumContext';
import { useCondominiumContext } from '@/hooks/useCondominiumContext';
import { useCondominiums } from '@/hooks/useCondominiums';
import { useTicketsByCondominium } from '@/hooks/useTickets';
import { useAssembliesByCondominium } from '@/hooks/useAssemblies';
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
  Brain, Sparkles, Loader2, Copy, Check, Send,
  Building2, AlertTriangle, Calendar, ListChecks,
  MessageSquare, ClipboardList, History, User, Trash2, Maximize2, Minimize2,
} from 'lucide-react';
import { toast } from 'sonner';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type ContextType = 'general' | 'ticket' | 'assembly' | 'document' | 'task';

const ACTIONS = [
  { key: 'condominium_summary', label: 'Resumir condomínio', icon: Building2, context: 'general' as ContextType },
  { key: 'ticket_summary', label: 'Resumir ocorrência', icon: AlertTriangle, context: 'ticket' as ContextType },
  { key: 'assembly_summary', label: 'Resumir assembleia', icon: Calendar, context: 'assembly' as ContextType },
  { key: 'document_analysis', label: 'Analisar documentos', icon: FileText, context: 'general' as ContextType },
  { key: 'formal_response', label: 'Gerar resposta formal', icon: MessageSquare, context: 'general' as ContextType },
  { key: 'next_steps', label: 'Sugerir próximos passos', icon: ListChecks, context: 'general' as ContextType },
  { key: 'assembly_tasks', label: 'Tarefas pós-assembleia', icon: ClipboardList, context: 'assembly' as ContextType },
  { key: 'history_query', label: 'Consultar histórico', icon: History, context: 'general' as ContextType },
];

export default function CentralIA() {
  const { data: condominiums } = useCondominiums();
  const [selectedCondoId, setSelectedCondoId] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [selectedAssemblyId, setSelectedAssemblyId] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: context, isLoading: contextLoading } = useCondominiumContext(selectedCondoId || null);
  const { data: tickets } = useTicketsByCondominium(selectedCondoId);
  const { data: assemblies } = useAssembliesByCondominium(selectedCondoId);

  const selectedCondo = condominiums?.find(c => c.id === selectedCondoId);
  const action = ACTIONS.find(a => a.key === selectedAction);
  const needsTicket = action?.context === 'ticket';
  const needsAssembly = action?.context === 'assembly';

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildExtraContext = useCallback(async () => {
    let extra = '';
    if (needsTicket && selectedTicketId) {
      try {
        const tc = await fetchTicketContext(selectedTicketId);
        const t = tc.ticket;
        extra += `\n\n### OCORRÊNCIA SELECIONADA\nCódigo: ${t.code}\nTítulo: ${t.title}\nCategoria: ${categoryLabel(t.category)}\nPrioridade: ${priorityLabel(t.priority)}\nEstado: ${statusLabel(t.status)}\nDescrição: ${t.description || 'Sem descrição'}\nAberta em: ${new Date(t.opened_at).toLocaleDateString('pt-PT')}\nPrazo: ${t.due_date ? new Date(t.due_date).toLocaleDateString('pt-PT') : 'N/A'}\n`;
        if (tc.updates.length > 0) {
          extra += `\nHistórico:\n`;
          tc.updates.forEach(u => { extra += `- [${u.update_type}] ${u.body || ''} (${new Date(u.created_at).toLocaleDateString('pt-PT')})\n`; });
        }
      } catch { /* fallback */ }
    }
    if (needsAssembly && selectedAssemblyId) {
      try {
        const ac = await fetchAssemblyContext(selectedAssemblyId);
        const a = ac.assembly;
        extra += `\n\n### ASSEMBLEIA SELECIONADA\nTítulo: ${a.title}\nTipo: ${assemblyTypeLabel(a.assembly_type)}\nData: ${new Date(a.scheduled_date).toLocaleDateString('pt-PT')}\nEstado: ${assemblyStatusLabel(a.status)}\nAta: ${minutesStatusLabel(a.minutes_status)}\nLocal: ${a.location || 'N/A'}\nAgenda: ${a.agenda_text || 'N/A'}\n`;
        if (ac.points.length > 0) {
          extra += `\nPontos:\n`;
          ac.points.forEach(p => { extra += `${p.point_order}. ${p.title}${p.deliberation_text ? ` — ${p.deliberation_text}` : ''}\n`; });
        }
        if (ac.attendees.length > 0) {
          extra += `\nParticipantes: ${ac.attendees.map(att => att.attendee_name).join(', ')}\n`;
        }
      } catch { /* fallback */ }
    }
    return extra;
  }, [needsTicket, needsAssembly, selectedTicketId, selectedAssemblyId]);

  const handleSend = useCallback(async (overrideText?: string) => {
    if (!selectedCondoId || !context) return;
    const text = overrideText || input.trim();
    if (!text && !selectedAction) return;

    const userContent = text || (() => {
      const defaults: Record<string, string> = {
        condominium_summary: 'Gera um resumo operacional completo deste condomínio',
        formal_response: 'Gera uma comunicação formal para os condóminos',
        next_steps: 'Quais são os próximos passos operacionais prioritários?',
        history_query: 'Resume o histórico recente deste condomínio',
        ticket_summary: 'Analisa esta ocorrência',
        assembly_summary: 'Analisa esta assembleia',
        assembly_tasks: 'Gera as tarefas pós-assembleia',
        document_analysis: 'Analisa os documentos deste condomínio e identifica informações importantes, valores, decisões e temas relevantes',
      };
      return defaults[selectedAction] || 'Analisa o contexto deste condomínio';
    })();

    const userMsg: ChatMessage = { role: 'user', content: userContent };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    let contextStr = buildCondominiumPromptContext(context);
    const extra = await buildExtraContext();
    contextStr += extra;

    let assistantSoFar = '';
    await streamAI({
      messages: newMessages,
      feature: selectedAction || 'general',
      condominiumContext: contextStr,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: 'assistant', content: assistantSoFar }];
        });
      },
      onDone: () => setLoading(false),
      onError: (err) => { toast.error(err); setLoading(false); },
    });
  }, [selectedCondoId, context, selectedAction, input, messages, buildExtraContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (idx: number) => {
    navigator.clipboard.writeText(messages[idx].content);
    setCopiedIdx(idx);
    toast.success('Copiado');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    setSelectedAction('');
  };

  const handleActionClick = (key: string) => {
    setSelectedAction(key);
    setSelectedTicketId('');
    setSelectedAssemblyId('');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Central Inteligente"
        description="Assistente IA conversacional — selecione um condomínio e converse sobre os seus dados"
      />

      {/* Condo selector */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <Select value={selectedCondoId} onValueChange={(v) => { setSelectedCondoId(v); setSelectedTicketId(''); setSelectedAssemblyId(''); setMessages([]); }}>
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
              Para conversar com a IA sobre dados reais, selecione primeiro um condomínio.
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
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Sidebar — actions & entity selectors */}
          <div className="lg:col-span-1 space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {ACTIONS.map(a => (
                  <Button
                    key={a.key}
                    variant={selectedAction === a.key ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start gap-2 h-auto py-2 text-xs"
                    onClick={() => handleActionClick(a.key)}
                  >
                    <a.icon className="h-3.5 w-3.5 shrink-0" />
                    {a.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {needsTicket && (
              <Card>
                <CardContent className="pt-4 pb-3">
                  <Select value={selectedTicketId} onValueChange={setSelectedTicketId}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Selecionar ocorrência..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(tickets || []).map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          <span className="font-mono text-[10px] mr-1">{t.code}</span> {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {needsAssembly && (
              <Card>
                <CardContent className="pt-4 pb-3">
                  <Select value={selectedAssemblyId} onValueChange={setSelectedAssemblyId}>
                    <SelectTrigger className="text-xs">
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
                </CardContent>
              </Card>
            )}

            {/* Context badge */}
            <div className="px-1">
              <Badge variant="outline" className="text-[10px] gap-1">
                <Building2 className="h-3 w-3" /> {selectedCondo?.name}
              </Badge>
            </div>
          </div>

          {/* Chat area */}
          <div className="lg:col-span-3 flex flex-col">
            <Card className={`flex flex-col transition-all ${expanded ? 'fixed inset-4 z-50' : ''}`}>
              {/* Header */}
              <CardHeader className="pb-2 border-b border-border/50 flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Conversa IA</CardTitle>
                  {messages.length > 0 && (
                    <Badge variant="secondary" className="text-[10px]">{Math.floor(messages.length / 2)} troca{Math.floor(messages.length / 2) !== 1 ? 's' : ''}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleClearChat} title="Limpar conversa">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExpanded(!expanded)} title={expanded ? 'Minimizar' : 'Expandir'}>
                    {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <div
                ref={scrollRef}
                className={`flex-1 overflow-y-auto p-4 space-y-4 ${expanded ? '' : 'min-h-[350px] max-h-[55vh]'}`}
              >
                {messages.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Brain className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Selecione uma ação rápida ou escreva uma pergunta para iniciar a conversa.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">As conversas são temporárias e não são guardadas.</p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div className={`relative group max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted/60 border border-border/50 rounded-bl-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      {msg.role === 'assistant' && msg.content && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-9 top-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopy(idx)}
                        >
                          {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex gap-3">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="bg-muted/60 border border-border/50 rounded-xl rounded-bl-sm px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="border-t border-border/50 p-3">
                <div className="flex gap-2 items-end">
                  <Textarea
                    ref={inputRef}
                    placeholder="Escreva a sua pergunta ou peça mais detalhes..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={expanded ? 4 : 2}
                    className="resize-y min-h-[40px] max-h-[200px] text-sm"
                  />
                  <Button
                    onClick={() => handleSend()}
                    disabled={loading || (!input.trim() && !selectedAction)}
                    size="icon"
                    className="shrink-0 h-10 w-10"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 px-0.5">
                  Enter para enviar · Shift+Enter para nova linha · As conversas não são guardadas
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
