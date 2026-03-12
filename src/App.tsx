import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
          <Routes>
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
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
