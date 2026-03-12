import { mockAssembleias } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

const estadoClass: Record<string, string> = {
  Agendada: "badge-status-execution",
  "Em Curso": "badge-status-analysis",
  Concluída: "badge-status-resolved",
  Cancelada: "badge-status-closed",
};

export default function Assembleias() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assembleias</h1>
        <p className="text-sm text-muted-foreground">{mockAssembleias.length} assembleias registadas</p>
      </div>

      <div className="space-y-4">
        {mockAssembleias.map(a => (
          <div key={a.id} className="stat-card animate-fade-in">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <span className="font-semibold text-sm">{a.condominioNome}</span>
              </div>
              <Badge variant="outline" className={`text-[11px] ${estadoClass[a.estado]}`}>
                {a.estado}
              </Badge>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground mb-3">
              <span>{a.tipo}</span>
              <span>{a.data} às {a.hora}</span>
              <span>{a.local}</span>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">Ordem de Trabalhos:</p>
              <pre className="text-xs text-foreground whitespace-pre-wrap font-sans">{a.ordemTrabalhos}</pre>
            </div>
            {a.notasGestor && (
              <div className="border-t pt-2 mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Notas do Gestor:</p>
                <p className="text-xs text-foreground">{a.notasGestor}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
