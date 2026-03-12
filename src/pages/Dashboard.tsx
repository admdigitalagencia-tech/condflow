import { Building2, AlertTriangle, Calendar, FileText, Clock, AlertOctagon } from "lucide-react";
import {
  mockCondominios, getOcorrenciasAbertas, getOcorrenciasCriticas,
  getOcorrenciasAtrasadas, getAssembleiasAgendadas, getAtasPendentes,
  mockOcorrencias,
} from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

function StatCard({ label, value, icon: Icon, variant, onClick }: {
  label: string; value: number; icon: React.ElementType; variant?: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="stat-card text-left w-full animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${variant === "critical" ? "text-destructive" : "text-accent"}`} />
      </div>
      <p className={`text-2xl font-bold ${variant === "critical" ? "text-destructive" : "text-foreground"}`}>
        {value}
      </p>
    </button>
  );
}

const priorityClass: Record<string, string> = {
  Baixa: "badge-priority-low",
  Média: "badge-priority-medium",
  Alta: "badge-priority-high",
  Crítica: "badge-priority-critical",
};

const statusClass: Record<string, string> = {
  Aberto: "badge-status-open",
  "Em Análise": "badge-status-analysis",
  "Orçamento Solicitado": "badge-status-budget",
  "Aguardando Aprovação": "badge-status-approval",
  "Em Execução": "badge-status-execution",
  Resolvido: "badge-status-resolved",
  Encerrado: "badge-status-closed",
};

export default function Dashboard() {
  const nav = useNavigate();
  const abertas = getOcorrenciasAbertas();
  const criticas = getOcorrenciasCriticas();
  const atrasadas = getOcorrenciasAtrasadas();
  const agendadas = getAssembleiasAgendadas();
  const atasPend = getAtasPendentes();

  const recentOcorrencias = [...mockOcorrencias]
    .sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da gestão operacional</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Condomínios" value={mockCondominios.filter(c => c.ativo).length} icon={Building2} onClick={() => nav("/condominios")} />
        <StatCard label="Ocorrências Abertas" value={abertas.length} icon={AlertTriangle} onClick={() => nav("/ocorrencias")} />
        <StatCard label="Críticas" value={criticas.length} icon={AlertOctagon} variant="critical" onClick={() => nav("/ocorrencias")} />
        <StatCard label="Atrasadas" value={atrasadas.length} icon={Clock} variant={atrasadas.length > 0 ? "critical" : undefined} onClick={() => nav("/ocorrencias")} />
        <StatCard label="Assembleias" value={agendadas.length} icon={Calendar} onClick={() => nav("/assembleias")} />
        <StatCard label="Atas Pendentes" value={atasPend.length} icon={FileText} onClick={() => nav("/assembleias")} />
      </div>

      <div className="rounded-lg border bg-card">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-sm">Ocorrências Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Condomínio</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Título</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Categoria</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Prioridade</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentOcorrencias.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => nav("/ocorrencias")}>
                  <td className="px-4 py-3 text-muted-foreground">{o.condominioNome}</td>
                  <td className="px-4 py-3 font-medium">{o.titulo}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.categoria}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-[11px] ${priorityClass[o.prioridade]}`}>
                      {o.prioridade}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-[11px] ${statusClass[o.status]}`}>
                      {o.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.dataAbertura}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
