import { useParams, useNavigate } from "react-router-dom";
import { mockCondominios, mockOcorrencias, mockAssembleias } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";

const priorityClass: Record<string, string> = {
  Baixa: "badge-priority-low", Média: "badge-priority-medium",
  Alta: "badge-priority-high", Crítica: "badge-priority-critical",
};
const statusClass: Record<string, string> = {
  Aberto: "badge-status-open", "Em Análise": "badge-status-analysis",
  "Orçamento Solicitado": "badge-status-budget", "Aguardando Aprovação": "badge-status-approval",
  "Em Execução": "badge-status-execution", Resolvido: "badge-status-resolved", Encerrado: "badge-status-closed",
};

export default function CondominioDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const c = mockCondominios.find(c => c.id === id);
  if (!c) return <div className="p-6">Condomínio não encontrado.</div>;

  const ocorrencias = mockOcorrencias.filter(o => o.condominioId === id);
  const assembleias = mockAssembleias.filter(a => a.condominioId === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => nav("/condominios")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-accent" />
          <h1 className="text-xl font-bold">{c.nome}</h1>
          <Badge variant="outline" className={c.ativo ? "badge-priority-low" : "badge-status-closed"}>
            {c.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="ocorrencias">Ocorrências ({ocorrencias.length})</TabsTrigger>
          <TabsTrigger value="assembleias">Assembleias ({assembleias.length})</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="stat-card space-y-2">
              <h3 className="text-sm font-semibold">Dados Gerais</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Morada:</span> {c.morada}</p>
                <p><span className="text-muted-foreground">Código Postal:</span> {c.codigoPostal}</p>
                <p><span className="text-muted-foreground">Cidade:</span> {c.cidade}</p>
                <p><span className="text-muted-foreground">NIF:</span> {c.nif}</p>
                <p><span className="text-muted-foreground">Desde:</span> {c.criadoEm}</p>
              </div>
              {c.observacoes && <p className="text-xs text-muted-foreground border-t pt-2">{c.observacoes}</p>}
            </div>
            <div className="stat-card space-y-2">
              <h3 className="text-sm font-semibold">Resumo</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Ocorrências abertas:</span> {ocorrencias.filter(o => !["Resolvido","Encerrado"].includes(o.status)).length}</p>
                <p><span className="text-muted-foreground">Assembleias agendadas:</span> {assembleias.filter(a => a.estado === "Agendada").length}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ocorrencias" className="mt-4">
          {ocorrencias.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">Sem ocorrências registadas.</p>
          ) : (
            <div className="rounded-lg border bg-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Título</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Categoria</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Prioridade</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {ocorrencias.map(o => (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{o.titulo}</td>
                      <td className="px-4 py-3 text-muted-foreground">{o.categoria}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className={`text-[11px] ${priorityClass[o.prioridade]}`}>{o.prioridade}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="outline" className={`text-[11px] ${statusClass[o.status]}`}>{o.status}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{o.dataAbertura}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assembleias" className="mt-4">
          {assembleias.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">Sem assembleias registadas.</p>
          ) : (
            <div className="space-y-3">
              {assembleias.map(a => (
                <div key={a.id} className="stat-card">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{a.tipo} — {a.data}</span>
                    <Badge variant="outline" className={a.estado === "Agendada" ? "badge-status-execution" : a.estado === "Concluída" ? "badge-status-resolved" : "badge-status-closed"}>
                      {a.estado}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.hora} • {a.local}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <p className="text-sm text-muted-foreground p-4">Módulo de documentos — em breve.</p>
        </TabsContent>
        <TabsContent value="stakeholders" className="mt-4">
          <p className="text-sm text-muted-foreground p-4">Módulo de stakeholders — em breve.</p>
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <p className="text-sm text-muted-foreground p-4">Histórico — em breve.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
