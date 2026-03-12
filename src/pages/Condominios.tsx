import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockCondominios } from "@/data/mockData";
import { Building2, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Condominio } from "@/types";

export default function Condominios() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [condominios, setCondominios] = useState(mockCondominios);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", morada: "", codigoPostal: "", cidade: "", nif: "", observacoes: "", ativo: true });

  const filtered = condominios.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cidade.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const novo: Condominio = {
      ...form,
      id: String(Date.now()),
      criadoEm: new Date().toISOString().split("T")[0],
    };
    setCondominios(prev => [novo, ...prev]);
    setDialogOpen(false);
    setForm({ nome: "", morada: "", codigoPostal: "", cidade: "", nif: "", observacoes: "", ativo: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Condomínios</h1>
          <p className="text-sm text-muted-foreground">{condominios.length} condomínios registados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-1" /> Novo Condomínio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Condomínio</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} /></div>
              <div><Label>Morada</Label><Input value={form.morada} onChange={e => setForm(p => ({ ...p, morada: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Código Postal</Label><Input value={form.codigoPostal} onChange={e => setForm(p => ({ ...p, codigoPostal: e.target.value }))} /></div>
                <div><Label>Cidade</Label><Input value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))} /></div>
              </div>
              <div><Label>NIF</Label><Input value={form.nif} onChange={e => setForm(p => ({ ...p, nif: e.target.value }))} /></div>
              <div><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} /></div>
              <div className="flex items-center gap-2">
                <Switch checked={form.ativo} onCheckedChange={v => setForm(p => ({ ...p, ativo: v }))} />
                <Label>Ativo</Label>
              </div>
              <Button onClick={handleCreate} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Criar Condomínio</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Pesquisar condomínios..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(c => (
          <button key={c.id} onClick={() => nav(`/condominios/${c.id}`)} className="stat-card text-left animate-fade-in">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent" />
                <span className="font-semibold text-sm">{c.nome}</span>
              </div>
              <Badge variant="outline" className={c.ativo ? "badge-priority-low" : "badge-status-closed"}>
                {c.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{c.morada}</p>
            <p className="text-xs text-muted-foreground">{c.codigoPostal} {c.cidade}</p>
            <p className="text-[11px] text-muted-foreground mt-2">NIF: {c.nif}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
