import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';

// Auth pages
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';

// App pages
import Dashboard from '@/pages/Dashboard';
import Condominios from '@/pages/Condominios';
import CondominioDetail from '@/pages/CondominioDetail';
import Ocorrencias from '@/pages/Ocorrencias';
import Assembleias from '@/pages/Assembleias';
import Documentos from '@/pages/Documentos';
import Stakeholders from '@/pages/Stakeholders';
import Fornecedores from '@/pages/Fornecedores';
import Agenda from '@/pages/Agenda';
import Relatorios from '@/pages/Relatorios';
import CentralIA from '@/pages/CentralIA';
import Configuracoes from '@/pages/Configuracoes';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/condominios" element={<ProtectedRoute><AppLayout><Condominios /></AppLayout></ProtectedRoute>} />
            <Route path="/condominios/:id" element={<ProtectedRoute><AppLayout><CondominioDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/ocorrencias" element={<ProtectedRoute><AppLayout><Ocorrencias /></AppLayout></ProtectedRoute>} />
            <Route path="/assembleias" element={<ProtectedRoute><AppLayout><Assembleias /></AppLayout></ProtectedRoute>} />
            <Route path="/documentos" element={<ProtectedRoute><AppLayout><Documentos /></AppLayout></ProtectedRoute>} />
            <Route path="/stakeholders" element={<ProtectedRoute><AppLayout><Stakeholders /></AppLayout></ProtectedRoute>} />
            <Route path="/fornecedores" element={<ProtectedRoute><AppLayout><Fornecedores /></AppLayout></ProtectedRoute>} />
            <Route path="/agenda" element={<ProtectedRoute><AppLayout><Agenda /></AppLayout></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><AppLayout><Relatorios /></AppLayout></ProtectedRoute>} />
            <Route path="/ia" element={<ProtectedRoute><AppLayout><CentralIA /></AppLayout></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><AppLayout><Configuracoes /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
