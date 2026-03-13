import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { streamAI } from '@/services/aiAssistant';
import { buildCondominiumPromptContext, type CondominiumContext } from '@/services/condominiumContext';
import { Button } from '@/components/ui/button';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Loader2, Copy, Check, RotateCcw } from 'lucide-react';
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
  condominiumContext?: CondominiumContext | null;
}

export function AIAssistantPanel({ actions, title = 'Assistente IA', condominiumContext }: Props) {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState('');
  const [lastAction, setLastAction] = useState<AIAction | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAction = useCallback(async (action: AIAction) => {
    setLoading(true);
    setActiveFeature(action.feature);
    setLastAction(action);
    setOutput('');

    const prompt = action.buildPrompt();
    let result = '';
    const contextStr = condominiumContext ? buildCondominiumPromptContext(condominiumContext) : undefined;

    await streamAI({
      messages: [{ role: 'user', content: prompt }],
      feature: action.feature,
      condominiumContext: contextStr,
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
  }, [condominiumContext]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copiado para a área de transferência');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (lastAction) handleAction(lastAction);
  };

  return (
    <SummaryCard title={title}>
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {actions.map((action) => (
            <Button
              key={action.feature + action.label}
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

        {(output || loading) && (
          <div className="relative">
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
                  <span className="text-[11px] font-medium text-accent-foreground">Resultado IA</span>
                </div>
                <div className="flex items-center gap-1">
                  {output && !loading && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRegenerate} title="Regenerar">
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                  {output && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
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
