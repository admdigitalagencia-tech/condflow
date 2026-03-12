import { useState } from "react";
import { mockOcorrencias } from "@/data/mockData";
import { CATEGORIAS, PRIORIDADES, STATUS_OCORRENCIA } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const priorityClass: Record<string, string> = {
  Baixa: "badge-priority-low", Média: "badge-priority-medium",
  Alta: "badge-priority-high", Crítica: "badge-priority-critical",
};
const statusClass: Record<string, string> = {
  Aberto: "badge-status-open", "Em Análise": "badge-status-analysis",
  "Orçamento Solicitado": "badge-status-budget", "Aguardando Aprovação": "badge-status-approval",
  "Em Execução": "badge-status-execution", Resolvido: "badge-status-resolved", Encerrado: "badge-status-closed",
};

export default function Ocorrencias() {
  const [search, setSearch] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("all");
  const [filtroPrioridade, setFiltroPrioridade] = useState("all");
  const [filtroStatus, setFiltroStatus] = useState("all");

  const filtered = mockOcorrencias.filter(o => {
    if (search && !o.titulo.toLowerCase().includes(search.toLowerCase()) && !o.condominioNome.toLowerCase().includes(search.toLowerCase())) return false;
    if (filtroCategoria !== "all" && o.categoria !== filtroCategoria) return false;
    if (filtroPrioridade !== "all" && o.prioridade !== filtroPrioridade) return false;
    if (filtroStatus !== "all" && o.status !== filtroStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ocorrências</h1>
        <p className="text-sm text-muted-foreground">{filtered.length} de {mockOcorrencias.length} ocorrências</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
        </div>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {PRIORIDADES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {STATUS_OCORRENCIA.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Condomínio</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Título</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Categoria</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Prioridade</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Responsável</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Abertura</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Prazo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors animate-fade-in">
                <td className="px-4 py-3 text-muted-foreground">{o.condominioNome}</td>
                <td className="px-4 py-3 font-medium">{o.titulo}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.categoria}</td>
                <td className="px-4 py-3"><Badge variant="outline" className={`text-[11px] ${priorityClass[o.prioridade]}`}>{o.prioridade}</Badge></td>
                <td className="px-4 py-3"><Badge variant="outline" className={`text-[11px] ${statusClass[o.status]}`}>{o.status}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{o.responsavel || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.dataAbertura}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.prazoPrevisto}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhuma ocorrência encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
