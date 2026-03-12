import { FileText } from "lucide-react";

export default function Documentos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documentos</h1>
        <p className="text-sm text-muted-foreground">Gestão de documentos vinculados</p>
      </div>
      <div className="stat-card flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Módulo de documentos em desenvolvimento.</p>
        <p className="text-xs text-muted-foreground mt-1">Upload e gestão de atas, convocatórias, orçamentos e mais.</p>
      </div>
    </div>
  );
}
