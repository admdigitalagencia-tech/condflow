import { Users } from "lucide-react";

export default function Stakeholders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stakeholders</h1>
        <p className="text-sm text-muted-foreground">Gestão de contactos e intervenientes</p>
      </div>
      <div className="stat-card flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Módulo de stakeholders em desenvolvimento.</p>
        <p className="text-xs text-muted-foreground mt-1">Gestão de contactos, funções e associações por condomínio.</p>
      </div>
    </div>
  );
}
