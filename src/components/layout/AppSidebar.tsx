import {
  Building2, LayoutDashboard, AlertTriangle, Users, FileText,
  Calendar, Truck, CalendarDays, BarChart3, Brain, Settings, ListChecks, ScrollText,
} from 'lucide-react';
import logoCondflow from '@/assets/logo-condflow.png';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const mainItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Condomínios', url: '/condominios', icon: Building2 },
  { title: 'Ocorrências', url: '/ocorrencias', icon: AlertTriangle },
  { title: 'Assembleias', url: '/assembleias', icon: Calendar },
  { title: 'Documentos', url: '/documentos', icon: FileText },
  { title: 'Stakeholders', url: '/stakeholders', icon: Users },
  { title: 'Fornecedores', url: '/fornecedores', icon: Truck },
  { title: 'Tarefas', url: '/tarefas', icon: ListChecks },
  { title: 'Agenda', url: '/agenda', icon: CalendarDays },
  { title: 'Gerador de Atas', url: '/gerador-ata', icon: ScrollText },
];

const secondaryItems = [
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
  { title: 'Central IA', url: '/ia', icon: Brain },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) =>
    path === '/' ? currentPath === '/' : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-2">
          {collapsed ? (
            <img src={logoCondflow} alt="CondFlow" className="h-8 w-8 object-contain shrink-0" />
          ) : (
            <img src={logoCondflow} alt="CondFlow" className="h-8 object-contain" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-widest font-medium px-3 mb-1">
            Operações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="rounded-lg px-3 py-2 text-[13px] text-sidebar-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-widest font-medium px-3 mb-1">
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={false}
                      className="rounded-lg px-3 py-2 text-[13px] text-sidebar-foreground transition-colors duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        {!collapsed && (
          <p className="text-[10px] text-sidebar-muted text-center tracking-wide">
            CondFlow v1.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
