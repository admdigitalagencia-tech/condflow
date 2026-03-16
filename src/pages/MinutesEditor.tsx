import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMinute, useUpdateMinute, useMinuteSections, useCreateMinuteSection, useUpdateMinuteSection, useGenerateMinutesAI } from '@/hooks/useAssemblies';
import { useAssembly, useAssemblyPoints, useTranscripts } from '@/hooks/useAssemblies';
import { useDocumentsByAssembly } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SummaryCard } from '@/components/shared/SummaryCard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  ArrowLeft, Save, RefreshCw, FileText, Brain, Plus,
  ListOrdered, StickyNote, Mic, BookOpen, Download, GitCompare, Sparkles, Loader2, FileDown, FileType,
} from 'lucide-react';
import { toast } from 'sonner';
import { exportToDocx, exportToPdf } from '@/services/minutesExport';

export default function MinutesEditor() {
  const { id: assemblyId, minuteId } = useParams<{ id: string; minuteId: string }>();
  const nav = useNavigate();
  const { data: minute, isLoading } = useMinute(minuteId!);
  const updateMinute = useUpdateMinute();
  const { data: sections } = useMinuteSections(minuteId!);
  const createSection = useCreateMinuteSection();
  const updateSection = useUpdateMinuteSection();
  const { data: assembly } = useAssembly(assemblyId!);
  const { data: points } = useAssemblyPoints(assemblyId!);
  const { data: transcripts } = useTranscripts(assemblyId!);
  const { data: docs } = useDocumentsByAssembly(assemblyId!);
  const generateAI = useGenerateMinutesAI();

  const [content, setContent] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionContent, setSectionContent] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Initialize content from minute
  if (minute && !initialized) {
    setContent(minute.content_longtext || '');
    setInitialized(true);
  }

  if (isLoading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!minute) return <div className="p-6">Ata não encontrada.</div>;

  const handleSave = async () => {
    try {
      await updateMinute.mutateAsync({ id: minuteId!, values: { content_longtext: content }, assemblyId: assemblyId! });
      toast.success('Ata guardada');
    } catch { toast.error('Erro ao guardar'); }
  };

  const handleAddSection = async (key: string, title: string) => {
    try {
      await createSection.mutateAsync({ minute_id: minuteId!, section_key: key, section_title: title });
      toast.success('Secção adicionada');
    } catch { toast.error('Erro'); }
  };

  const handleSaveSection = async (sectionId: string) => {
    try {
      await updateSection.mutateAsync({ id: sectionId, values: { content: sectionContent }, minuteId: minuteId! });
      setActiveSection(null);
      toast.success('Secção atualizada');
    } catch { toast.error('Erro'); }
  };

  const defaultSections = [
    { key: 'abertura', title: 'Abertura' },
    { key: 'quorum', title: 'Verificação de Quórum' },
    { key: 'deliberacoes', title: 'Deliberações' },
    { key: 'encerramento', title: 'Encerramento' },
  ];

  const existingSectionKeys = new Set((sections || []).map(s => s.section_key));

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => nav(`/assembleias/${assemblyId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{minute.title}</h1>
          <p className="text-xs text-muted-foreground">v{minute.version_number} · {minute.generation_source}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" className="gap-1.5" disabled>
            <GitCompare className="h-3.5 w-3.5" /> Comparar
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" disabled>
            <Download className="h-3.5 w-3.5" /> Exportar
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={updateMinute.isPending}>
            <Save className="h-3.5 w-3.5" /> Guardar
          </Button>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-12 gap-4 min-h-[calc(100vh-200px)]">
        {/* Left: Navigation */}
        <div className="col-span-3 space-y-3">
          <SummaryCard title="Secções da Ata">
            <div className="space-y-1">
              {(sections || []).map(s => (
                <button
                  key={s.id}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeSection === s.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                  onClick={() => { setActiveSection(s.id); setSectionContent(s.content || ''); }}
                >
                  {s.section_title}
                </button>
              ))}
              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-muted-foreground mb-1">Adicionar secção:</p>
                {defaultSections.filter(d => !existingSectionKeys.has(d.key)).map(d => (
                  <button key={d.key} className="w-full text-left px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted" onClick={() => handleAddSection(d.key, d.title)}>
                    <Plus className="h-3 w-3 inline mr-1" />{d.title}
                  </button>
                ))}
              </div>
            </div>
          </SummaryCard>

          <SummaryCard title="Ordem de Trabalhos">
            <div className="space-y-1">
              {(points || []).map(p => (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent/20 text-accent text-[10px] font-bold shrink-0">{p.point_order}</span>
                  <span className="text-xs truncate">{p.title}</span>
                </div>
              ))}
            </div>
          </SummaryCard>
        </div>

        {/* Center: Editor */}
        <div className="col-span-6 space-y-3">
          {activeSection ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{(sections || []).find(s => s.id === activeSection)?.section_title}</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1 text-xs" disabled><RefreshCw className="h-3 w-3" /> Regenerar</Button>
                  <Button size="sm" className="text-xs" onClick={() => handleSaveSection(activeSection)}>Guardar Secção</Button>
                </div>
              </div>
              <Textarea
                value={sectionContent}
                onChange={e => setSectionContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Escreva o conteúdo desta secção..."
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Conteúdo Completo da Ata</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs"
                    onClick={() => generateAI.mutate(assemblyId!)}
                    disabled={generateAI.isPending}
                  >
                    {generateAI.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    {generateAI.isPending ? 'A gerar...' : 'Gerar nova versão IA'}
                  </Button>
                </div>
              </div>
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
                placeholder="Escreva ou gere automaticamente a ata da assembleia..."
              />
            </div>
          )}
        </div>

        {/* Right: Context */}
        <div className="col-span-3 space-y-3">
          <SummaryCard title="Contexto e Evidências">
            <div className="rounded-md bg-muted/50 p-3 border border-dashed">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-accent">IA — em breve</span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Resumo automático</li>
                <li>• Ata formal</li>
                <li>• Resumo executivo</li>
                <li>• Tarefas pós-assembleia</li>
              </ul>
            </div>
          </SummaryCard>

          {assembly?.notes && (
            <SummaryCard title="Notas do Gestor">
              <p className="text-xs whitespace-pre-wrap">{assembly.notes}</p>
            </SummaryCard>
          )}

          {transcripts && transcripts.length > 0 && (
            <SummaryCard title="Transcrição">
              <p className="text-xs text-muted-foreground max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                {transcripts[0].raw_text || 'Transcrição pendente...'}
              </p>
            </SummaryCard>
          )}

          {docs && docs.length > 0 && (
            <SummaryCard title="Documentos Anexos">
              <div className="space-y-1">
                {docs.map(d => (
                  <div key={d.id} className="flex items-center gap-2 text-xs">
                    <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{d.title}</span>
                  </div>
                ))}
              </div>
            </SummaryCard>
          )}
        </div>
      </div>
    </div>
  );
}
