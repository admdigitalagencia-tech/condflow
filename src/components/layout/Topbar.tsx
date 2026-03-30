import { Search, Bell, Plus, ChevronDown, Settings, User, LogOut, Sun, Moon, CalendarDays, ListChecks, AlertTriangle, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useDeadlineNotifications } from '@/hooks/useDeadlineNotifications';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

export function Topbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const notifications = useDeadlineNotifications();
  const { user, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Gestor';
  const displayEmail = user?.email || 'gestor@condflow.pt';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'G';

  const typeIcon = (type: string) => {
    switch (type) {
      case 'task': return <ListChecks className="h-4 w-4 text-primary" />;
      case 'ticket': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'assembly': return <Landmark className="h-4 w-4 text-blue-500" />;
      default: return <CalendarDays className="h-4 w-4" />;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

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

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-semibold">Notificações de Prazo</p>
              <p className="text-xs text-muted-foreground">{notifications.length} alertas pendentes</p>
            </div>
            {notifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Sem prazos próximos 🎉
              </div>
            ) : (
              <ScrollArea className="max-h-[320px]">
                {notifications.map(n => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex items-start gap-3 px-3 py-2.5 cursor-pointer"
                    onClick={() => navigate(n.route)}
                  >
                    <div className="mt-0.5">{typeIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant={n.urgency === 'today' ? 'destructive' : 'secondary'}
                          className="text-[10px] px-1.5"
                        >
                          {n.urgency === 'today' ? '⚠️ Vence hoje' : '⏰ Vence amanhã'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{n.typeLabel}</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/agenda')} className="text-sm text-center justify-center text-primary font-medium">
              Ver agenda completa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9 px-2 rounded-lg hover:bg-muted/60 transition-colors">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                <span className="text-xs font-semibold text-primary">{initials}</span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2.5">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{displayEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/configuracoes')} className="text-sm">
              <Settings className="h-4 w-4 mr-2" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/configuracoes')} className="text-sm">
              <User className="h-4 w-4 mr-2" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void handleSignOut()} className="text-sm text-muted-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Terminar Sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
