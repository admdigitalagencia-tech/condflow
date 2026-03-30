import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

// App pages
import Dashboard from '@/pages/Dashboard';
import Condominios from '@/pages/Condominios';
import CondominioDetail from '@/pages/CondominioDetail';
import Ocorrencias from '@/pages/Ocorrencias';
import OcorrenciaDetail from '@/pages/OcorrenciaDetail';
import Assembleias from '@/pages/Assembleias';
import AssembleiaDetail from '@/pages/AssembleiaDetail';
import MinutesEditor from '@/pages/MinutesEditor';
import Documentos from '@/pages/Documentos';
import Stakeholders from '@/pages/Stakeholders';
import Fornecedores from '@/pages/Fornecedores';
import Agenda from '@/pages/Agenda';
import Relatorios from '@/pages/Relatorios';
import CentralIA from '@/pages/CentralIA';
import Configuracoes from '@/pages/Configuracoes';
import Tarefas from '@/pages/Tarefas';
import GeradorAta from '@/pages/GeradorAta';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

const queryClient = new QueryClient();

function AuthGate() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">A carregar sessão...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function GuestOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">A carregar sessão...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <OrganizationProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<GuestOnlyRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                <Route element={<AuthGate />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/condominios" element={<Condominios />} />
                  <Route path="/condominios/:id" element={<CondominioDetail />} />
                  <Route path="/ocorrencias" element={<Ocorrencias />} />
                  <Route path="/ocorrencias/:id" element={<OcorrenciaDetail />} />
                  <Route path="/assembleias" element={<Assembleias />} />
                  <Route path="/assembleias/:id" element={<AssembleiaDetail />} />
                  <Route path="/assembleias/:id/ata/:minuteId" element={<MinutesEditor />} />
                  <Route path="/documentos" element={<Documentos />} />
                  <Route path="/stakeholders" element={<Stakeholders />} />
                  <Route path="/fornecedores" element={<Fornecedores />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/ia" element={<CentralIA />} />
                  <Route path="/tarefas" element={<Tarefas />} />
                  <Route path="/gerador-ata" element={<GeradorAta />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </OrganizationProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
