import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { streamAI } from '@/services/aiAssistant';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, FileText, MessageSquare, ListChecks, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AIAction {
  label: string;
  feature: string;
  icon: React.ElementType;
  buildPrompt: () => string;
}

interface Props {
  actions: AIAction[];
  title?: string;
}

export function AIAssistantPanel({ actions, title = 'Assistente IA' }: Props) {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAction = useCallback(async (action: AIAction) => {
    setLoading(true);
    setActiveFeature(action.feature);
    setOutput('');

    const prompt = action.buildPrompt();
    let result = '';

    await streamAI({
      messages: [{ role: 'user', content: prompt }],
      feature: action.feature,
      onDelta: (chunk) => {
        result += chunk;
        setOutput(result);
      },
      onDone: () => setLoading(false),
      onError: (err) => {
        toast.error(err);
        setLoading(false);
      },
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copiado para a área de transferência');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SummaryCard title={title}>
      <div className="space-y-3">
        {/* Action buttons */}
        <div className="grid grid-cols-1 gap-2">
          {actions.map((action) => (
            <Button
              key={action.feature}
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-auto py-2 text-left"
              onClick={() => handleAction(action)}
              disabled={loading}
            >
              {loading && activeFeature === action.feature ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              ) : (
                <action.icon className="h-3.5 w-3.5 shrink-0 text-accent-foreground" />
              )}
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Output */}
        {(output || loading) && (
          <div className="relative">
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
                  <span className="text-[11px] font-medium text-accent-foreground">Resultado IA</span>
                </div>
                {output && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                )}
              </div>
              <ScrollArea className="max-h-[400px]">
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown>{output || 'A gerar...'}</ReactMarkdown>
                </div>
              </ScrollArea>
              {loading && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  A processar...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SummaryCard>
  );
}
