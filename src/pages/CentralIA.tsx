import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { streamAI } from '@/services/aiAssistant';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTickets } from '@/hooks/useTickets';
import { useCondominiums } from '@/hooks/useCondominiums';
import {
  Brain, Sparkles, Loader2, Copy, Check, Send,
  FileText, MessageSquare, ListChecks, Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const FEATURES = [
  { value: 'ticket_summary', label: 'Resumo de ocorrência', icon: FileText },
  { value: 'formal_response', label: 'Resposta formal', icon: MessageSquare },
  { value: 'next_steps', label: 'Próximos passos', icon: ListChecks },
  { value: 'assembly_summary', label: 'Resumo de assembleia', icon: Calendar },
  { value: 'general', label: 'Pergunta livre', icon: Brain },
];

export default function CentralIA() {
  const { data: tickets } = useTickets();
  const { data: condominiums } = useCondominiums();
  const [feature, setFeature] = useState('general');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput('');
    let result = '';

    await streamAI({
      messages: [{ role: 'user', content: prompt }],
      feature,
      onDelta: (chunk) => { result += chunk; setOutput(result); },
      onDone: () => setLoading(false),
      onError: (err) => { toast.error(err); setLoading(false); },
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickAction = (feat: string, text: string) => {
    setFeature(feat);
    setPrompt(text);
  };

  const selectedFeature = FEATURES.find(f => f.value === feature);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central Inteligente"
        description="Use IA para gerar resumos, respostas e análises operacionais"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main area */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent">
                  <Brain className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Assistente IA</CardTitle>
                  <CardDescription>Descreva o que precisa e a IA irá gerar o conteúdo</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={feature} onValueChange={setFeature}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEATURES.map(f => (
                    <SelectItem key={f.value} value={f.value}>
                      <div className="flex items-center gap-2">
                        <f.icon className="h-3.5 w-3.5" />
                        {f.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder={feature === 'general'
                  ? 'Faça uma pergunta ou descreva o que precisa...'
                  : `Descreva o contexto para: ${selectedFeature?.label}...`}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={4}
              />

              <Button onClick={handleSubmit} disabled={loading || !prompt.trim()} className="gap-2">
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
                  </div>
                  {output && (
                    <Button variant="ghost" size="sm" className="gap-1.5 h-7" onClick={handleCopy}>
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span className="text-xs">{copied ? 'Copiado' : 'Copiar'}</span>
                    </Button>
                  )}
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
                    <Loader2 className="h-3 w-3 animate-spin" /> A processar...
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Quick actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ações Rápidas</CardTitle>
              <CardDescription className="text-xs">Clique para pré-preencher o prompt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-auto py-2"
                onClick={() => handleQuickAction('ticket_summary', 'Resume as ocorrências abertas e identifica as mais urgentes.')}>
                <FileText className="h-3.5 w-3.5 shrink-0" /> Resumir ocorrências abertas
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-auto py-2"
                onClick={() => handleQuickAction('formal_response', 'Gera uma comunicação formal para os condóminos sobre obras em curso.')}>
                <MessageSquare className="h-3.5 w-3.5 shrink-0" /> Comunicação sobre obras
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-auto py-2"
                onClick={() => handleQuickAction('next_steps', 'Quais são as prioridades operacionais para esta semana?')}>
                <ListChecks className="h-3.5 w-3.5 shrink-0" /> Prioridades da semana
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-auto py-2"
                onClick={() => handleQuickAction('general', 'Analisa os principais problemas recorrentes nos condomínios e sugere ações preventivas.')}>
                <Brain className="h-3.5 w-3.5 shrink-0" /> Análise preventiva
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Contexto Disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condomínios</span>
                  <span className="font-medium">{condominiums?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ocorrências</span>
                  <span className="font-medium">{tickets?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
