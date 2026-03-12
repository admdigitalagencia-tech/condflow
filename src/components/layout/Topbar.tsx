import { Search, Bell, Plus, ChevronDown, Settings, User, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

export function Topbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 flex items-center border-b border-border/60 bg-card/80 backdrop-blur-sm px-4 shrink-0 gap-3 sticky top-0 z-30">
      <SidebarTrigger className="mr-1 text-muted-foreground hover:text-foreground transition-colors" />

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input
          placeholder="Pesquisar condomínios, ocorrências..."
          className="pl-9 h-9 bg-muted/40 border-0 rounded-lg text-sm placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-ring/40 focus-visible:bg-card transition-colors"
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Quick actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5 h-8 rounded-lg text-xs font-medium shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Novo</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate('/ocorrencias')} className="text-sm">Nova Ocorrência</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/condominios')} className="text-sm">Novo Condomínio</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/assembleias')} className="text-sm">Nova Assembleia</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9 px-2 rounded-lg hover:bg-muted/60 transition-colors">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                <span className="text-xs font-semibold text-primary">G</span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2.5">
              <p className="text-sm font-medium">Gestor</p>
              <p className="text-xs text-muted-foreground">gestor@condoflow.pt</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/configuracoes')} className="text-sm">
              <Settings className="h-4 w-4 mr-2" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/configuracoes')} className="text-sm">
              <User className="h-4 w-4 mr-2" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm text-muted-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Terminar Sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
